"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useAssessment } from "@/context/assessment-provider";
import { useLanguage } from "@/context/language-provider";
import type { Opportunity } from "@/types/assessment";

interface PriorityMatrixProps {
  opportunities: Opportunity[];
}

export function PriorityMatrix({ opportunities }: PriorityMatrixProps) {
  const router = useRouter();
  const { setSelectedOpportunity } = useAssessment();
  const { t, td, language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const padding = 72;
  const width = 820;
  const height = 560;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const toX = (difficulty: number) => padding + difficulty / 10 * plotW;
  const toY = (value: number) => padding + plotH - value / 10 * plotH;
  const openROI = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity.id);
    router.push("/roi");
  };

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{t("clickOpportunityForRoi")}</p>
        <div className="flex gap-5 text-xs font-semibold text-muted-foreground">
          <span>{t("businessValueShort")}: 0–10</span>
          <span>{t("difficultyShort")}: 0–10</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-[32px] bg-[#f0edff] px-2 py-5 md:px-6 md:py-8">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={t("portfolioView")}>
          <rect x={padding} y={padding} width={plotW / 2} height={plotH / 2} fill="rgba(29,26,23,0.025)" />
          <rect x={padding + plotW / 2} y={padding} width={plotW / 2} height={plotH / 2} fill="rgba(29,26,23,0.055)" />
          <rect x={padding + plotW / 2} y={padding + plotH / 2} width={plotW / 2} height={plotH / 2} fill="rgba(29,26,23,0.02)" />

          {[2, 4, 6, 8].map((n) => (
            <g key={n}>
              <line x1={toX(n)} y1={padding} x2={toX(n)} y2={padding + plotH} stroke="rgba(29,26,23,0.10)" strokeDasharray="4 4" />
              <line x1={padding} y1={toY(n)} x2={padding + plotW} y2={toY(n)} stroke="rgba(29,26,23,0.10)" strokeDasharray="4 4" />
            </g>
          ))}
          <line x1={padding} y1={padding + plotH} x2={padding + plotW} y2={padding + plotH} stroke="rgba(29,26,23,0.35)" />
          <line x1={padding} y1={padding} x2={padding} y2={padding + plotH} stroke="rgba(29,26,23,0.35)" />
          <line x1={toX(5)} y1={padding} x2={toX(5)} y2={padding + plotH} stroke="rgba(29,26,23,0.18)" />
          <line x1={padding} y1={toY(5)} x2={padding + plotW} y2={toY(5)} stroke="rgba(29,26,23,0.18)" />

          <text x={padding + plotW / 2} y={height - 12} textAnchor="middle" className="fill-muted-foreground text-[12px]">
            {t("implementationDifficulty")} →
          </text>
          <text x={22} y={padding + plotH / 2} textAnchor="middle" transform={`rotate(-90, 22, ${padding + plotH / 2})`} className="fill-muted-foreground text-[12px]">
            {t("businessValue")} →
          </text>
          <text x={padding + 14} y={padding + 24} className="fill-foreground text-[12px] font-semibold">{t("quickWins")}</text>
          <text x={padding + plotW / 2 + 14} y={padding + 24} className="fill-foreground text-[12px] font-semibold">{t("strategic")}</text>
          <text x={padding + 14} y={padding + plotH / 2 + 24} className="fill-muted-foreground text-[12px] font-semibold">{t("secondary")}</text>
          <text x={padding + plotW / 2 + 14} y={padding + plotH / 2 + 24} className="fill-muted-foreground text-[12px] font-semibold">{t("avoid")}</text>

          {opportunities.map((opportunity, index) => {
            const cx = toX(opportunity.difficultyScore);
            const cy = toY(opportunity.valueScore);
            const hovered = hoveredId === opportunity.id;
            const above = index % 2 === 0;
            const labelX = Math.min(Math.max(cx - 76, padding + 4), padding + plotW - 156);
            const labelY = above ? Math.max(cy - 61, padding + 34) : Math.min(cy + 20, padding + plotH - 47);
            const title = td(opportunity.title);
            return (
              <g
                key={opportunity.id}
                role="button"
                tabIndex={0}
                aria-label={`${td(opportunity.title)}. ${t("businessValueShort")} ${opportunity.valueScore.toFixed(1)}. ${t("difficultyShort")} ${opportunity.difficultyScore.toFixed(1)}`}
                onFocus={() => setHoveredId(opportunity.id)}
                onBlur={() => setHoveredId(null)}
                onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openROI(opportunity); } }}
                onMouseEnter={() => setHoveredId(opportunity.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => openROI(opportunity)}
                className="cursor-pointer"
              >
                <title>{td(opportunity.title)}</title>
                <line x1={cx} y1={cy} x2={cx} y2={above ? labelY + 42 : labelY} stroke="rgba(29,26,23,0.24)" />
                <rect
                  x={labelX}
                  y={labelY}
                  width={152}
                  height={42}
                  rx={7}
                  fill={hovered ? "#2f1c4d" : "#fffdf8"}
                  stroke="rgba(29,26,23,0.18)"
                />
                <text x={labelX + 9} y={labelY + 17} className={hovered ? "fill-white text-[10px] font-semibold" : "fill-foreground text-[10px] font-semibold"}>
                  {title.length > 23 ? `${title.slice(0, 23)}…` : title}
                </text>
                <text x={labelX + 9} y={labelY + 32} className={hovered ? "fill-white/70 text-[9px]" : "fill-muted-foreground text-[9px]"}>
                  {t("businessValueShort")} {opportunity.valueScore.toFixed(1)} · {t("difficultyShort")} {opportunity.difficultyScore.toFixed(1)}
                </text>
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={hovered ? 12 : 9}
                  fill="#2f1c4d"
                  stroke="#fffdf8"
                  strokeWidth={3}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: index * 0.07 }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 grid border-t border-border md:grid-cols-2">
        {opportunities.map((opportunity, index) => (
          <button
            type="button"
            key={opportunity.id}
            onClick={() => openROI(opportunity)}
            className="group flex min-h-32 items-start gap-4 border-b border-border px-2 py-5 text-left transition-colors hover:bg-secondary/50 md:px-5 md:odd:border-r"
          >
            <span className="pt-1 text-xs font-semibold text-muted-foreground">0{index + 1}</span>
            <span className="flex-1">
              <span className="block text-lg font-semibold tracking-[-0.03em]">{td(opportunity.title)}</span>
              <span className="mt-2 block text-sm text-muted-foreground">
                {t("businessValueShort")} {opportunity.valueScore.toFixed(1)} · {t("difficultyShort")} {opportunity.difficultyScore.toFixed(1)} · {t("advice.cashYear1")}: {new Intl.NumberFormat(language, { style: "currency", currency: opportunity.currency ?? "EUR", maximumFractionDigits: 0 }).format(opportunity.annualSavings)}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{t("advice.scoring")}</p>
    </section>
  );
}
