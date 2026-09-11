"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AssessmentState, OnboardingData, Opportunity, ROIInputs } from "@/types/assessment";
import { buildRecommendationReasons, generateOpportunities, priceOpportunity } from "@/lib/opportunities";
import { calculateROI, normalizeROIInputs, opportunityROIInputs } from "@/lib/roi";
import { SOLUTIONS } from "@/lib/solution-catalog";

const STORAGE_KEY = "adopt-ai-assessment";
const initialState: AssessmentState = { onboarding: {}, opportunities: [], selectedOpportunityId: null, roiInputs: {}, roiByOpportunity: {}, recommendation: null };

export function normalizeStoredState(value: unknown): AssessmentState {
  if (!value || typeof value !== "object") return initialState;
  const stored = value as Partial<AssessmentState>;
  const raw = stored.onboarding && typeof stored.onboarding === "object" ? stored.onboarding : {};
  const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];
  const onboarding: Partial<OnboardingData> = { ...raw,
    industry: typeof raw.industry === "string" ? raw.industry : "",
    businessProcesses: typeof raw.businessProcesses === "string" ? raw.businessProcesses : "",
    country: typeof raw.country === "string" ? raw.country : "",
    companySize: ["1-50", "51-200", "201-1000", "1000+"].includes(raw.companySize ?? "") ? raw.companySize : "1-50",
    departments: strings(raw.departments), repetitiveWorkflows: strings(raw.repetitiveWorkflows), softwareStack: strings(raw.softwareStack),
    processes: Array.isArray(raw.processes) ? raw.processes.filter(p => p && SOLUTIONS.some(s => s.id === p.id)).map(p => {
      const normalized = normalizeROIInputs(p);
      return { id: p.id, employeeCount: normalized.employeeCount, tasksPerMonth: normalized.tasksPerMonth, minutesPerTask: normalized.minutesPerTask, errorRatePercent: normalized.errorRatePercent, errorCost: normalized.errorCost, cashRealizationPercent: normalized.cashRealizationPercent, evidence: normalized.evidence, notes: normalized.notes };
    }) : undefined,
  };
  // Retain old inputs, but do not reuse old financial outputs or invented workload estimates.
  const overrides = stored.roiByOpportunity && typeof stored.roiByOpportunity === "object" ? { ...stored.roiByOpportunity } : {};
  if (stored.selectedOpportunityId && stored.roiInputs && typeof stored.roiInputs === "object" && !overrides[stored.selectedOpportunityId]) {
    overrides[stored.selectedOpportunityId] = stored.roiInputs;
  }
  const opportunities = Array.isArray(stored.opportunities) ? stored.opportunities.filter(o => o && typeof o.id === "string" && typeof o.title === "string").map(o => {
    const previous = overrides[o.id];
    // Version-2 assumptions remain in the backup; v3 must collect measured workload and cash realization.
    if (previous?.modelVersion !== 3) delete overrides[o.id];
    const definition = SOLUTIONS.find(s => s.id === o.id);
    return priceOpportunity(definition ? { ...o, title: definition.title, description: `solution.${o.id}.description`, implementationComplexity: definition.complexity } : o, onboarding, overrides[o.id]);
  }) : [];
  const selectedOpportunityId = opportunities.some(o => o.id === stored.selectedOpportunityId) ? stored.selectedOpportunityId! : opportunities[0]?.id ?? null;
  const selected = opportunities.find(o => o.id === selectedOpportunityId);
  const inputs = selected ? normalizeROIInputs(overrides[selected.id] ?? {}, opportunityROIInputs(selected, onboarding)) : undefined;
  const recommendation = stored.recommendation && selected && inputs ? { opportunity: selected, reasons: buildRecommendationReasons(selected, selected.roi), roiSnapshot: calculateROI(inputs), inputs, currency: inputs.currency } : null;
  return { onboarding, opportunities, selectedOpportunityId, roiInputs: inputs ?? {}, roiByOpportunity: overrides, recommendation };
}

interface AssessmentContextValue extends AssessmentState {
  setOnboarding: (data: Partial<OnboardingData>) => void;
  completeOnboarding: (data: OnboardingData) => void;
  setSelectedOpportunity: (id: string) => void;
  setROIInputs: (inputs: Partial<ROIInputs>) => void;
  generateRecommendation: (inputs?: ROIInputs) => void;
  resetAssessment: () => void;
  getSelectedOpportunity: () => Opportunity | undefined;
}
const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("orion-ai-assessment");
      if (stored) {
        if (!localStorage.getItem(`${STORAGE_KEY}-pre-v3`)) localStorage.setItem(`${STORAGE_KEY}-pre-v3`, stored);
        setState(normalizeStoredState(JSON.parse(stored)));
      }
    } catch { /* Storage can be disabled; the assessment still works in memory. */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Keep the in-memory assessment. */ } }
  }, [state, hydrated]);

  const setOnboarding = (data: Partial<OnboardingData>) => setState(prev => ({ ...prev, onboarding: { ...prev.onboarding, ...data } }));
  const completeOnboarding = (data: OnboardingData) => setState(prev => {
    const opportunities = generateOpportunities(data).map(o => priceOpportunity(o, data, prev.roiByOpportunity[o.id]));
    const selected = opportunities.find(o => o.id === prev.selectedOpportunityId) ?? opportunities[0];
    const roiInputs = selected ? normalizeROIInputs(prev.roiByOpportunity[selected.id] ?? {}, opportunityROIInputs(selected, data)) : {};
    return { ...prev, onboarding: data, opportunities, selectedOpportunityId: selected?.id ?? null, roiInputs, recommendation: null };
  });
  const setSelectedOpportunity = (id: string) => setState(prev => {
    const selected = prev.opportunities.find(o => o.id === id);
    if (!selected) return prev;
    return { ...prev, selectedOpportunityId: id, roiInputs: normalizeROIInputs(prev.roiByOpportunity[id] ?? {}, opportunityROIInputs(selected, prev.onboarding)), recommendation: null };
  });
  const setROIInputs = (patch: Partial<ROIInputs>) => setState(prev => {
    const selected = prev.opportunities.find(o => o.id === prev.selectedOpportunityId);
    if (!selected) return prev;
    const overrides = { ...prev.roiByOpportunity[selected.id], ...patch, modelVersion: 3 as const };
    const roiInputs = normalizeROIInputs(overrides, opportunityROIInputs(selected, prev.onboarding));
    const opportunities = prev.opportunities.map(o => o.id === selected.id ? priceOpportunity(o, prev.onboarding, roiInputs) : o);
    return { ...prev, roiInputs, roiByOpportunity: { ...prev.roiByOpportunity, [selected.id]: overrides }, opportunities, recommendation: null };
  });
  const generateRecommendation = (given?: ROIInputs) => setState(prev => {
    const selected = prev.opportunities.find(o => o.id === prev.selectedOpportunityId) ?? prev.opportunities[0];
    if (!selected) return prev;
    const inputs = normalizeROIInputs(given ?? prev.roiByOpportunity[selected.id] ?? {}, opportunityROIInputs(selected, prev.onboarding));
    const opportunity = priceOpportunity(selected, prev.onboarding, inputs);
    const roiSnapshot = calculateROI(inputs);
    return { ...prev, selectedOpportunityId: selected.id, roiInputs: inputs,
      opportunities: prev.opportunities.map(o => o.id === selected.id ? opportunity : o),
      recommendation: { opportunity, roiSnapshot, inputs, currency: inputs.currency, reasons: buildRecommendationReasons(opportunity, roiSnapshot) } };
  });
  const resetAssessment = () => {
    setState(initialState);
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem("orion-ai-assessment"); localStorage.removeItem(`${STORAGE_KEY}-pre-v3`); } catch { /* No persistence available. */ }
  };
  if (!hydrated) return null;
  return <AssessmentContext.Provider value={{ ...state, setOnboarding, completeOnboarding, setSelectedOpportunity, setROIInputs, generateRecommendation, resetAssessment, getSelectedOpportunity: () => state.opportunities.find(o => o.id === state.selectedOpportunityId) }}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
}
