"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { OpportunityCard } from "@/components/opportunity-card";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { useAssessment } from "@/context/assessment-provider";
import { useLanguage } from "@/context/language-provider";

export default function AnalysisPage() {
  const router = useRouter();
  const { opportunities, onboarding, setSelectedOpportunity } = useAssessment();
  const { t, td } = useLanguage();

  useEffect(() => {
    if (!onboarding.industry || !opportunities.length) router.replace("/onboarding");
  }, [onboarding.industry, opportunities.length, router]);

  if (!onboarding.industry) return null;

  return (
    <PageTransition>
      <Nav ctaHref="/prioritize" ctaLabel={t("prioritize")} />
        <main className="mx-auto max-w-[1500px] px-5 pb-24 pt-32 md:px-8">
          <header className="mb-12 rounded-[38px] bg-[#2f1c4d] p-8 text-white md:p-14">
            <p className="eyebrow mb-6 text-white/60">
              {t("analysisComplete")} · {opportunities.length} {t("opportunitiesIdentified")}
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.06em] md:text-7xl">
              {t("analysisTitle")}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65">
              {t("basedOn", { industry: td(onboarding.industry ?? ""), departments: (onboarding.departments ?? []).map(td).join(", ") })}
            </p>
          </header>
          <p className="mb-7 max-w-4xl text-sm leading-relaxed text-muted-foreground">{t("advice.reviewHelp")} {t("advice.noPortfolioSum")}</p>
          <div className="mb-16">
            {[...opportunities].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)).map((opp, i) => (
              <OpportunityCard key={opp.id} opportunity={opp} index={i} onClick={() => { setSelectedOpportunity(opp.id); router.push("/roi"); }} />
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="lg" asChild>
              <Link href="/prioritize">{t("prioritizeOpportunities")} <ArrowRight /></Link>
            </Button>
          </div>
        </main>
    </PageTransition>
  );
}
