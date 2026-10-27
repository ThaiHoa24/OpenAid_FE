import { Language } from "./types";
import { vi } from "./vi";

export type { Language };
export { vi };

export const translations = {
  vi,
};

export function getTranslation(
  key: string,
  params?: Record<string, string | number>
): string;
export function getTranslation(
  lang: Language | string,
  key: string,
  params?: Record<string, string | number>
): string;
export function getTranslation(
  arg1: string,
  arg2?: string | Record<string, string | number>,
  arg3?: Record<string, string | number>
): string {
  let key: string;
  let params: Record<string, string | number> | undefined;

  if (typeof arg2 === "string") {
    // Called with getTranslation(lang, key, params)
    key = arg2;
    params = arg3;
  } else {
    // Called with getTranslation(key, params)
    key = arg1;
    params = arg2;
  }

  const parts = key.split(".");
  let current: unknown = vi;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      current = undefined;
      break;
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
