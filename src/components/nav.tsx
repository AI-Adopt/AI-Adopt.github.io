"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { languages, useLanguage } from "@/context/language-provider";

interface NavProps {
  ctaHref?: string;
  ctaLabel?: string;
  showCta?: boolean;
  inverted?: boolean;
}

export function Nav({
  ctaHref = "/onboarding",
  ctaLabel = "Start assessment",
  showCta = true,
  inverted = false,
}: NavProps) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <header className={`absolute top-0 z-50 w-full ${inverted ? "text-white" : ""}`}>
      <div className="flex h-24 w-full items-center justify-between px-5 md:px-7">
        <Link href="/" className="text-xl font-bold tracking-[-0.04em]">
          AdoptAI
        </Link>
        <nav className="hidden items-center gap-10 text-base lg:flex">
          <Link href="/#platform" className={inverted ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"}>{t("platform")}</Link>
          <Link href="/#how-it-works" className={inverted ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"}>{t("how")}</Link>
          <Link href="/#outcomes" className={inverted ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"}>{t("outcomes")}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              aria-label={t("advice.language")}
              aria-expanded={open}
              onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}
              onClick={() => setOpen((value) => !value)}
              className={`flex h-11 items-center gap-2 rounded-[3px] px-3.5 text-sm font-semibold transition-colors ${inverted ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary hover:bg-secondary/70"}`}
            >
              <Languages className="h-3.5 w-3.5" />
              {language.toUpperCase()}
              <ChevronDown className="h-3 w-3" />
            </button>
            {open && (
              <div className="absolute right-0 top-11 z-[70] w-44 overflow-hidden rounded-lg border border-border bg-white py-1 text-foreground shadow-xl">
                {languages.map((item) => (
                  <button
                    type="button"
                    key={item.code}
                    onClick={() => { setLanguage(item.code); setOpen(false); }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#f0edff]"
                  >
                    {item.label}
                    {language === item.code && <Check className="h-3.5 w-3.5 text-[#6b4eff]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {showCta && (
            <Button className="hidden sm:inline-flex" variant={inverted ? "secondary" : "default"} asChild>
              <Link href={ctaHref}>{ctaLabel === "Start assessment" ? t("start") : ctaLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function StepIndicator({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{label}</span>
      <span aria-hidden="true">·</span>
      <span>{t("stepOf", { current, total })}</span>
    </div>
  );
}
