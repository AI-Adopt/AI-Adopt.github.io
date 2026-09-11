import type { Complexity } from "@/types/assessment";

export interface SolutionDefinition {
  id: string;
  title: string;
  department: string;
  workflow: string;
  complexity: Complexity;
  automation: number;
  review: number;
  deliveryDays: number;
  months: number;
  vendors: string[];
}

// Starting hypotheses for a scoped pilot, not observed benchmarks or vendor quotes.
export const SOLUTIONS: SolutionDefinition[] = [
  { id: "customer-support", title: "Customer Support Automation", department: "Customer Support", workflow: "Customer ticket routing", complexity: "Medium", automation: 55, review: 25, deliveryDays: 18, months: 2, vendors: ["intercom", "copilot"] },
  { id: "document-processing", title: "Document Processing Automation", department: "Operations", workflow: "Document review", complexity: "Medium", automation: 65, review: 20, deliveryDays: 20, months: 2, vendors: ["powerautomate", "uipath"] },
  { id: "knowledge-assistant", title: "Internal Knowledge Assistant", department: "HR", workflow: "Employee onboarding", complexity: "Medium", automation: 45, review: 20, deliveryDays: 15, months: 2, vendors: ["copilot", "rovo"] },
  { id: "sales-assistant", title: "AI Sales Assistant", department: "Sales", workflow: "Lead qualification", complexity: "Medium", automation: 40, review: 30, deliveryDays: 16, months: 2, vendors: ["hubspot", "powerautomate"] },
  { id: "invoice-automation", title: "Invoice & Expense Automation", department: "Finance", workflow: "Invoice processing", complexity: "High", automation: 60, review: 25, deliveryDays: 28, months: 3, vendors: ["uipath", "powerautomate"] },
  { id: "it-helpdesk", title: "IT Helpdesk Automation", department: "IT", workflow: "IT Helpdesk Automation", complexity: "Medium", automation: 45, review: 25, deliveryDays: 20, months: 2, vendors: ["rovo", "copilot"] },
  { id: "marketing-content", title: "Marketing Content Operations", department: "Marketing", workflow: "Marketing Content Operations", complexity: "Low", automation: 40, review: 40, deliveryDays: 10, months: 1, vendors: ["copilot", "hubspot"] },
  { id: "contract-review", title: "Contract Review Copilot", department: "Legal", workflow: "Compliance checks", complexity: "High", automation: 30, review: 50, deliveryDays: 32, months: 3, vendors: ["uipath", "copilot"] },
  { id: "meeting-summarization", title: "solution.meeting", department: "Operations", workflow: "solution.meeting", complexity: "Low", automation: 55, review: 25, deliveryDays: 6, months: 1, vendors: ["copilot", "rovo"] },
  { id: "reporting-automation", title: "solution.reporting", department: "Finance", workflow: "Report generation", complexity: "Medium", automation: 50, review: 30, deliveryDays: 22, months: 2, vendors: ["powerautomate", "copilot"] },
];

export const REVIEWED_ON = "2026-09-11";
export const VENDORS: Record<string, { name: string; url: string; partners: string; stack: string; basis: string }> = {
  copilot: { name: "Microsoft 365 Copilot", url: "https://www.microsoft.com/en-us/microsoft-365-copilot/pricing", partners: "https://marketplace.microsoft.com/marketplace/partner-dir", stack: "Microsoft 365", basis: "vendor.seats" },
  powerautomate: { name: "Microsoft Power Automate", url: "https://www.microsoft.com/en-us/power-platform/products/power-automate/pricing", partners: "https://marketplace.microsoft.com/marketplace/partner-dir", stack: "Microsoft 365", basis: "vendor.automation" },
  intercom: { name: "Intercom / Fin", url: "https://www.intercom.com/pricing", partners: "https://www.intercom.com/solution-partner-program", stack: "Intercom", basis: "vendor.outcomes" },
  uipath: { name: "UiPath", url: "https://www.uipath.com/pricing", partners: "https://www.uipath.com/partners/service-partners", stack: "UiPath", basis: "vendor.quote" },
  hubspot: { name: "HubSpot Sales Hub", url: "https://www.hubspot.com/products/sales/sales-automation", partners: "https://ecosystem.hubspot.com/marketplace/solutions", stack: "HubSpot", basis: "vendor.tiers" },
  rovo: { name: "Atlassian Rovo", url: "https://support.atlassian.com/rovo/docs/what-is-rovo/", partners: "https://www.atlassian.com/partners", stack: "Atlassian", basis: "vendor.tiers" },
};
