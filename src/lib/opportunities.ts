import type { OnboardingData, Opportunity, ROIInputs, ROIResults } from "@/types/assessment";
import { calculateROI, normalizeROIInputs, opportunityROIInputs } from "@/lib/roi";
import { SOLUTIONS } from "@/lib/solution-catalog";

export function priceOpportunity(opportunity: Opportunity, data: Partial<OnboardingData>, overrides: Partial<ROIInputs> = {}): Opportunity {
  const inputs = normalizeROIInputs(overrides, opportunityROIInputs(opportunity, data));
  const roi = calculateROI(inputs);
  const risk = opportunity.complianceRisk === "High" ? 1 : .4;
  const difficulty = Math.min(10, inputs.implementationDifficulty * .6 + (100 - inputs.infrastructureReadiness) / 50 + (100 - inputs.dataQuality) / 100 + risk);
  const financial = Math.max(0, Math.min(100, 50 + roi.npv36 / Math.max(roi.totalCost36, 1) * 50));
  const strategic = data.objective === "capacity" ? roi.operationalEfficiencyGain : data.objective === "quality" ? inputs.errorReductionPercent : financial;
  const budget = inputs.budget ? Math.min(100, inputs.budget / Math.max(roi.peakFunding, 1) * 100) : 50;
  const timing = Math.min(100, inputs.targetMonths / roi.goLiveMonth * 100);
  const valueScore = Math.max(0, Math.min(10, (financial * .6 + strategic * .4) / 10));
  const quadrant = valueScore >= 5 ? difficulty <= 5 ? "quick-wins" : "strategic" : difficulty <= 5 ? "secondary" : "avoid";
  return { ...opportunity, roi, currency: inputs.currency, annualSavings: roi.annualSavings, evidence: inputs.evidence,
    confidenceScore: roi.confidenceScore, dataAvailability: inputs.dataQuality, automationPercent: inputs.automationPercent,
    deploymentTime: `${inputs.implementationMonths * 4}-${(inputs.implementationMonths + 1) * 4} weeks`,
    difficultyScore: difficulty, valueScore, quadrant,
    priorityScore: Math.round(financial * .4 + (10 - difficulty) * 2 + roi.confidenceScore * .15 + strategic * .15 + budget * .05 + timing * .05),
  };
}

export function generateOpportunities(data: OnboardingData): Opportunity[] {
  const selected = data.processes?.map(p => p.id);
  return SOLUTIONS.filter(s => selected?.length ? selected.includes(s.id) : data.departments.includes(s.department) || data.repetitiveWorkflows.includes(s.workflow))
    .map(s => priceOpportunity({ id: s.id, title: s.title, description: `solution.${s.id}.description`, annualSavings: 0,
      implementationComplexity: s.complexity, deploymentTime: "", confidenceScore: 0, automationPercent: s.automation,
      difficultyScore: 0, valueScore: 0, quadrant: "secondary", dataAvailability: 50, complianceRisk: s.complexity === "High" ? "High" : "Medium",
    }, data)).sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
}

export function getTopRecommendation(opportunities: Opportunity[]): Opportunity {
  return [...opportunities].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))[0];
}

export function buildRecommendationReasons(_opportunity: Opportunity, roi?: ROIResults): string[] {
  return [roi?.verdict === "defer" ? "advice.deferReason" : "advice.pilotReason", "advice.evidenceReason", "advice.governanceReason", "advice.noPortfolioSum"];
}
