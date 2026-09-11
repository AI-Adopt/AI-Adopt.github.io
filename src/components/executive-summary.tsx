"use client";

import { motion } from "framer-motion";
import type { Recommendation } from "@/types/assessment";
import { useLanguage } from "@/context/language-provider";

export function ExecutiveSummary({ recommendation }: { recommendation: Recommendation }) {
  const { t, td, language } = useLanguage();
  const { opportunity, reasons, roiSnapshot } = recommendation;
  const currency = recommendation.currency ?? "EUR";
  const money = (value: number) => new Intl.NumberFormat(language, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  const number = (value: number) => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);
  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <p className="eyebrow mb-7">{t("executiveRecommendation")}</p>
      <h1 className="max-w-5xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] md:text-7xl">
        {td(opportunity.title)}
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        {t(`advice.${roiSnapshot?.verdict ?? "validate"}`)} {t("advice.modelNote")}
      </p>

      <dl className="mt-16 grid gap-8 border-y border-border py-10 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={t("advice.cashYear1")} value={money(roiSnapshot?.annualSavings ?? opportunity.annualSavings)} />
        <Metric label={t("roi12")} value={roiSnapshot?.roi12Month != null ? `${number(roiSnapshot.roi12Month)}%` : t("advice.undefined")} />
        <Metric label={t("paybackPeriod")} value={roiSnapshot?.paybackMonths != null ? `${number(roiSnapshot.paybackMonths)} ${t("months")}` : t("advice.noPayback")} />
        <Metric label={t("advice.readiness")} value={`${roiSnapshot?.confidenceScore ?? opportunity.confidenceScore}`} />
        {roiSnapshot && <Metric label={t("advice.npv36")} value={money(roiSnapshot.npv36)} />}
        {roiSnapshot && <Metric label={t("advice.peakFunding")} value={money(roiSnapshot.peakFunding)} />}
        {roiSnapshot && <Metric label={t("value24")} value={money(roiSnapshot.value24Month)} />}
        {roiSnapshot && <Metric label={t("advice.capacityValue")} value={money(roiSnapshot.capacityValue)} />}
      </dl>

      <section className="grid gap-10 border-b border-border py-14 md:grid-cols-[1fr_2fr]">
        <h2 className="text-2xl font-semibold tracking-[-0.035em]">{t("guide.validate")}</h2>
        <ol className="space-y-7">
          {reasons.map((reason, index) => (
            <li key={reason} className="grid grid-cols-[34px_1fr] gap-4 leading-relaxed">
              <span className="text-sm text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <span>{td(reason)}</span>
            </li>
          ))}
        </ol>
      </section>
      <p className="mt-6 text-sm text-muted-foreground">{t("decisionScenario")}: {t(roiSnapshot?.scenario ?? "base")} · {t(`advice.${recommendation.inputs?.evidence ?? "estimate"}`)}</p>
    </motion.article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="mb-3 text-xs text-muted-foreground">{label}</dt><dd className="text-3xl font-semibold tracking-[-0.045em]">{value}</dd></div>;
}
