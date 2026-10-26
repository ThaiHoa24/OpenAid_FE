export type Language = "vi" | "en";

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}
