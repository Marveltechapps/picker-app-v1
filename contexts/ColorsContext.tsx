import React, { createContext, useContext, useMemo } from "react";
import { useTheme } from "@/state/themeContext";
import { getThemeColors, BaseColors } from "@/constants/theme";

type ThemeColors = ReturnType<typeof getThemeColors>;

export interface ColorsContextValue extends ThemeColors {
  // Include base colors for backward compatibility
  primary: typeof BaseColors.primary;
  accent: typeof BaseColors.accent;
  secondary: typeof BaseColors.secondary;
  success: typeof BaseColors.success;
  error: typeof BaseColors.error;
  warning: typeof BaseColors.warning;
  info: typeof BaseColors.info;
  gray: typeof BaseColors.gray;
  white: typeof BaseColors.white;
  black: typeof BaseColors.black;
}

const ColorsContext = createContext<ColorsContextValue | null>(null);

export function ColorsProvider({ children }: { children: React.ReactNode }) {
  const { effectiveTheme } = useTheme();
  
  const colors = useMemo(() => {
    const themeColors = getThemeColors(effectiveTheme);
    return {
      ...themeColors,
      // Ensure base colors are always available
      primary: BaseColors.primary,
      accent: BaseColors.accent,
      secondary: BaseColors.secondary,
      success: BaseColors.success,
      error: BaseColors.error,
      warning: BaseColors.warning,
      info: BaseColors.info,
      gray: BaseColors.gray,
      white: BaseColors.white,
      black: BaseColors.black,
    } as ColorsContextValue;
  }, [effectiveTheme]);

  return (
    <ColorsContext.Provider value={colors}>
      {children}
    </ColorsContext.Provider>
  );
}

export function useColors(): ColorsContextValue {
  const context = useContext(ColorsContext);
  if (!context) {
    // Fallback to light theme if context not available (shouldn't happen)
    const fallback = getThemeColors("light");
    return {
      ...fallback,
      primary: BaseColors.primary,
      accent: BaseColors.accent,
      secondary: BaseColors.secondary,
      success: BaseColors.success,
      error: BaseColors.error,
      warning: BaseColors.warning,
      info: BaseColors.info,
      gray: BaseColors.gray,
      white: BaseColors.white,
      black: BaseColors.black,
    } as ColorsContextValue;
  }
  return context;
}
