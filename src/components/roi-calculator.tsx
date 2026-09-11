"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FinancialField } from "@/components/financial-field";
import { Button } from "@/components/ui/button";
import { calculateROI, calculateROIScenarios, MONEY_FIELDS } from "@/lib/roi";
import { businessCaseCSV } from "@/lib/financial-export";
import type { Currency, ROIInputs, ROIResults } from "@/types/assessment";
import { useLanguage } from "@/context/language-provider";

const GROUPS: { title: string; fields: (keyof ROIInputs)[] }[] = [
  { title: "currentOperationalCosts", fields: ["employeeCount", "averageSalary", "employerCostPercent", "workingDays", "hoursPerDay", "tasksPerMonth", "minutesPerTask", "currentOperationalCost", "errorRatePercent", "errorCost"] },
  { title: "efficiencyAssumptions", fields: ["automationPercent", "reviewPercent", "cashRealizationPercent", "errorReductionPercent", "otherCostReductionPercent"] },
  { title: "aiImplementationCosts", fields: ["developmentCost", "consultingCost", "infrastructureCost", "softwareCost", "integrationCost", "trainingCost", "contingencyPercent"] },
  { title: "ongoingCosts", fields: ["monthlyApiCost", "monthlyLicensingCost", "costPerTask", "monthlyMaintenanceCost", "monthlyMonitoringCost", "annualRetrainingCost", "monthlySupportCost", "monthlyOperationalMaintenanceCost"] },
  { title: "advice.sensitivity", fields: ["budget", "targetMonths", "implementationMonths", "rampMonths", "discountRate", "downsideBenefitPercent", "downsideCostPercent", "downsideDelayMonths", "upsideBenefitPercent", "upsideCostPercent"] },
  { title: "advice.readiness", fields: ["implementationDifficulty", "dataQuality", "processMaturity", "adoptionReadiness", "infrastructureReadiness"] },
];
const LEGACY_LABELS: Partial<Record<keyof ROIInputs, string>> = { averageSalary: "averageSalary", employeeCount: "employeeCount", tasksPerMonth: "tasksPerMonth", currentOperationalCost: "currentOperationalCost", automationPercent: "expectedAutomation", reviewPercent: "reviewTime", errorReductionPercent: "errorReduction", developmentCost: "developmentCost", consultingCost: "consultingCost", infrastructureCost: "infrastructureCost", softwareCost: "softwareCost", integrationCost: "integrationCost", trainingCost: "trainingCost", monthlyApiCost: "monthlyApiCost", monthlyLicensingCost: "monthlyLicensingCost", monthlyMaintenanceCost: "monthlyMaintenanceCost", monthlyMonitoringCost: "monitoringCost", annualRetrainingCost: "modelRetrainingCost", monthlySupportCost: "supportCost", monthlyOperationalMaintenanceCost: "operationalMaintenance", dataQuality: "dataQuality", processMaturity: "processMaturity", adoptionReadiness: "adoptionReadiness", infrastructureReadiness: "infrastructureReadiness" };
const READINESS = ["dataQuality", "processMaturity", "adoptionReadiness", "infrastructureReadiness"];

export function ROICalculator({ inputs, onChange, title = "AdoptAI" }: { inputs: ROIInputs; onChange: (inputs: Partial<ROIInputs>) => void; title?: string }) {
  const { t, language } = useLanguage();
  const [group, setGroup] = useState(0);
  const [targetCurrency, setTargetCurrency] = useState<Currency>(inputs.currency);
  const [exchangeRate, setExchangeRate] = useState(0);
  const scenarios = useMemo(() => calculateROIScenarios(inputs), [inputs]);
  const results = useMemo(() => calculateROI(inputs), [inputs]);
  const money = (value: number) => new Intl.NumberFormat(language, { style: "currency", currency: inputs.currency, maximumFractionDigits: 0 }).format(value);
  const number = (value: number, digits = 1) => new Intl.NumberFormat(language, { maximumFractionDigits: digits }).format(value);
  const roi = (r: ROIResults) => r.roi12Month === null ? t("advice.undefined") : `${number(r.roi12Month)}%`;
  const payback = (r: ROIResults) => r.paybackMonths === null ? t("advice.noPayback") : `${number(r.paybackMonths)} ${t("months").trim()}`;
  const label = (field: keyof ROIInputs) => t(LEGACY_LABELS[field] ?? `advice.${field}`);
  const exportCSV = () => {
    const blob = new Blob([businessCaseCSV(inputs, title, t)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `AdoptAI-business-case-${inputs.startMonth}-${inputs.currency}.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="space-y-12">
    <section className="hidden print:block">
      <h1 className="text-3xl font-semibold">AdoptAI · {title}</h1>
      <p>{inputs.currency} · {t(inputs.scenario)} · {inputs.startMonth}</p>
      {GROUPS.map(g => <div key={g.title} className="mt-6"><h2 className="text-xl font-semibold">{t(g.title)}</h2><dl className="mt-3 grid grid-cols-2 gap-3">{g.fields.map(field => <div key={field}><dt className="text-xs">{label(field)}</dt><dd>{MONEY_FIELDS.includes(field) ? money(inputs[field] as number) : number(inputs[field] as number)}</dd></div>)}</dl></div>)}
      <p className="mt-5">{t("advice.notes")}: {inputs.notes || t(`advice.${inputs.evidence}`)}</p>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-5 print:hidden">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("advice.modelNote")}</p>
      <div className="flex flex-wrap gap-3"><Button type="button" variant="secondary" onClick={exportCSV}>{t("advice.export")}</Button><Button type="button" variant="ghost" onClick={() => window.print()}>{t("advice.print")}</Button></div>
    </div>

    <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.8fr)]">
      <section>
        <p className="eyebrow mb-3">{t("editableEstimates")}</p>
        <h2 className="text-3xl font-semibold tracking-[-.04em] md:text-4xl">{t("businessCaseAssumptions")}</h2>
        <nav aria-label={t("businessCaseAssumptions")} className="my-6 flex flex-wrap gap-2 print:hidden">{GROUPS.map((g, index) => <button type="button" key={g.title} aria-pressed={group === index} onClick={() => setGroup(index)} className={`rounded-md border px-3 py-2 text-left text-xs font-medium ${group === index ? "border-[#2f1c4d] bg-[#2f1c4d] text-white" : "border-border hover:bg-secondary"}`}>{index + 1}. {t(g.title)}</button>)}</nav>
        <div className="rounded-2xl bg-secondary/60 p-5 md:p-7">
          <h3 className="text-xl font-semibold">{t(GROUPS[group].title)}</h3>
          <p className="mb-6 mt-3 text-sm leading-relaxed text-muted-foreground">{t(group === 0 ? "advice.measureHelp" : group === 1 ? "advice.cashHelp" : group === 2 || group === 3 ? "advice.costHelp" : group === 5 ? "advice.technologyHelp" : "scenarioHelp")}</p>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {GROUPS[group].fields.map(field => {
              const percent = field.endsWith("Percent") || READINESS.includes(field) || field === "discountRate";
              const max = field === "hoursPerDay" ? 24 : field === "workingDays" ? 366 : field === "implementationDifficulty" ? 10 : field.endsWith("Months") ? 36 : field === "downsideCostPercent" ? 300 : field === "upsideBenefitPercent" ? 200 : percent ? 100 : 100000000;
              const min = ["hoursPerDay", "workingDays", "rampMonths", "targetMonths"].includes(field) ? 1 : field === "downsideCostPercent" || field === "upsideBenefitPercent" ? 100 : 0;
              return <FinancialField key={field} label={label(field)} value={inputs[field] as number} min={min} max={max} suffix={MONEY_FIELDS.includes(field) ? inputs.currency : undefined} slider={percent && max === 100} onChange={value => onChange({ [field]: value })} />;
            })}
          </div>
          {group === 0 && <label className="mt-6 block text-sm">{t("mainAssumptions")}<select className="mt-2 w-full border-b border-border bg-transparent py-3" value={inputs.evidence} onChange={e => onChange({ evidence: e.target.value as ROIInputs["evidence"] })}><option value="estimate">{t("advice.estimate")}</option><option value="measured">{t("advice.measured")}</option></select></label>}
          {group === 4 && <label className="mt-6 block text-sm">{t("advice.startMonth")}<input className="mt-2 block border-b border-border bg-transparent py-3" type="month" value={inputs.startMonth} onChange={e => onChange({ startMonth: e.target.value })} /></label>}
          <div className="mt-7 flex justify-between gap-3 border-t border-border pt-4 print:hidden"><Button type="button" variant="ghost" disabled={group === 0} onClick={() => setGroup(group - 1)}>{t("back")}</Button><Button type="button" variant="secondary" disabled={group === GROUPS.length - 1} onClick={() => setGroup(group + 1)}>{t("continue")} →</Button></div>
        </div>
        <label className="mt-5 block text-sm text-muted-foreground">{t("advice.notes")}<textarea maxLength={5000} className="mt-2 min-h-24 w-full border-b border-border bg-transparent py-2 text-foreground" placeholder={t("advice.notesHelp")} value={inputs.notes} onChange={e => onChange({ notes: e.target.value })} /></label>
        <details className="mt-5 border-b border-border pb-5 print:hidden"><summary className="cursor-pointer text-sm font-medium">{t("currency")} · {inputs.currency}</summary><p className="my-4 text-sm text-muted-foreground">{t("advice.fxHelp")}</p><div className="flex flex-wrap items-end gap-4"><label className="text-sm">{t("currency")}<select className="ml-3 border-b border-border bg-transparent p-2" value={targetCurrency} onChange={e => { setTargetCurrency(e.target.value as Currency); setExchangeRate(0); }}>{["EUR", "GBP", "USD", "CHF"].map(c => <option key={c}>{c}</option>)}</select></label><FinancialField label={t("advice.fxRate", { from: inputs.currency, to: targetCurrency })} value={exchangeRate} max={100000} onChange={setExchangeRate} /><Button type="button" disabled={targetCurrency === inputs.currency || !Number.isFinite(exchangeRate) || exchangeRate <= 0} onClick={() => { const converted: Partial<ROIInputs> = { currency: targetCurrency }; for (const key of MONEY_FIELDS) Object.assign(converted, { [key]: (inputs[key] as number) * exchangeRate }); onChange(converted); setExchangeRate(0); }}>{t("advice.apply")}</Button></div></details>
      </section>

      <aside className="rounded-[28px] bg-[#2f1c4d] p-6 text-white xl:sticky xl:top-6 md:p-8" aria-label={t("investmentDecision")}>
        <p className="text-xs text-white/65">{title} · {t(inputs.scenario)}</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.04em]">{t(`advice.${results.verdict}`)}</h2>
        <div className="my-6 border-y border-white/20 py-5"><p className="text-xs text-white/65">{t("advice.cashYear1")}</p><p data-testid="roi-annual-savings" className="mt-2 break-words text-4xl font-semibold tracking-[-.045em]">{money(results.annualSavings)}</p></div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-6">
          <Metric label={t("roi12")} value={roi(results)} />
          <Metric label={t("advice.npv36")} value={money(results.npv36)} />
          <Metric label={t("paybackPeriod")} value={payback(results)} />
          <Metric label={t("advice.peakFunding")} value={money(results.peakFunding)} />
          <Metric label={t("advice.readiness")} value={number(results.confidenceScore, 0)} />
          <Metric label={t("advice.hoursSaved")} value={number(results.hoursSaved, 0)} />
        </dl>
        <p className="mt-7 text-xs leading-relaxed text-white/65">{t(`advice.${inputs.evidence}`)}. {t("advice.cashHelp")}</p>
      </aside>
    </div>
    {results.capacityCapped && <p role="status" className="border-l-4 border-[#e4ac93] bg-[#f7eee5] p-5 text-sm">{t("advice.capWarning")}</p>}
    {((inputs.budget > 0 && results.peakFunding > inputs.budget) || results.goLiveMonth > inputs.targetMonths) && <p role="status" className="border-l-4 border-[#c6b3e1] p-5 text-sm">{t("advice.constraintWarning")}</p>}

    <section>
      <p className="eyebrow mb-3">{t("scenarioComparison")}</p><h2 className="text-3xl font-semibold tracking-[-.04em] md:text-5xl">{t("threePossibleOutcomes")}</h2>
      <div className="mt-7 grid gap-3 lg:grid-cols-3">{scenarios.map(s => <button type="button" key={s.scenario} aria-pressed={s.scenario === inputs.scenario} onClick={() => onChange({ scenario: s.scenario })} className={`border-t-2 p-5 text-left ${s.scenario === inputs.scenario ? "border-[#765ca1] bg-[#eee7f7]" : "border-border"}`}><span className="text-sm font-semibold">{t(s.scenario)}</span><span className="mt-5 block text-4xl font-semibold tracking-tight">{roi(s)}</span><span className="mt-2 block text-xs text-muted-foreground">{t("roi12")}</span><span className="mt-6 block border-t border-border pt-4 text-sm">{t("advice.cashYear1")}<strong className="mt-1 block text-lg">{money(s.annualSavings)}</strong></span><span className="mt-3 block text-xs text-muted-foreground">{t("paybackPeriod")}: {payback(s)}</span></button>)}</div>
    </section>

    <section className="grid gap-x-10 gap-y-8 border-y border-border py-8 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label={t("totalImplementationCost")} value={money(results.implementationCost)} />
      <Metric label={t("advice.tco12")} value={money(results.totalCost12)} />
      <Metric label={t("netSavingsFirstYear")} value={money(results.netFirstYearSavings)} />
      <Metric label={t("value24")} value={money(results.value24Month)} />
      <Metric label={t("advice.steady")} value={money(results.steadyStateAnnualNet)} />
      <Metric label={t("advice.capacityValue")} value={money(results.capacityValue)} />
      <Metric label={t("efficiencyGain")} value={`${number(results.operationalEfficiencyGain)}%`} />
      <Metric label={t("breakEvenDate")} value={results.breakEvenDate ? new Intl.DateTimeFormat(language, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${results.breakEvenDate}-01T00:00:00Z`)) : t("advice.noPayback")} />
    </section>

    <section className="grid gap-8 lg:grid-cols-2">
      <ChartPanel title={t("investmentRecoveryTimeline")}><ResponsiveContainer width="100%" height="100%"><AreaChart data={results.monthlyData}><CartesianGrid vertical={false} stroke="#ddd6e5" /><XAxis dataKey="month" tick={{ fontSize: 10 }} interval={5} axisLine={false} tickLine={false} /><YAxis width={70} tick={{ fontSize: 10 }} tickFormatter={v => new Intl.NumberFormat(language, { notation: "compact" }).format(v)} axisLine={false} tickLine={false} /><Tooltip formatter={(v: number) => money(v)} /><ReferenceLine y={0} stroke="#765ca1" /><ReferenceLine x={`M${Math.min(36, results.goLiveMonth)}`} stroke="#b38d7b" strokeDasharray="3 3" /><Area isAnimationActive={false} type="linear" dataKey="net" name={t("netValue")} stroke="#765ca1" fill="#d6c8e8" /></AreaChart></ResponsiveContainer></ChartPanel>
      <ChartPanel title={t("costBeforeAfter")}><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: t("beforeAi"), cost: results.costBeforeAI }, { name: t("afterAi"), cost: results.costAfterAI }]}><CartesianGrid vertical={false} stroke="#e4ddd6" /><XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis width={70} tick={{ fontSize: 10 }} tickFormatter={v => new Intl.NumberFormat(language, { notation: "compact" }).format(v)} axisLine={false} tickLine={false} /><Tooltip formatter={(v: number) => money(v)} /><Bar isAnimationActive={false} dataKey="cost" name={t("annualCost")} fill="#e6b59e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartPanel>
    </section>

    <section className="grid gap-10 border-t border-border pt-8 md:grid-cols-2">
      <div><h2 className="text-2xl font-semibold">{t("formulaExplanation")}</h2><ol className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">{[1, 2, 3, 4].map(n => <li key={n}>{n}. {t(`advice.formula${n}`)}</li>)}</ol><p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("advice.errorFormula")}</p><a className="mt-5 inline-block text-sm underline underline-offset-4" href="https://www.gov.uk/government/publications/the-green-book-appraisal-and-evaluation-in-central-government/the-green-book-2026" target="_blank" rel="noopener noreferrer">HM Treasury · The Green Book (2026) ↗</a></div>
      <div><h2 className="text-2xl font-semibold">{t("mainAssumptions")}</h2><div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground"><p>{t("advice.costHelp")}</p><p>{t("advice.technologyHelp")}</p><p>{t("advice.noPortfolioSum")}</p><p>{t("advice.modelNote")}</p></div><details className="mt-6"><summary className="cursor-pointer text-sm font-medium">{t("financialBreakdown")} · 12 {t("months")}</summary><div className="mt-4 overflow-x-auto"><table className="w-full text-right text-xs"><thead><tr><th className="py-3 text-left">M</th><th>{t("advice.monthlyBenefit")}</th><th>{t("ongoingCosts")}</th><th>{t("netValue")}</th></tr></thead><tbody>{results.monthlyData.slice(0, 13).map(row => <tr className="border-t border-border" key={row.period}><th className="py-3 text-left">{row.month}</th><td>{money(row.benefit)}</td><td>{money(row.operatingCost)}</td><td>{money(row.net)}</td></tr>)}</tbody></table></div></details></div>
    </section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs leading-relaxed opacity-65">{label}</dt><dd className="mt-2 break-words text-xl font-semibold tracking-tight">{value}</dd></div>; }
function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="min-w-0 rounded-2xl bg-secondary/50 p-5"><h3 className="text-xl font-semibold">{title}</h3><div className="mt-6 h-72" role="img" aria-label={title}>{children}</div></div>; }
