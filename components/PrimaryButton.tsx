import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, Platform } from "react-native";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function PrimaryButton({ title, onPress, disabled, loading, style }: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        style,
        !disabled && !loading && pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary[650],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg + 2,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(91, 78, 255, 0.3)", elevation: 4 }
      : { ...Shadows.lg, shadowColor: Colors.primary[650], shadowOpacity: 0.3 }),
  },
  buttonDisabled: {
    backgroundColor: Colors.border.medium,
    ...(Platform.OS === "web" ? {} : { shadowOpacity: 0 }),
  },
  buttonText: {
    fontSize: Typography.fontSize['lg-md'],
    fontWeight: Platform.OS === 'web' ? 700 : Typography.fontWeight.bold, // Use number for web compatibility
    color: Colors.white,
    letterSpacing: Typography.letterSpacing.wide,
    // Ensure font renders on mobile web
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined, // Use system default on native
    }),
    // Force font rendering on web
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
});
