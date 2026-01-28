import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

export type LanguageCode = "en" | "ta" | "hi";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

const STORAGE_KEY = "@app/language";
const DEFAULT_LANGUAGE: LanguageCode = "en";

interface LanguageState {
  currentLanguage: LanguageCode;
  isLoading: boolean;
}

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [state, setState] = useState<LanguageState>({
    currentLanguage: DEFAULT_LANGUAGE,
    isLoading: true,
  });

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && SUPPORTED_LANGUAGES.some((lang) => lang.code === savedLanguage)) {
        setState({
          currentLanguage: savedLanguage as LanguageCode,
          isLoading: false,
        });
      } else {
        setState({
          currentLanguage: DEFAULT_LANGUAGE,
          isLoading: false,
        });
      }
    } catch (error) {
      // Silently handle error and use default
      setState({
        currentLanguage: DEFAULT_LANGUAGE,
        isLoading: false,
      });
    }
  };

  const setLanguage = async (languageCode: LanguageCode) => {
    try {
      setState((prev) => ({ ...prev, currentLanguage: languageCode }));
      await AsyncStorage.setItem(STORAGE_KEY, languageCode);
    } catch (error) {
      if (__DEV__) {
        console.error("Error saving language preference:", error);
      }
    }
  };

  const getCurrentLanguage = (): Language => {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === state.currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  return {
    ...state,
    setLanguage,
    getCurrentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
});
