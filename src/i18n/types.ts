export type Language = "vi";

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}
