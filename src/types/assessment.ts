export type CompanySize = "1-50" | "51-200" | "201-1000" | "1000+";

export type Complexity = "Low" | "Medium" | "High";
export type Currency = "EUR" | "GBP" | "USD" | "CHF";
export type ROIScenario = "conservative" | "base" | "optimistic";

export interface OnboardingData {
  industry: string;
  companySize: CompanySize;
  departments: string[];
  businessProcesses: string;
  repetitiveWorkflows: string[];
  manualOperationsHours: number;
  currency?: Currency;
  country?: string;
  objective?: "cost" | "capacity" | "quality";
  budget?: number;
  targetMonths?: number;
  averageSalary?: number;
  employerCostPercent?: number;
  workingDays?: number;
  hoursPerDay?: number;
  softwareStack?: string[];
  dataQuality?: number;
  processMaturity?: number;
  adoptionReadiness?: number;
  infrastructureReadiness?: number;
  sensitiveData?: boolean;
  euHostingRequired?: boolean;
  processes?: ProcessProfile[];
}

export interface ProcessProfile {
  id: string;
  employeeCount: number;
  tasksPerMonth: number;
  minutesPerTask: number;
  errorRatePercent: number;
  errorCost: number;
  cashRealizationPercent: number;
  evidence: "estimate" | "measured";
  notes?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  annualSavings: number;
  implementationComplexity: Complexity;
  deploymentTime: string;
  confidenceScore: number;
  automationPercent: number;
  difficultyScore: number;
  valueScore: number;
  quadrant: "quick-wins" | "strategic" | "secondary" | "avoid";
  dataAvailability: number;
  complianceRisk: "Low" | "Medium" | "High";
  currency?: Currency;
  priorityScore?: number;
  evidence?: "estimate" | "measured";
  roi?: ROIResults;
}

export interface ROIInputs {
  notes: string;
  budget: number;
  targetMonths: number;
  modelVersion: 3;
  minutesPerTask: number;
  workingDays: number;
  hoursPerDay: number;
  employerCostPercent: number;
  cashRealizationPercent: number;
  errorRatePercent: number;
  errorCost: number;
  otherCostReductionPercent: number;
  costPerTask: number;
  implementationMonths: number;
  rampMonths: number;
  contingencyPercent: number;
  discountRate: number;
  implementationDifficulty: number;
  startMonth: string;
  downsideBenefitPercent: number;
  downsideCostPercent: number;
  downsideDelayMonths: number;
  upsideBenefitPercent: number;
  upsideCostPercent: number;
  evidence: "estimate" | "measured";
  employeeCount: number;
  averageSalary: number;
  manualHoursPerDay: number;
  tasksPerMonth: number;
  currentOperationalCost: number;
  developmentCost: number;
  consultingCost: number;
  infrastructureCost: number;
  automationPercent: number;
  productivityIncreasePercent: number;
  manualWorkReductionPercent: number;
  errorReductionPercent: number;
  processAccelerationPercent: number;
  softwareCost: number;
  integrationCost: number;
  trainingCost: number;
  monthlyApiCost: number;
  monthlyLicensingCost: number;
  monthlyMaintenanceCost: number;
  monthlyMonitoringCost: number;
  annualRetrainingCost: number;
  monthlySupportCost: number;
  monthlyOperationalMaintenanceCost: number;
  reviewPercent: number;
  dataQuality: number;
  processMaturity: number;
  adoptionReadiness: number;
  infrastructureReadiness: number;
  currency: Currency;
  scenario: ROIScenario;
}

export interface ROIResults {
  scenario: ROIScenario;
  baselineAnnualCost: number;
  annualGrossBenefit: number;
  annualSavings: number;
  implementationCost: number;
  annualRecurringCost: number;
  netFirstYearSavings: number;
  firstYearProfit: number;
  paybackMonths: number | null;
  breakEvenMonth: number | null;
  roi12Month: number | null;
  value24Month: number;
  effectiveAutomationPercent: number;
  operationalEfficiencyGain: number;
  costReductionPercent: number;
  confidenceScore: number;
  costBeforeAI: number;
  costAfterAI: number;
  baselineHours: number;
  capacityCapped: boolean;
  hoursSaved: number;
  capacityValue: number;
  cashLaborSavings: number;
  errorSavings: number;
  steadyStateAnnualNet: number;
  totalCost12: number;
  totalCost36: number;
  npv36: number;
  peakFunding: number;
  benefitCostRatio: number | null;
  breakEvenDate: string | null;
  goLiveMonth: number;
  verdict: "pilot" | "validate" | "defer";
  monthlyData: { month: string; period: number; benefit: number; operatingCost: number; cashFlow: number; cumulativeBenefit: number; cumulativeCost: number; net: number }[];
}

export interface Recommendation {
  opportunity: Opportunity;
  reasons: string[];
  roiSnapshot?: ROIResults;
  currency?: Currency;
  inputs?: ROIInputs;
}

export interface AssessmentState {
  onboarding: Partial<OnboardingData>;
  opportunities: Opportunity[];
  selectedOpportunityId: string | null;
  roiInputs: Partial<ROIInputs>;
  recommendation: Recommendation | null;
  roiByOpportunity: Record<string, Partial<ROIInputs>>;
}
