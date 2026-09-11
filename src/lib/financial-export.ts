import { calculateROI } from "@/lib/roi";
import type { ROIInputs } from "@/types/assessment";

export function businessCaseCSV(inputs: ROIInputs, title: string, label: (key: string) => string): string {
  const result = calculateROI(inputs);
  const rows: (string | number)[][] = [["AdoptAI", title], [label("currency"), inputs.currency], [label("decisionScenario"), label(inputs.scenario)], [label("advice.modelNote")], [], [label("mainAssumptions")]];
  for (const [key, value] of Object.entries(inputs)) rows.push([key, typeof value === "string" && ["estimate", "measured"].includes(value) ? label(`advice.${value}`) : value]);
  rows.push([], [label("advice.cashYear1"), result.annualSavings], [label("roi12"), result.roi12Month ?? label("advice.undefined")], [label("advice.npv36"), result.npv36], [label("advice.capacityValue"), result.capacityValue], [label("advice.peakFunding"), result.peakFunding], [], ["month", "cash_benefit", "operating_cost", "net_cash_flow", "cumulative_net", inputs.currency]);
  for (const row of result.monthlyData) rows.push([row.period, row.benefit, row.operatingCost, row.cashFlow, row.net]);
  // Prevent spreadsheet formula execution from free text, including opportunity titles.
  return "\uFEFF" + rows.map(row => row.map(cell => `"${(typeof cell === "string" && /^[=+@\-\t\r]/.test(cell) ? "'" + cell : String(cell)).replaceAll('"', '""')}"`).join(",")).join("\r\n");
}
