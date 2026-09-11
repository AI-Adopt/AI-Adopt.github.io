const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateROI, calculateROIScenarios, defaultROIInputs, normalizeROIInputs, opportunityROIInputs, MONEY_FIELDS } = require('../src/lib/roi.ts');
const { generateOpportunities, priceOpportunity } = require('../src/lib/opportunities.ts');
const { normalizeStoredState } = require('../src/context/assessment-provider.tsx');
const { businessCaseCSV } = require('../src/lib/financial-export.ts');
const { ADVISORY_COPY } = require('../src/lib/advisory-copy.ts');
const { SOLUTIONS } = require('../src/lib/solution-catalog.ts');
const { translateKey } = require('../src/context/language-provider.tsx');

const near = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const base = () => ({ ...defaultROIInputs(10, 50, 12000), averageSalary: 44000, employerCostPercent: 0, tasksPerMonth: 880, minutesPerTask: 10, reviewPercent: 20, cashRealizationPercent: 50, implementationMonths: 0, rampMonths: 1, contingencyPercent: 0, monthlyLicensingCost: 100, monthlyMaintenanceCost: 0, monthlyMonitoringCost: 0, costPerTask: 0, startMonth: '2026-01' });
const onboarding = { industry: 'Technology', companySize: '51-200', departments: ['Customer Support', 'Operations'], businessProcesses: '', repetitiveWorkflows: [], manualOperationsHours: 0, currency: 'EUR', averageSalary: 44000, processes: [{ id: 'customer-support', employeeCount: 10, tasksPerMonth: 880, minutesPerTask: 10, errorRatePercent: 0, errorCost: 0, cashRealizationPercent: 50, evidence: 'measured' }, { id: 'document-processing', employeeCount: 3, tasksPerMonth: 200, minutesPerTask: 5, errorRatePercent: 0, errorCost: 0, cashRealizationPercent: 0, evidence: 'estimate' }] };

test('hand-calculated business case: workload, cash, TCO, ROI, payback and 24 months', () => {
  const r = calculateROI(base());
  near(r.baselineHours, 1760); near(r.baselineAnnualCost, 44000); near(r.hoursSaved, 704);
  near(r.capacityValue, 17600); near(r.cashLaborSavings, 8800); near(r.annualSavings, 7600);
  near(r.totalCost12, 13200); near(r.netFirstYearSavings, -4400); near(r.roi12Month, -100 / 3);
  near(r.value24Month, 3200); near(r.paybackMonths, 12000 / (7600 / 12)); assert.equal(r.breakEvenDate, '2027-07');
  assert.equal(r.monthlyData.length, 37); assert.equal(r.monthlyData[0].net, -12000);
  near(r.npv36, -12000 + r.monthlyData.slice(1).reduce((sum, p) => sum + p.cashFlow / Math.pow(1.1, p.period / 12), 0));
});
test('freed salaried time is not automatically cash', () => {
  const r = calculateROI({ ...base(), cashRealizationPercent: 0 });
  assert.equal(r.capacityValue, 17600); assert.equal(r.cashLaborSavings, 0);
  near(r.annualSavings, -1200); assert.equal(r.paybackMonths, null); assert.equal(r.verdict, 'defer');
});
test('delivery and ramp suppress benefits, but fixed costs begin immediately', () => {
  const r = calculateROI({ ...base(), implementationMonths: 2, rampMonths: 4 });
  assert.equal(r.monthlyData[1].benefit, 0); assert.equal(r.monthlyData[2].benefit, 0);
  near(r.monthlyData[3].benefit, 8800 / 12 / 4); near(r.monthlyData[6].benefit, 8800 / 12);
  assert.equal(r.monthlyData[1].operatingCost, 100);
});
test('review consumes saved time; overlapping productivity knobs do not inflate benefits', () => {
  const b = base(); const result = calculateROI(b);
  near(calculateROI({ ...b, productivityIncreasePercent: 100, manualWorkReductionPercent: 100, processAccelerationPercent: 100 }).annualSavings, result.annualSavings);
  assert.equal(calculateROI({ ...b, reviewPercent: 100 }).hoursSaved, 0);
});
test('capacity cap bounds labor and error benefits to the feasible workload', () => {
  const r = calculateROI({ ...base(), employeeCount: 1, tasksPerMonth: 1000000, automationPercent: 100, reviewPercent: 0, errorRatePercent: 10, errorCost: 10, errorReductionPercent: 100 });
  assert.equal(r.capacityCapped, true); near(r.baselineHours, 1760); near(r.hoursSaved, 1760);
  near(r.errorSavings, 10560); assert.ok(r.cashLaborSavings <= r.baselineAnnualCost);
});
test('no investment is not instant payback if recurring costs produce losses', () => {
  const i = base(); for (const key of MONEY_FIELDS) i[key] = 0; i.monthlyMaintenanceCost = 100;
  const r = calculateROI(i); assert.equal(r.paybackMonths, null); assert.equal(r.roi12Month, -100);
});
test('zero-cost model has undefined ROI, not Infinity, and zero-cost positive cash recovers at M0', () => {
  const i = base(); for (const key of MONEY_FIELDS) i[key] = 0;
  const zero = calculateROI(i); assert.equal(zero.roi12Month, null); assert.equal(zero.benefitCostRatio, null);
  assert.equal(zero.paybackMonths, 0); assert.equal(zero.npv36, 0);
});
test('scenario stressors are editable and use benefits, costs and delay', () => {
  const [low, mid, high] = calculateROIScenarios({ ...base(), downsideBenefitPercent: 50, downsideCostPercent: 150, downsideDelayMonths: 2 });
  assert.ok(low.npv36 < mid.npv36); assert.ok(mid.npv36 < high.npv36);
  near(low.implementationCost, 18000); assert.equal(low.goLiveMonth, 3);
});
test('each measured process creates exactly one opportunity and uses its own workload', () => {
  const opportunities = generateOpportunities(onboarding); assert.equal(opportunities.length, 2);
  for (const o of opportunities) near(o.annualSavings, calculateROI(opportunityROIInputs(o, onboarding)).annualSavings);
  const support = opportunities.find(o => o.id === 'customer-support');
  assert.equal(opportunityROIInputs(support, onboarding).employeeCount, 10); assert.equal(support.evidence, 'measured');
});
test('editing one opportunity cannot change another and survives hydration', () => {
  const opportunities = generateOpportunities(onboarding); const first = opportunities[0];
  const edited = { ...opportunityROIInputs(first, onboarding), averageSalary: 60000, currency: 'GBP', scenario: 'conservative', modelVersion: 3 };
  const stored = { onboarding, opportunities, selectedOpportunityId: first.id, roiInputs: edited, roiByOpportunity: { [first.id]: edited }, recommendation: { opportunity: first } };
  const state = normalizeStoredState(JSON.parse(JSON.stringify(stored)));
  near(state.opportunities[0].annualSavings, calculateROI(edited).annualSavings);
  near(state.opportunities[1].annualSavings, opportunities[1].annualSavings);
  near(state.recommendation.roiSnapshot.annualSavings, state.opportunities[0].annualSavings);
  assert.equal(state.recommendation.currency, 'GBP'); assert.equal(state.recommendation.inputs.scenario, 'conservative');
});
test('legacy stale savings and recommendations are recomputed, no arbitrary company-size team', () => {
  const opportunities = generateOpportunities(onboarding);
  const state = normalizeStoredState({ onboarding: { ...onboarding, processes: undefined, companySize: '1000+' }, opportunities, selectedOpportunityId: opportunities[0].id, roiInputs: { employeeCount: 200, softwareCost: 18000 }, recommendation: { roiSnapshot: { annualSavings: 999999 } } });
  assert.equal(state.roiInputs.employeeCount, 1); assert.notEqual(state.recommendation.roiSnapshot.annualSavings, 999999);
});
test('currency conversion scales values but does not change ROI or recovery', () => {
  const original = base(); const converted = { ...original, currency: 'GBP' };
  for (const key of MONEY_FIELDS) converted[key] *= .84;
  const a = calculateROI(original), b = calculateROI(converted);
  near(b.annualSavings, a.annualSavings * .84); near(b.roi12Month, a.roi12Month); near(b.paybackMonths, a.paybackMonths);
});
test('corrupt numeric inputs are sanitized to finite bounded outcomes', () => {
  const i = normalizeROIInputs({ employeeCount: NaN, averageSalary: Infinity, workingDays: 0, hoursPerDay: -10, automationPercent: 500, currency: 'BAD', scenario: 'BAD', startMonth: '2026-99' });
  assert.equal(i.currency, 'EUR'); assert.equal(i.hoursPerDay, 1); assert.equal(i.automationPercent, 100);
  const r = calculateROI(i); for (const value of Object.values(r)) if (typeof value === 'number') assert.ok(Number.isFinite(value));
});
test('discount rate affects NPV, not nominal payback or first-year savings', () => {
  const a = calculateROI({ ...base(), discountRate: 0 }), b = calculateROI({ ...base(), discountRate: 30 });
  assert.ok(a.npv36 > b.npv36); near(a.paybackMonths, b.paybackMonths); near(a.annualSavings, b.annualSavings);
});
test('all financial outputs reconcile to the monthly ledger across 100 deterministic cases', () => {
  for (let n = 0; n < 100; n++) {
    const i = { ...base(), employeeCount: n % 7, automationPercent: n, reviewPercent: n % 40, cashRealizationPercent: n, implementationMonths: n % 5, tasksPerMonth: n * 100, monthlyApiCost: n * 5 };
    const r = calculateROI(i);
    near(r.netFirstYearSavings, r.monthlyData[12].net);
    near(r.annualSavings - r.implementationCost, r.netFirstYearSavings);
    assert.ok(r.hoursSaved <= r.baselineHours); assert.ok(r.peakFunding >= r.implementationCost);
    assert.ok(r.difficultyScore === undefined);
    for (const value of Object.values(r)) if (typeof value === 'number') assert.ok(Number.isFinite(value));
  }
});
test('CSV is spreadsheet-safe and includes all inputs and 37 monthly points', () => {
  const csv = businessCaseCSV({ ...base(), notes: '=HYPERLINK("bad")' }, '=unsafe', k => k);
  assert.ok(csv.includes("'=unsafe")); assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(csv.includes('cashRealizationPercent')); assert.ok(csv.includes('"36"'));
});
test('all advisory strings and solution descriptions exist in six languages', () => {
  for (const [key, values] of Object.entries(ADVISORY_COPY)) {
    assert.equal(values.length, 6, key); for (const value of values) assert.ok(typeof value === 'string' && value.length > 0, key);
    const placeholders = value => [...value.matchAll(/\{\w+\}/g)].map(m => m[0]).sort();
    for (const value of values) assert.deepEqual(placeholders(value), placeholders(values[0]), key);
  }
  for (const solution of SOLUTIONS) assert.ok(ADVISORY_COPY[`solution.${solution.id}.description`]);
});
test('matrix metrics are bounded and the projected numbers are shared with ROI', () => {
  for (const o of generateOpportunities(onboarding)) {
    const priced = priceOpportunity(o, onboarding, { cashRealizationPercent: 80 });
    assert.ok(priced.valueScore >= 0 && priced.valueScore <= 10); assert.ok(priced.difficultyScore >= 0 && priced.difficultyScore <= 10);
    assert.ok(priced.priorityScore >= 0 && priced.priorityScore <= 100); near(priced.annualSavings, priced.roi.annualSavings);
  }
});

test('error savings require automation coverage, not just an error-reduction percentage', () => {
  const i = { ...base(), automationPercent: 0, errorRatePercent: 10, errorCost: 50, errorReductionPercent: 100 };
  assert.equal(calculateROI(i).errorSavings, 0);
});

test('positive cash case cannot skip budget and target-date validation', () => {
  const i = { ...base(), evidence: 'measured', dataQuality: 90, processMaturity: 90, adoptionReadiness: 90, infrastructureReadiness: 90, budget: 1 };
  assert.ok(calculateROI(i).npv36 > 0); assert.equal(calculateROI(i).verdict, 'validate');
  assert.equal(calculateROI({ ...i, budget: 100000, targetMonths: 1, implementationMonths: 2 }).verdict, 'validate');
});

test('visible static interface copy does not fall back to English or raw keys', () => {
  const fs = require('node:fs'); const path = require('node:path'); const root = path.resolve(__dirname, '../src');
  const files = fs.readdirSync(root, { recursive: true }).filter(p => p.endsWith('.tsx') && !p.includes('language-provider'));
  const keys = new Set(files.flatMap(p => [...fs.readFileSync(path.join(root, p), 'utf8').matchAll(/\bt\("([^"]+)"/g)].map(m => m[1])));
  for (const key of keys) for (const language of ['es', 'fr', 'de', 'pt', 'it']) {
    assert.notEqual(translateKey(language, key), key, `${language}:${key} missing`);
    assert.notEqual(translateKey(language, key), translateKey('en', key), `${language}:${key} falls back to English`);
  }
});

test('damaged stored form data is normalized without a client-side exception', () => {
  const restored = normalizeStoredState({ onboarding: { industry: 42, departments: 'invalid', processes: { broken: true } }, opportunities: generateOpportunities(onboarding), recommendation: {} });
  assert.equal(restored.onboarding.industry, ''); assert.deepEqual(restored.onboarding.departments, []);
  assert.equal(restored.onboarding.processes, undefined);
});
