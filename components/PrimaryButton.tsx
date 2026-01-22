import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from "react-native";
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
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary[650],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg + 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary[650],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: Colors.border.medium,
    shadowOpacity: 0,
  },
  buttonText: {
    fontSize: Typography.fontSize['lg-md'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    letterSpacing: Typography.letterSpacing.wide,
  },
});
