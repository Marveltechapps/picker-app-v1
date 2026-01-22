import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { ChevronLeft, LucideIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, IconSizes } from "@/constants/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: LucideIcon;
  onRightPress?: () => void;
  rightIconColor?: string;
}

export default function Header({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightIcon: RightIcon,
  onRightPress,
  rightIconColor = Colors.text.primary,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
            <ChevronLeft color={Colors.text.primary} size={IconSizes.xl} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {RightIcon ? (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress} activeOpacity={0.7}>
            <RightIcon color={rightIconColor} size={24} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.headerTop,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: Spacing.iconButton,
    height: Spacing.iconButton,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -Spacing.md,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
    height: 48,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.normal,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  rightButton: {
    width: Spacing.iconButton,
    height: Spacing.iconButton,
    alignItems: "center",
    justifyContent: "center",
  },
});
