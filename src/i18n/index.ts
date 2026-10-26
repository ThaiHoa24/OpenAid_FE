import { Language } from "./types";
import { vi } from "./vi";
import { en } from "./en";

export type { Language };
export { vi, en };

export const translations: Record<Language, typeof vi> = {
  vi,
  en,
};

export function getTranslation(
  lang: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.vi;
  const parts = key.split(".");

  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      current = undefined;
      break;
    }
  }

  // Fallback to Vietnamese if not found
  if (typeof current !== "string" && lang !== "vi") {
    let fallback: unknown = translations.vi;
    for (const part of parts) {
      if (fallback && typeof fallback === "object" && part in fallback) {
        fallback = (fallback as Record<string, unknown>)[part];
      } else {
        fallback = undefined;
        break;
      }
    }
    if (typeof fallback === "string") {
      current = fallback;
    }
  }

  if (typeof current !== "string") {
    return key;
  }

  let text = current;
  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
    }
  }

  return text;
}
