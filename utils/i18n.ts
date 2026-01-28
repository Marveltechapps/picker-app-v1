import { useMemo } from "react";
import { LanguageCode } from "@/state/languageContext";
import enTranslations from "@/locales/en.json";
import taTranslations from "@/locales/ta.json";
import hiTranslations from "@/locales/hi.json";

type TranslationKey = string;
type TranslationObject = Record<string, any>;

const translations: Record<LanguageCode, TranslationObject> = {
  en: enTranslations,
  ta: taTranslations,
  hi: hiTranslations,
};

const FALLBACK_LANGUAGE: LanguageCode = "en";

export const useTranslation = (language: LanguageCode) => {
  const t = useMemo(
    () => (key: TranslationKey): string => {
      const keys = key.split(".");
      let value: any = translations[language] || translations[FALLBACK_LANGUAGE];

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          // Fallback to English if key not found
          if (language !== FALLBACK_LANGUAGE) {
            value = translations[FALLBACK_LANGUAGE];
            for (const fallbackKey of keys) {
              if (value && typeof value === "object" && fallbackKey in value) {
                value = value[fallbackKey];
              } else {
                return key; // Return key if not found even in fallback
              }
            }
            break;
          }
          return key; // Return key if not found
        }
      }

      if (typeof value === "string") {
        return value;
      }

      return key; // Return key if value is not a string
    },
    [language]
  );

  return { t };
};
