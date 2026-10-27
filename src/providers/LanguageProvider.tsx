"use client";

import React, { createContext, useEffect, useState, useCallback, useMemo } from "react";
import { Language, getTranslation } from "@/i18n";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number | null | undefined, options?: Intl.NumberFormatOptions) => string;
}

const STORAGE_KEY = "openaid-language";
const DEFAULT_LANG: Language = "vi";

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "vi");
    } catch {
      // fallback
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      window.dispatchEvent(new CustomEvent("openaid-language-changed", { detail: lang }));
    } catch (e) {
      console.error("Failed to save language to localStorage", e);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslation(language, key, params);
    },
    [language]
  );

  const formatDate = useCallback(
    (date: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => {
      if (!date) return "";
      try {
        const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);
        const locale = "vi-VN";
        return new Intl.DateTimeFormat(locale, options || {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(d);
      } catch {
        return String(date);
      }
    },
    []
  );

  const formatDateTime = useCallback(
    (date: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => {
      if (!date) return "";
      try {
        const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);
        const locale = "vi-VN";
        return new Intl.DateTimeFormat(locale, options || {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
      } catch {
        return String(date);
      }
    },
    []
  );

  const formatNumber = useCallback(
    (num: number | null | undefined, options?: Intl.NumberFormatOptions) => {
      if (num === null || num === undefined) return "0";
      try {
        const locale = "vi-VN";
        return new Intl.NumberFormat(locale, options).format(num);
      } catch {
        return String(num);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      formatDate,
      formatDateTime,
      formatNumber,
    }),
    [language, setLanguage, t, formatDate, formatDateTime, formatNumber]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
