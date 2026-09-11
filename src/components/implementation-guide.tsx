"use client";

import { useState } from "react";
import { useLanguage } from "@/context/language-provider";
import { useAssessment } from "@/context/assessment-provider";
import { REVIEWED_ON, SOLUTIONS, VENDORS } from "@/lib/solution-catalog";

export function ImplementationGuide({ opportunityId }: { opportunityId: string }) {
  const { t, language } = useLanguage();
  const { onboarding } = useAssessment();
  const [question, setQuestion] = useState("tools");
  const solution = SOLUTIONS.find(s => s.id === opportunityId);
  const vendors = (solution?.vendors ?? []).map(id => VENDORS[id]).filter(Boolean).sort((a, b) => Number(onboarding.softwareStack?.includes(b.stack) ?? false) - Number(onboarding.softwareStack?.includes(a.stack) ?? false));
  return <section className="border-t border-border py-10">
    <p className="eyebrow mb-3">AdoptAI · {t("guide.validate")}</p>
    <h2 className="max-w-3xl text-3xl font-semibold tracking-[-.04em] md:text-5xl">{t("guide.title")}</h2>
    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t("guide.note", { date: new Intl.DateTimeFormat(language, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${REVIEWED_ON}T00:00:00Z`)) })}</p>
    <div className="mt-7 flex flex-wrap gap-2 print:hidden">{["tools", "providers", "validate"].map(key => <button type="button" key={key} aria-pressed={question === key} onClick={() => setQuestion(key)} className={`rounded-md border px-4 py-3 text-sm ${question === key ? "border-[#2f1c4d] bg-[#2f1c4d] text-white" : "border-border"}`}>{t(`guide.${key}`)}</button>)}</div>
    <div className="mt-7" aria-live="polite">
      {question === "tools" && <><p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">{t("guide.shortlist")}</p><div className="mt-5 grid gap-8 md:grid-cols-2">{vendors.map(v => <article key={v.name} className="border-t border-border py-5"><h3 className="text-xl font-semibold">{v.name}</h3>{onboarding.softwareStack?.includes(v.stack) && <p className="mt-2 text-xs font-medium text-[#765ca1]">{t("guide.stackMatch")}</p>}<p className="my-4 text-sm leading-relaxed text-muted-foreground">{t(v.basis)}</p><a className="text-sm underline underline-offset-4" href={v.url} target="_blank" rel="noopener noreferrer">{t("guide.pricing")} ↗</a></article>)}</div></>}
      {question === "providers" && <><p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">{t("guide.procurement")}</p><ul className="mt-6 space-y-4">{vendors.map(v => <li key={v.name}><a className="underline underline-offset-4" href={v.partners} target="_blank" rel="noopener noreferrer">{v.name} · {t("guide.partner")} ↗</a></li>)}</ul></>}
      {question === "validate" && <ol className="max-w-4xl space-y-5 text-sm leading-relaxed">{["advice.evidenceReason", "advice.governanceReason", "advice.noPortfolioSum"].map((key, index) => <li key={key} className="flex gap-4"><span className="font-semibold text-[#765ca1]">0{index + 1}</span><span>{t(key)}</span></li>)}{(onboarding.euHostingRequired || onboarding.sensitiveData) && <li className="border-l-2 border-[#c6b3e1] pl-4 font-medium">{onboarding.euHostingRequired && t("advice.euHosting")}{onboarding.euHostingRequired && onboarding.sensitiveData ? " · " : ""}{onboarding.sensitiveData && t("advice.sensitive")}</li>}</ol>}
    </div>
  </section>;
}
