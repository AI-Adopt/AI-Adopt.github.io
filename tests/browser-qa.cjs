// Run after build. Uses Playwright from the project or PLAYWRIGHT_MODULE.
require('./register.cjs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { calculateROI } = require('../src/lib/roi.ts');
const { defaultROIInputs } = require('../src/lib/roi.ts');
const { generateOpportunities } = require('../src/lib/opportunities.ts');
const root = path.resolve(__dirname, '../out');
const artifacts = path.resolve(__dirname, '../artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const server = http.createServer((req, res) => {
  let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/plain', '.woff2': 'font/woff2', '.json': 'application/json' };
  res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream'); fs.createReadStream(file).pipe(res);
});
const errors = [];
const state = page => page.evaluate(() => JSON.parse(localStorage.getItem('adopt-ai-assessment')));
const noOverflow = async (page, where) => {
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)) {
    await page.screenshot({ path: path.join(artifacts, 'overflow.png'), fullPage: true });
    const overflowing = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 2).map(el => ({ tag: el.tagName, text: el.textContent.slice(0, 70), class: el.className, right: el.getBoundingClientRect().right })).slice(0, 15));
    assert.fail(`${where}: horizontal overflow ${JSON.stringify(overflowing)}`);
  }
};
const visibleSubmit = async page => {
  const bounds = await page.locator('form button[type=submit]').boundingBox();
  assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= page.viewportSize().height + 1, 'Form submit is outside viewport');
};
const submit = async page => { await visibleSubmit(page); await page.locator('form button[type=submit]').click(); };

(async () => {
  await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    for (const language of ['en', 'es', 'fr', 'de', 'pt', 'it']) {
      for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 640 }]) {
        const context = await browser.newContext({ viewport, locale: language, reducedMotion: 'reduce' });
        await context.addInitScript(lang => { localStorage.setItem('adopt-ai-language', lang); }, language);
        const page = await context.newPage();
        page.on('pageerror', e => errors.push(`${language}: ${e.message}`));
        await page.goto('http://127.0.0.1:4173/');
        await page.locator('h1').waitFor();
        await noOverflow(page, `landing ${language} ${viewport.width}`);
        const start = page.locator('section').first().locator('a[href="/onboarding/"]').first();
        const bounds = await start.boundingBox();
        assert.ok(bounds && bounds.y + bounds.height < viewport.height, `Landing start outside viewport: ${language} ${viewport.width}, ${JSON.stringify(bounds)}`);
        if (language === 'es' && viewport.width === 1440) await page.screenshot({ path: path.join(artifacts, 'landing-es.png') });
        // The interactive landing preview must enter at the first assessment step.
        await page.locator('button').filter({ hasText: /^(Continue|Continuar|Continuer|Weiter|Continua)/ }).first().click();
        await page.waitForURL('**/onboarding/');
        await visibleSubmit(page);
        assert.equal(await page.locator('form [role=progressbar]').getAttribute('aria-valuenow'), '1');
        await submit(page);
        await page.locator('form input[type=number]').nth(0).fill('50000');
        await submit(page);
        const choices = page.locator('form button[aria-pressed]');
        await choices.nth(0).click(); await choices.nth(1).click(); await choices.nth(9).click();
        await submit(page);
        for (let process = 0; process < 3; process++) {
          const fields = page.locator('form input[type=number]');
          for (const [index, value] of [process === 0 ? '12' : '5', '1500', '10', '2', '5', '80'].entries()) await fields.nth(index).fill(value);
          await page.locator('form button[aria-pressed]').nth(1).click();
          await page.locator('form textarea').fill('Measured sample; pilot validation and signed supplier quote pending.');
          await visibleSubmit(page);
          if (process === 0 && language === 'es' && viewport.width === 390) await page.screenshot({ path: path.join(artifacts, 'assessment-mobile-es.png') });
          await submit(page);
        }
        for (const field of await page.locator('form input[type=number]').all()) await field.fill('80');
        await page.locator('form button[aria-pressed]').first().click();
        await submit(page); await submit(page);
        await page.waitForURL('**/analysis/');
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('adopt-ai-assessment')).opportunities.length === 3);
        await noOverflow(page, `analysis ${language}`);
        await page.locator('article button').first().click();
        await page.waitForURL('**/roi/');
        await page.getByTestId('roi-annual-savings').waitFor();
        await noOverflow(page, `roi ${language}`);
        let saved = await state(page);
        const selectedId = saved.selectedOpportunityId;
        const field = page.locator('input[type=number]').nth(1);
        await field.fill('60000'); await field.blur();
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('adopt-ai-assessment')).roiInputs.averageSalary === 60000);
        saved = await state(page);
        const financial = calculateROI(saved.roiInputs);
        const formatted = new Intl.NumberFormat(language, { style: 'currency', currency: saved.roiInputs.currency, maximumFractionDigits: 0 }).format(financial.annualSavings);
        assert.equal(await page.getByTestId('roi-annual-savings').textContent(), formatted);
        assert.equal(saved.opportunities.find(o => o.id === selectedId).annualSavings, financial.annualSavings);
        await page.reload(); await page.getByTestId('roi-annual-savings').waitFor();
        assert.equal((await state(page)).roiInputs.averageSalary, 60000);
        // Switch opportunity and back; custom assumptions must stay scoped.
        const selector = page.locator('main > section').first().locator('button');
        await selector.nth(1).click(); assert.notEqual((await state(page)).selectedOpportunityId, selectedId);
        await selector.nth(0).click(); assert.equal((await state(page)).roiInputs.averageSalary, 60000);
        if (language === 'es' && viewport.width === 1440) {
          await page.getByTestId('roi-annual-savings').scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(artifacts, 'roi-desktop-es.png') });
        }
        await page.locator('main > div.sticky button').click();
        await page.waitForURL('**/recommendation/');
        saved = await state(page);
        assert.equal(saved.recommendation.roiSnapshot.annualSavings, saved.opportunities.find(o => o.id === selectedId).annualSavings);
        assert.ok((await page.locator('article').first().innerText()).includes(formatted));
        await page.reload(); await page.locator('article h1').waitFor();
        assert.equal((await state(page)).recommendation.roiSnapshot.annualSavings, financial.annualSavings);
        await noOverflow(page, `recommendation ${language}`);
        assert.ok(!/advice\.|guide\.|solution\./.test(await page.locator('body').innerText()), `Untranslated key: ${language}`);
        await page.goto('http://127.0.0.1:4173/prioritize/');
        const matrixButton = page.locator('svg g[role=button]').first();
        await matrixButton.focus(); await page.keyboard.press('Enter'); await page.waitForURL('**/roi/');
        await context.close();
        console.log(`PASS ${language} ${viewport.width}x${viewport.height}: landing, full assessment, ROI, persistence, recommendation, matrix`);
      }
    }
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en', reducedMotion: 'reduce', acceptDownloads: true });
    const onboarding = { industry: 'Technology', companySize: '1-50', departments: ['Customer Support'], businessProcesses: '', repetitiveWorkflows: [], manualOperationsHours: 0, currency: 'EUR', processes: [{ id: 'customer-support', employeeCount: 10, tasksPerMonth: 1500, minutesPerTask: 10, errorRatePercent: 0, errorCost: 0, cashRealizationPercent: 80, evidence: 'measured' }] };
    const roiInputs = { ...defaultROIInputs(10, 60, 10000), tasksPerMonth: 1500, cashRealizationPercent: 80 };
    const seed = { onboarding, opportunities: generateOpportunities(onboarding), roiInputs, selectedOpportunityId: 'customer-support', roiByOpportunity: { 'customer-support': roiInputs }, recommendation: null };
    await context.addInitScript(seed => { if (!localStorage.getItem('adopt-ai-assessment')) { localStorage.setItem('adopt-ai-assessment', JSON.stringify(seed)); localStorage.setItem('adopt-ai-language', 'en'); } }, seed);
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/roi/'); await page.getByTestId('roi-annual-savings').waitFor();
    const original = calculateROI((await state(page)).roiInputs);
    const currency = page.locator('details').first(); await currency.locator('summary').click();
    await currency.locator('select').selectOption('GBP'); await currency.locator('input[type=number]').fill('0.84');
    await currency.getByRole('button').click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('adopt-ai-assessment')).roiInputs.currency === 'GBP');
    const converted = calculateROI((await state(page)).roiInputs);
    assert.ok(Math.abs(converted.annualSavings - original.annualSavings * .84) < 1e-6);
    assert.ok(Math.abs(converted.roi12Month - original.roi12Month) < 1e-6);
    await page.getByRole('button', { name: /^Conservative/ }).click();
    assert.equal((await state(page)).roiInputs.scenario, 'conservative');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download business case (CSV)', exact: true }).click();
    const download = await downloadEvent; await download.saveAs(path.join(artifacts, 'verified-case.csv'));
    const csv = fs.readFileSync(path.join(artifacts, 'verified-case.csv'), 'utf8');
    assert.ok(csv.includes('GBP') && csv.includes('conservative') && csv.includes('cashRealizationPercent'));
    await page.getByRole('button', { name: 'Who can implement this?', exact: true }).click();
    assert.ok((await page.locator('a[href*="solution-partner-program"]').count()) === 1);
    await page.getByRole('button', { name: 'What should I validate first?', exact: true }).click();
    assert.ok((await page.locator('body').innerText()).includes('acceptance criteria'));
    await page.getByRole('button', { name: 'Select language', exact: true }).click();
    await page.getByRole('button', { name: 'Español', exact: true }).click();
    assert.ok((await page.locator('body').innerText()).includes('Hipótesis de eficiencia'));
    await page.reload(); await page.getByTestId('roi-annual-savings').waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'es');
    await context.close();
    console.log('PASS interactive scenarios, currency conversion, CSV export, implementation guide and language switch');
    assert.deepEqual(errors, [], 'Client-side exceptions');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
