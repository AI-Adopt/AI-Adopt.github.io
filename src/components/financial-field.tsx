"use client";

export function FinancialField({ label, value, onChange, min = 0, max = 100000000, step = "any", suffix, slider = false }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number | "any"; suffix?: string; slider?: boolean }) {
  return <label className="block min-w-0">
    <span className="mb-2 block text-sm leading-snug text-muted-foreground">{label}{suffix ? ` (${suffix})` : ""}</span>
    <input className="w-full rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 py-2 text-xl font-medium outline-none transition-colors focus:border-[#6b4eff] focus:ring-0" type="number" inputMode="decimal" required min={min} max={max} step={step} value={Number.isFinite(value) ? value : 0} onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))} onBlur={() => onChange(Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)))} />
    {slider && <input className="mt-3 w-full accent-[#765ca1]" type="range" aria-label={label} min={min} max={max} step={step === "any" ? 1 : step} value={value} onChange={e => onChange(Number(e.target.value))} />}
  </label>;
}
