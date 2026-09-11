"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Opportunity } from "@/types/assessment";
import { useLanguage } from "@/context/language-provider";
import { OpportunityGraphic } from "@/components/opportunity-graphic";

export function OpportunityCard({
  opportunity,
  index = 0,
  onClick,
}: {
  opportunity: Opportunity;
  index?: number;
  onClick?: () => void;
}) {
  const { t, td, language } = useLanguage();
  const money = (value: number) => new Intl.NumberFormat(language, { style: "currency", currency: opportunity.currency ?? "EUR", maximumFractionDigits: 0 }).format(value);
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`mb-4 grid gap-7 rounded-[28px] p-7 md:p-9 lg:grid-cols-[42px_180px_1.25fr_1fr] ${
        index % 3 === 0
          ? "bg-[#f0edff]"
          : index % 3 === 1
            ? "bg-[#fff0cb]"
            : "bg-[#ffe0d8]"
      }`}
    >
      <span className="text-sm text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <OpportunityGraphic opportunityId={opportunity.id} />
      <div>
        <p className="eyebrow mb-3">{t("aiOpportunity")}</p>
        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] md:text-4xl">
          {td(opportunity.title)}
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          {td(opportunity.description)}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">{t(`advice.${opportunity.evidence ?? "estimate"}`)} · {t(opportunity.roi?.scenario ?? "base")}</p>
        {onClick && <Button className="mt-5" variant="secondary" onClick={onClick}>{t("calculateRoiFor")} →</Button>}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 text-sm">
        <Metric label={t("advice.cashYear1")} value={money(opportunity.annualSavings)} />
        <Metric label={t("complexity")} value={t(opportunity.implementationComplexity.toLowerCase())} />
        <Metric label={t("deployment")} value={opportunity.roi ? t("monthNumber", { month: opportunity.roi.goLiveMonth }) : td(opportunity.deploymentTime)} />
        <Metric label={t("automation")} value={`${opportunity.automationPercent}%`} />
        {opportunity.roi && <Metric label={t("advice.capacityValue")} value={money(opportunity.roi.capacityValue)} />}
        {opportunity.roi && <Metric label={t("totalImplementationCost")} value={money(opportunity.roi.implementationCost)} />}
      </dl>
    </motion.article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">{value}</dd>
    </div>
  );
}
