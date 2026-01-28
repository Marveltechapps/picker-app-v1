import { useMemo } from "react";
import { useTheme } from "@/state/themeContext";
import { getThemeColors } from "@/constants/theme";

/**
 * Hook to get theme-aware colors
 * Use this in components to automatically get colors based on current theme
 */
export const useThemeColors = () => {
  const { effectiveTheme } = useTheme();
  
  const colors = useMemo(() => getThemeColors(effectiveTheme), [effectiveTheme]);
  
  return colors;
};
