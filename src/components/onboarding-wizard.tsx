"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FinancialField } from "@/components/financial-field";
import { useAssessment } from "@/context/assessment-provider";
import { useLanguage } from "@/context/language-provider";
import { SOLUTIONS } from "@/lib/solution-catalog";
import type { CompanySize, Currency, OnboardingData, ProcessProfile } from "@/types/assessment";

const INDUSTRIES = [["Technology", "technology"], ["Financial Services", "financialServices"], ["Healthcare", "healthcare"], ["Retail", "retail"], ["Manufacturing", "manufacturing"], ["Professional Services", "professionalServices"], ["Other", "other"]];
const READINESS = ["dataQuality", "processMaturity", "adoptionReadiness", "infrastructureReadiness"] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const { onboarding, setOnboarding, completeOnboarding } = useAssessment();
  const { t, td } = useLanguage();
  const [step, setStep] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const data: OnboardingData = { industry: "", companySize: "1-50", departments: [], businessProcesses: "", repetitiveWorkflows: [], manualOperationsHours: 0,
    currency: "EUR", country: "", objective: "capacity", averageSalary: 40000, employerCostPercent: 25, workingDays: 220, hoursPerDay: 8, budget: 25000, targetMonths: 3,
    softwareStack: [], dataQuality: 50, processMaturity: 50, adoptionReadiness: 50, infrastructureReadiness: 50, ...onboarding };
  const processes = data.processes ?? [];
  const readinessStep = 3 + processes.length;
  const lastStep = readinessStep + 1;
  const process = processes[step - 3];
  const processDefinition = SOLUTIONS.find(s => s.id === process?.id);
  const key = step === 0 ? "company" : step === 1 ? "economics" : step === 2 ? "processes" : step < readinessStep ? "measure" : step === readinessStep ? "technology" : "review";
  const valid = step === 0 ? !!data.industry : step === 2 ? processes.length > 0 : true;
  const move = (next: number) => { setStep(next); scroller.current?.scrollTo(0, 0); };
  const updateProcess = (patch: Partial<ProcessProfile>) => setOnboarding({ processes: processes.map(p => p.id === process.id ? { ...p, ...patch } : p) });
  const toggleProcess = (id: string) => {
    const next = processes.some(p => p.id === id) ? processes.filter(p => p.id !== id) : [...processes, { id, employeeCount: 1, tasksPerMonth: 500, minutesPerTask: 10, cashRealizationPercent: 0, errorRatePercent: 0, errorCost: 0, evidence: "estimate" as const }];
    setOnboarding({ processes: next });
  };
  const finish = () => {
    const selected = SOLUTIONS.filter(s => processes.some(p => p.id === s.id));
    completeOnboarding({ ...data, processes, departments: [...new Set(selected.map(s => s.department))], repetitiveWorkflows: selected.map(s => s.workflow), manualOperationsHours: processes.reduce((sum, p) => sum + p.tasksPerMonth * p.minutesPerTask / 60 / (52 / 12), 0) });
    router.push("/analysis");
  };
  return <form onSubmit={e => { e.preventDefault(); if (valid) { if (step === lastStep) finish(); else move(step + 1); } }} className="mx-auto flex h-[100dvh] max-w-5xl flex-col overflow-hidden px-5 pb-[env(safe-area-inset-bottom)] pt-24 md:px-10 md:pt-28">
    <div className="shrink-0 pb-4">
      <div role="progressbar" aria-label={t("discovery")} aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={lastStep + 1} className="mb-3 h-1 bg-foreground/10"><div className="h-full bg-[#765ca1] transition-all" style={{ width: `${(step + 1) / (lastStep + 1) * 100}%` }} /></div>
      <p className="text-xs text-muted-foreground">{t("discovery")} · {t("stepOf", { current: step + 1, total: lastStep + 1 })}</p>
    </div>
    <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pr-2">
      <div className="py-3">
        {processDefinition && step >= 3 && step < readinessStep && <p className="mb-2 text-sm font-medium text-[#765ca1]">{td(processDefinition.title)}</p>}
        <h1 className="text-[clamp(1.8rem,4.4vh,3rem)] font-semibold leading-tight tracking-[-.04em]">{key === "review" ? t("readyQuestion") : t(`advice.${key}`)}</h1>
        <p className="mb-6 mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{t(`advice.${key}Help`)}</p>
      </div>
      {step === 0 && <div className="space-y-6">
        <div className="grid gap-2 sm:grid-cols-2">{INDUSTRIES.map(([value, label]) => <Choice key={value} selected={data.industry === value} onClick={() => setOnboarding({ industry: value })}>{t(label)}</Choice>)}</div>
        <label className="block text-sm text-muted-foreground">{t("companySize")}<select className="mt-2 w-full border-b border-foreground/25 bg-transparent py-3 text-lg text-foreground" value={data.companySize} onChange={e => setOnboarding({ companySize: e.target.value as CompanySize })}>{["1-50", "51-200", "201-1000", "1000+"].map(v => <option key={v} value={v}>{v} {t("employees")}</option>)}</select></label>
      </div>}
      {step === 1 && <div className="space-y-6">
        <div className="grid gap-2 sm:grid-cols-3">{(["cost", "capacity", "quality"] as const).map(objective => <Choice key={objective} selected={data.objective === objective} onClick={() => setOnboarding({ objective })}>{t(`advice.${objective}`)}</Choice>)}</div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-muted-foreground">{t("advice.country")}<input className="mt-2 w-full border-b border-foreground/25 bg-transparent py-2 text-xl text-foreground" value={data.country} onChange={e => setOnboarding({ country: e.target.value })} /></label>
          <label className="text-sm text-muted-foreground">{t("currency")}<select className="mt-2 w-full border-b border-foreground/25 bg-transparent py-2 text-xl text-foreground" value={data.currency} onChange={e => setOnboarding({ currency: e.target.value as Currency })}>{["EUR", "GBP", "USD", "CHF"].map(c => <option key={c}>{c}</option>)}</select></label>
          {(["averageSalary", "employerCostPercent", "workingDays", "hoursPerDay", "budget", "targetMonths"] as const).map(field => <FinancialField key={field} label={t(field === "averageSalary" ? field : `advice.${field}`)} value={data[field]!} min={["workingDays", "hoursPerDay", "targetMonths"].includes(field) ? 1 : 0} max={field === "hoursPerDay" ? 24 : field === "workingDays" ? 366 : field === "targetMonths" ? 36 : field === "employerCostPercent" ? 100 : 100000000} suffix={field === "averageSalary" || field === "budget" ? data.currency : undefined} onChange={value => setOnboarding({ [field]: value })} />)}
        </div>
      </div>}
      {step === 2 && <div className="space-y-6">
        <div className="grid gap-2 sm:grid-cols-2">{SOLUTIONS.map(s => <Choice key={s.id} selected={processes.some(p => p.id === s.id)} onClick={() => toggleProcess(s.id)}>{td(s.title)}</Choice>)}</div>
        <label className="block text-sm text-muted-foreground">{t("businessProcesses")}<textarea className="mt-2 min-h-24 w-full border-b border-foreground/25 bg-transparent py-2 text-base text-foreground" placeholder={t("workflowPlaceholder")} value={data.businessProcesses} onChange={e => setOnboarding({ businessProcesses: e.target.value })} /></label>
      </div>}
      {step >= 3 && step < readinessStep && process && <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">{(["employeeCount", "tasksPerMonth", "minutesPerTask", "errorRatePercent", "errorCost", "cashRealizationPercent"] as const).map(field => <FinancialField key={`${process.id}-${field}`} label={t(field === "employeeCount" || field === "tasksPerMonth" ? field : `advice.${field}`)} value={process[field]} min={["employeeCount", "minutesPerTask", "tasksPerMonth"].includes(field) ? 1 : 0} max={field.endsWith("Percent") ? 100 : 100000000} suffix={field === "errorCost" ? data.currency : undefined} onChange={value => updateProcess({ [field]: value })} />)}</div>
        <p className="border-l-2 border-[#c6b3e1] pl-4 text-sm leading-relaxed text-muted-foreground">{t("advice.cashHelp")}</p>
        <div className="grid gap-2 sm:grid-cols-2">{(["estimate", "measured"] as const).map(evidence => <Choice key={evidence} selected={process.evidence === evidence} onClick={() => updateProcess({ evidence })}>{t(`advice.${evidence}`)}</Choice>)}</div>
        <label className="block text-sm text-muted-foreground">{t("advice.notes")}<textarea maxLength={5000} className="mt-2 min-h-20 w-full border-b border-border bg-transparent py-2 text-foreground" placeholder={t("advice.notesHelp")} value={process.notes ?? ""} onChange={e => updateProcess({ notes: e.target.value })} /></label>
      </div>}
      {step === readinessStep && <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">{READINESS.map(field => <FinancialField key={field} label={t(field)} value={data[field]!} max={100} slider onChange={value => setOnboarding({ [field]: value })} />)}</div>
        <fieldset><legend className="mb-3 text-sm text-muted-foreground">{t("advice.stack")}</legend><div className="flex flex-wrap gap-2">{["Microsoft 365", "Google Workspace", "Atlassian", "HubSpot", "Salesforce", "Intercom", "UiPath", "SAP"].map(stack => <Choice key={stack} selected={data.softwareStack!.includes(stack)} onClick={() => setOnboarding({ softwareStack: data.softwareStack!.includes(stack) ? data.softwareStack!.filter(s => s !== stack) : [...data.softwareStack!, stack] })}>{stack}</Choice>)}</div></fieldset>
        {(["sensitiveData", "euHostingRequired"] as const).map(field => <label key={field} className="flex items-start gap-3 text-sm"><input type="checkbox" checked={data[field] ?? false} onChange={e => setOnboarding({ [field]: e.target.checked })} className="mt-1 accent-[#765ca1]" />{t(field === "sensitiveData" ? "advice.sensitive" : "advice.euHosting")}</label>)}
      </div>}
      {step === lastStep && <div className="space-y-6">
        <p className="text-lg">{td(data.industry)} · {data.companySize} {t("employees")} · {data.currency}</p>
        <div className="divide-y divide-border">{processes.map((p, index) => <button type="button" key={p.id} onClick={() => move(index + 3)} className="flex w-full flex-wrap items-center justify-between gap-3 py-4 text-left"><span>{td(SOLUTIONS.find(s => s.id === p.id)!.title)}</span><span className="text-sm text-muted-foreground">{t(`advice.${p.evidence}`)} →</span></button>)}</div>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("advice.modelNote")}</p>
      </div>}
    </div>
    <footer className="z-10 flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background py-4">
      <Button type="button" variant="ghost" disabled={step === 0} onClick={() => move(Math.max(0, step - 1))}>{t("back")}</Button>
      <span className="hidden text-xs text-muted-foreground md:block">{t("pressEnter")}</span>
      <Button type="submit" disabled={!valid}>{step === lastStep ? t("launchAnalysis") : t("continue")} →</Button>
    </footer>
  </form>;
}

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${selected ? "border-[#765ca1] bg-[#e8ddff]" : "border-foreground/15 hover:bg-foreground/5"}`}>{children}</button>;
}
