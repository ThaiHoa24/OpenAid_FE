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
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "vi" || stored === "en") {
        setLanguageState(stored);
      }
    } catch {
      // fallback to default
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "vi" || e.newValue === "en")) {
        setLanguageState(e.newValue as Language);
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail === "vi" || customEvent.detail === "en") {
        setLanguageState(customEvent.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("openaid-language-changed", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("openaid-language-changed", handleCustomChange);
    };
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
        const locale = language === "vi" ? "vi-VN" : "en-US";
        return new Intl.DateTimeFormat(locale, options || {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(d);
      } catch {
        return String(date);
      }
    },
    [language]
  );

  const formatDateTime = useCallback(
    (date: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => {
      if (!date) return "";
      try {
        const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);
        const locale = language === "vi" ? "vi-VN" : "en-US";
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
    [language]
  );

  const formatNumber = useCallback(
    (num: number | null | undefined, options?: Intl.NumberFormatOptions) => {
      if (num === null || num === undefined) return "0";
      try {
        const locale = language === "vi" ? "vi-VN" : "en-US";
        return new Intl.NumberFormat(locale, options).format(num);
      } catch {
        return String(num);
      }
    },
    [language]
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
