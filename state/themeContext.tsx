import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface Theme {
  mode: ThemeMode;
  name: string;
}

export const SUPPORTED_THEMES: Theme[] = [
  { mode: "light", name: "Light" },
  { mode: "dark", name: "Dark" },
  { mode: "system", name: "System" },
];

const STORAGE_KEY = "@app/theme";
const DEFAULT_THEME: ThemeMode = "light";

interface ThemeState {
  themeMode: ThemeMode;
  effectiveTheme: "light" | "dark"; // Resolved theme (system resolves to light/dark)
  isLoading: boolean;
}

// Simple system theme detection (can be enhanced with Appearance API later)
const getSystemTheme = (): "light" | "dark" => {
  // For now, default to light. Can be enhanced with react-native Appearance API
  return "light";
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [state, setState] = useState<ThemeState>({
    themeMode: DEFAULT_THEME,
    effectiveTheme: "light",
    isLoading: true,
  });

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    // Update effective theme when themeMode changes
    // Use functional update to avoid dependency on state.effectiveTheme
    setState((prev) => {
      const newEffectiveTheme = prev.themeMode === "system" 
        ? getSystemTheme() 
        : prev.themeMode;
      
      // Only update if effectiveTheme actually changed
      if (prev.effectiveTheme !== newEffectiveTheme) {
        return { ...prev, effectiveTheme: newEffectiveTheme };
      }
      return prev; // No change needed
    });
  }, [state.themeMode]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTheme && SUPPORTED_THEMES.some((theme) => theme.mode === savedTheme)) {
        const themeMode = savedTheme as ThemeMode;
        const effectiveTheme = themeMode === "system" ? getSystemTheme() : themeMode;
        setState({
          themeMode,
          effectiveTheme,
          isLoading: false,
        });
      } else {
        setState({
          themeMode: DEFAULT_THEME,
          effectiveTheme: "light",
          isLoading: false,
        });
      }
    } catch (error) {
      // Silently handle error and use default
      setState({
        themeMode: DEFAULT_THEME,
        effectiveTheme: "light",
        isLoading: false,
      });
    }
  };

  const setTheme = async (themeMode: ThemeMode) => {
    try {
      const effectiveTheme = themeMode === "system" ? getSystemTheme() : themeMode;
      setState((prev) => ({ ...prev, themeMode, effectiveTheme }));
      await AsyncStorage.setItem(STORAGE_KEY, themeMode);
    } catch (error) {
      if (__DEV__) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  const getCurrentTheme = (): Theme => {
    return SUPPORTED_THEMES.find((theme) => theme.mode === state.themeMode) || SUPPORTED_THEMES[0];
  };

  return {
    ...state,
    setTheme,
    getCurrentTheme,
    supportedThemes: SUPPORTED_THEMES,
  };
});
