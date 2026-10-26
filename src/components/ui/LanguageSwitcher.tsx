"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export function LanguageSwitcher({ className = "", showIcon = true }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  return (
    <div
      role="group"
      aria-label="Language Switcher"
      className={`inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-semibold shadow-xs select-none ${className}`}
    >
      {showIcon && (
        <span className="pl-1.5 pr-1 text-slate-400 flex items-center">
          <Globe className="w-3.5 h-3.5" />
        </span>
      )}
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        aria-pressed={language === "vi"}
        className={`px-2 py-1 rounded-md transition-all ${
          language === "vi"
            ? "bg-white text-emerald-700 font-bold shadow-xs border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`px-2 py-1 rounded-md transition-all ${
          language === "en"
            ? "bg-white text-emerald-700 font-bold shadow-xs border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        }`}
      >
        EN
      </button>
    </div>
  );
}
