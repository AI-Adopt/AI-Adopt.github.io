"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { ROICalculator } from "@/components/roi-calculator";
import { ImplementationGuide } from "@/components/implementation-guide";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { useAssessment } from "@/context/assessment-provider";
import { normalizeROIInputs, opportunityROIInputs } from "@/lib/roi";
import type { ROIInputs } from "@/types/assessment";
import { useLanguage } from "@/context/language-provider";

export default function ROIPage() {
  const router = useRouter();
  const { opportunities, roiInputs, setROIInputs, setSelectedOpportunity, generateRecommendation, onboarding, getSelectedOpportunity } = useAssessment();
  const { t, td } = useLanguage();
  const selected = getSelectedOpportunity() ?? opportunities[0];
  useEffect(() => { if (opportunities.length === 0) router.replace("/onboarding"); }, [opportunities.length, router]);
  const inputs: ROIInputs = useMemo(() => {
    const defaults = selected
      ? opportunityROIInputs(selected, onboarding)
      : opportunityROIInputs({ automationPercent: 50, implementationComplexity: "Medium", dataAvailability: 72, confidenceScore: 70 }, onboarding);
    return normalizeROIInputs(roiInputs, defaults);
  }, [roiInputs, onboarding, selected]);
  if (opportunities.length === 0 || !selected) return null;
  const handleContinue = () => { setROIInputs(inputs); generateRecommendation(inputs); router.push("/recommendation"); };

  return (
    <PageTransition>
      <Nav showCta={false} />
      <main className="mx-auto max-w-[1500px] px-5 pb-24 pt-32 md:px-8">
        <header className="mb-8 rounded-[30px] bg-[#e8ddff] p-6 md:p-9">
          <p className="eyebrow mb-6">{t("roiSimulation")} · {td(selected.title)}</p>
          <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-5xl">{t("roiTitle")}</h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-foreground/65">{t("roiText")}</p>
        </header>
        <section className="mb-12 border-y border-border py-7">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.03em]">{t("calculateRoiFor")}</h2>
            <p className="text-sm text-muted-foreground">{t("opportunityChangesEstimate")}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {opportunities.map((opportunity, index) => {
              const active = opportunity.id === selected.id;
              return (
                <button
                  key={opportunity.id}
                  type="button"
                  onClick={() => setSelectedOpportunity(opportunity.id)}
                  className={`min-h-24 border-l-2 px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-[#6b4eff] bg-[#f0edff]"
                      : "border-border hover:border-foreground/40 hover:bg-secondary/50"
                  }`}
                >
                  <span className="mb-2 block text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                  <span className="block font-semibold leading-tight tracking-[-0.02em]">{td(opportunity.title)}</span>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {t("businessValueShort")} {opportunity.valueScore.toFixed(1)} · {t("difficultyShort")} {opportunity.difficultyScore.toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
        <ROICalculator key={selected.id} inputs={inputs} title={td(selected.title)} onChange={setROIInputs} />
        <ImplementationGuide opportunityId={selected.id} />
        <div className="sticky bottom-0 z-20 mt-10 flex justify-end border-t border-border bg-background/95 py-4 backdrop-blur"><Button size="lg" onClick={handleContinue}>{t("viewRecommendation")} <ArrowRight /></Button></div>
      </main>
    </PageTransition>
  );
}
