import type { OnboardingData, Opportunity, ROIInputs, ROIResults, ROIScenario } from "@/types/assessment";
import { SOLUTIONS } from "@/lib/solution-catalog";

export function defaultROIInputs(employeeCount = 1, automationPercent = 50, implementationCost = 15000): ROIInputs {
  return {
    modelVersion: 3, notes: "", budget: 25000, targetMonths: 3, employeeCount, averageSalary: 40000, workingDays: 220, hoursPerDay: 8,
    employerCostPercent: 25, tasksPerMonth: 500, minutesPerTask: 10, manualHoursPerDay: 0,
    currentOperationalCost: 0, cashRealizationPercent: 0, errorRatePercent: 0, errorCost: 0,
    otherCostReductionPercent: 0, developmentCost: implementationCost * .45,
    consultingCost: implementationCost * .15, integrationCost: implementationCost * .3,
    trainingCost: implementationCost * .1, infrastructureCost: 0, softwareCost: 0,
    automationPercent, reviewPercent: 25, errorReductionPercent: 0,
    productivityIncreasePercent: 0, manualWorkReductionPercent: 0, processAccelerationPercent: 0,
    monthlyApiCost: 0, monthlyLicensingCost: 150, monthlyMaintenanceCost: 100,
    monthlyMonitoringCost: 50, monthlySupportCost: 0, monthlyOperationalMaintenanceCost: 0,
    annualRetrainingCost: 0, costPerTask: .05, implementationMonths: 2, rampMonths: 3,
    contingencyPercent: 15, discountRate: 10, implementationDifficulty: 5,
    startMonth: new Date().toISOString().slice(0, 7), downsideBenefitPercent: 75,
    downsideCostPercent: 125, downsideDelayMonths: 1, upsideBenefitPercent: 115, upsideCostPercent: 100,
    dataQuality: 50, processMaturity: 50, adoptionReadiness: 50, infrastructureReadiness: 50,
    evidence: "estimate", currency: "EUR", scenario: "base",
  };
}

export const MONEY_FIELDS: (keyof ROIInputs)[] = ["budget", "averageSalary", "currentOperationalCost", "errorCost", "developmentCost", "consultingCost", "infrastructureCost", "softwareCost", "integrationCost", "trainingCost", "monthlyApiCost", "monthlyLicensingCost", "monthlyMaintenanceCost", "monthlyMonitoringCost", "annualRetrainingCost", "monthlySupportCost", "monthlyOperationalMaintenanceCost", "costPerTask"];

export function normalizeROIInputs(value: Partial<ROIInputs>, fallback = defaultROIInputs()): ROIInputs {
  const result = { ...fallback };
  for (const key of Object.keys(fallback) as (keyof ROIInputs)[]) {
    if (typeof fallback[key] === "number") {
      const raw = value[key];
      if (typeof raw === "number" && Number.isFinite(raw)) Object.assign(result, { [key]: Math.max(0, Math.min(1e10, raw)) });
    }
  }
  for (const key of Object.keys(result) as (keyof ROIInputs)[]) {
    if (key.endsWith("Percent") || ["dataQuality", "processMaturity", "adoptionReadiness", "infrastructureReadiness", "discountRate"].includes(key)) {
      if (!key.startsWith("downside") && !key.startsWith("upside")) Object.assign(result, { [key]: Math.min(100, result[key] as number) });
    }
  }
  result.employeeCount = Math.min(100000, result.employeeCount);
  result.hoursPerDay = Math.max(1, Math.min(24, result.hoursPerDay));
  result.workingDays = Math.max(1, Math.min(366, result.workingDays));
  result.implementationMonths = Math.round(Math.min(36, result.implementationMonths));
  result.rampMonths = Math.max(1, Math.round(Math.min(36, result.rampMonths)));
  result.targetMonths = Math.max(1, Math.round(Math.min(36, result.targetMonths)));
  result.implementationDifficulty = Math.min(10, result.implementationDifficulty);
  result.downsideBenefitPercent = Math.min(100, result.downsideBenefitPercent);
  result.downsideCostPercent = Math.max(100, Math.min(300, result.downsideCostPercent));
  result.downsideDelayMonths = Math.round(Math.min(24, result.downsideDelayMonths));
  result.upsideBenefitPercent = Math.max(100, Math.min(200, result.upsideBenefitPercent));
  result.upsideCostPercent = Math.min(100, result.upsideCostPercent);
  result.currency = ["EUR", "GBP", "USD", "CHF"].includes(value.currency ?? "") ? value.currency! : fallback.currency;
  result.scenario = ["conservative", "base", "optimistic"].includes(value.scenario ?? "") ? value.scenario! : fallback.scenario;
  result.evidence = value.evidence === "measured" || value.evidence === "estimate" ? value.evidence : fallback.evidence;
  result.startMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(value.startMonth ?? "") ? value.startMonth! : fallback.startMonth;
  result.modelVersion = 3;
  result.notes = typeof value.notes === "string" ? value.notes.slice(0, 5000) : fallback.notes;
  return result;
}

export function calculateROI(raw: ROIInputs, selectedScenario?: ROIScenario): ROIResults {
  const i = normalizeROIInputs(raw);
  const scenario = selectedScenario ?? i.scenario;
  const benefitFactor = scenario === "conservative" ? i.downsideBenefitPercent / 100 : scenario === "optimistic" ? i.upsideBenefitPercent / 100 : 1;
  const costFactor = scenario === "conservative" ? i.downsideCostPercent / 100 : scenario === "optimistic" ? i.upsideCostPercent / 100 : 1;
  const delay = i.implementationMonths + (scenario === "conservative" ? i.downsideDelayMonths : 0);
  const annualTasks = i.tasksPerMonth * 12;
  const demandHours = annualTasks * i.minutesPerTask / 60;
  const capacityHours = i.employeeCount * i.workingDays * i.hoursPerDay;
  const baselineHours = Math.min(demandHours, capacityHours);
  const capacityCapped = demandHours > capacityHours;
  const validTasks = demandHours > 0 ? annualTasks * baselineHours / demandHours : 0;
  const hourlyCost = i.averageSalary * (1 + i.employerCostPercent / 100) / (i.workingDays * i.hoursPerDay);
  const automation = Math.min(1, i.automationPercent / 100 * benefitFactor);
  const hoursSaved = baselineHours * automation * (1 - i.reviewPercent / 100);
  const capacityValue = hoursSaved * hourlyCost;
  const cashLaborSavings = capacityValue * i.cashRealizationPercent / 100;
  const errorBaseline = validTasks * i.errorRatePercent / 100 * i.errorCost;
  const errorSavings = errorBaseline * automation * i.errorReductionPercent / 100;
  const otherSavings = i.currentOperationalCost * Math.min(1, i.otherCostReductionPercent / 100 * benefitFactor);
  const annualGrossBenefit = cashLaborSavings + errorSavings + otherSavings;
  const baselineAnnualCost = baselineHours * hourlyCost + errorBaseline + i.currentOperationalCost;
  const implementationCost = (i.developmentCost + i.consultingCost + i.infrastructureCost + i.softwareCost + i.integrationCost + i.trainingCost) * (1 + i.contingencyPercent / 100) * costFactor;
  const fixedMonthly = (i.monthlyApiCost + i.monthlyLicensingCost + i.monthlyMaintenanceCost + i.monthlyMonitoringCost + i.monthlySupportCost + i.monthlyOperationalMaintenanceCost + i.annualRetrainingCost / 12) * costFactor;
  const usageMonthly = validTasks / 12 * automation * i.costPerTask * costFactor;
  const annualRecurringCost = (fixedMonthly + usageMonthly) * 12;
  let cumulativeBenefit = 0;
  let cumulativeCost = implementationCost;
  let npv36 = -implementationCost;
  let peakFunding = implementationCost;
  const monthlyData: ROIResults["monthlyData"] = [{ month: "M0", period: 0, benefit: 0, operatingCost: 0, cashFlow: -implementationCost, cumulativeBenefit: 0, cumulativeCost, net: -implementationCost }];
  for (let period = 1; period <= 36; period++) {
    const adoption = Math.max(0, Math.min(1, (period - delay) / i.rampMonths));
    const benefit = annualGrossBenefit / 12 * adoption;
    const operatingCost = fixedMonthly + usageMonthly * adoption;
    const cashFlow = benefit - operatingCost;
    cumulativeBenefit += benefit;
    cumulativeCost += operatingCost;
    const net = cumulativeBenefit - cumulativeCost;
    npv36 += cashFlow / Math.pow(1 + i.discountRate / 100, period / 12);
    peakFunding = Math.max(peakFunding, -net);
    monthlyData.push({ month: `M${period}`, period, benefit, operatingCost, cashFlow, cumulativeBenefit, cumulativeCost, net });
  }
  // Only a sustained recovery counts; a zero-cost M0 is not a payback if later cash flow is negative.
  const breakEvenIndex = monthlyData.findIndex((point, index) => point.net >= 0 && monthlyData.slice(index).every((later) => later.net >= 0));
  let paybackMonths: number | null = null;
  let breakEvenDate: string | null = null;
  if (breakEvenIndex >= 0) {
    const previous = monthlyData[Math.max(0, breakEvenIndex - 1)];
    paybackMonths = breakEvenIndex === 0 ? 0 : breakEvenIndex - 1 + (-previous.net / monthlyData[breakEvenIndex].cashFlow);
    const [year, month] = i.startMonth.split("-").map(Number);
    breakEvenDate = new Date(Date.UTC(year, month - 1 + Math.max(0, breakEvenIndex - 1), 1)).toISOString().slice(0, 7);
  }
  const year1 = monthlyData[12];
  const annualSavings = year1.net + implementationCost;
  const confidenceScore = Math.round((i.dataQuality + i.processMaturity + i.adoptionReadiness + i.infrastructureReadiness + (10 - i.implementationDifficulty) * 10) / 5);
  const operationalEfficiencyGain = baselineHours ? hoursSaved / baselineHours * 100 : 0;
  return {
    scenario, baselineAnnualCost, annualGrossBenefit, annualSavings, implementationCost, annualRecurringCost,
    netFirstYearSavings: year1.net, firstYearProfit: year1.net, paybackMonths,
    breakEvenMonth: breakEvenIndex < 0 ? null : breakEvenIndex,
    roi12Month: year1.cumulativeCost > 0 ? year1.net / year1.cumulativeCost * 100 : null,
    value24Month: monthlyData[24].net, effectiveAutomationPercent: automation * (1 - i.reviewPercent / 100) * 100,
    operationalEfficiencyGain, costReductionPercent: baselineAnnualCost ? annualSavings / baselineAnnualCost * 100 : 0,
    confidenceScore, costBeforeAI: baselineAnnualCost, costAfterAI: baselineAnnualCost - annualSavings,
    baselineHours, capacityCapped, hoursSaved, capacityValue, cashLaborSavings, errorSavings,
    steadyStateAnnualNet: annualGrossBenefit - annualRecurringCost,
    totalCost12: year1.cumulativeCost, totalCost36: cumulativeCost, npv36, peakFunding,
    benefitCostRatio: cumulativeCost > 0 ? cumulativeBenefit / cumulativeCost : null,
    breakEvenDate, goLiveMonth: delay + 1,
    verdict: npv36 <= 0 ? "defer" : confidenceScore < 60 || i.evidence !== "measured" || capacityCapped || (i.budget > 0 && peakFunding > i.budget) || delay + 1 > i.targetMonths ? "validate" : "pilot",
    monthlyData,
  };
}

export function calculateROIScenarios(inputs: ROIInputs): ROIResults[] {
  return (["conservative", "base", "optimistic"] as ROIScenario[]).map(s => calculateROI(inputs, s));
}

export function opportunityROIInputs(opportunity: Pick<Opportunity, "automationPercent" | "implementationComplexity" | "dataAvailability" | "confidenceScore"> & { id?: string }, onboarding: Partial<OnboardingData>): ROIInputs {
  const solution = SOLUTIONS.find(s => s.id === opportunity.id);
  const process = onboarding.processes?.find(p => p.id === opportunity.id);
  const defaults = defaultROIInputs(process?.employeeCount ?? 1, solution?.automation ?? opportunity.automationPercent, (solution?.deliveryDays ?? 20) * 800);
  return normalizeROIInputs({
    ...defaults, ...process, averageSalary: onboarding.averageSalary ?? defaults.averageSalary,
    budget: onboarding.budget ?? defaults.budget, targetMonths: onboarding.targetMonths ?? defaults.targetMonths,
    employerCostPercent: onboarding.employerCostPercent ?? defaults.employerCostPercent,
    workingDays: onboarding.workingDays ?? defaults.workingDays, hoursPerDay: onboarding.hoursPerDay ?? defaults.hoursPerDay,
    currency: onboarding.currency ?? "EUR", dataQuality: onboarding.dataQuality ?? 50,
    processMaturity: onboarding.processMaturity ?? 50, adoptionReadiness: onboarding.adoptionReadiness ?? 50,
    infrastructureReadiness: onboarding.infrastructureReadiness ?? 50,
    implementationDifficulty: solution?.complexity === "High" ? 8 : solution?.complexity === "Low" ? 3 : 5,
    implementationMonths: (solution?.months ?? 2) + ((onboarding.infrastructureReadiness ?? 50) < 40 ? 1 : 0),
    reviewPercent: solution?.review ?? defaults.reviewPercent,
  });
}

export function estimateOpportunityAnnualSavings(opportunity: Parameters<typeof opportunityROIInputs>[0], onboarding: Partial<OnboardingData>): number {
  return calculateROI(opportunityROIInputs(opportunity, onboarding)).annualSavings;
}
