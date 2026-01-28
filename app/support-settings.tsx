import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  HelpCircle,
  MessageCircle,
  Globe,
  Palette,
  Info,
  Bell,
  FileText,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { useLanguage } from "@/state/languageContext";
import { useTranslation } from "@/utils/i18n";
import LanguageSelector from "@/components/LanguageSelector";
import { useTheme } from "@/state/themeContext";
import { useColors, ColorsContextValue } from "@/contexts/ColorsContext";
import ThemeSelector from "@/components/ThemeSelector";
import { setupPushNotificationsComplete } from "@/utils/notificationService";
import { useAuth } from "@/state/authContext";

export default function SupportSettingsScreen() {
  const router = useRouter();
  const { currentLanguage, getCurrentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage);
  const { getCurrentTheme } = useTheme();
  const colors = useColors();
  const { phoneNumber } = useAuth();
  const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] = useState(false);
  const [isThemeSelectorVisible, setIsThemeSelectorVisible] = useState(false);
  const [isSettingUpNotifications, setIsSettingUpNotifications] = useState(false);

  const currentTheme = getCurrentTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const currentLang = getCurrentLanguage();

  const helpItems = [
    {
      icon: HelpCircle,
      title: t("supportSettings.helpItems.faqs"),
      bgColor: "#EEF2FF",
      iconColor: "#8B5CF6",
      onPress: () => router.push("/faqs" as any),
    },
    {
      icon: MessageCircle,
      title: t("supportSettings.helpItems.contactSupport"),
      bgColor: "#D1FAE5",
      iconColor: "#10B981",
      onPress: () => router.push("/contact-support" as any),
    },
  ];

  const settingsItems = [
    {
      icon: Globe,
      title: t("supportSettings.settingsItems.language"),
      value: currentLang.nativeName,
      bgColor: "#FEF3C7",
      iconColor: "#FACC15",
      onPress: () => setIsLanguageSelectorVisible(true),
    },
    {
      icon: Palette,
      title: t("supportSettings.settingsItems.theme"),
      value: currentTheme.name,
      bgColor: "#FFEDD5",
      iconColor: "#F97316",
      onPress: () => setIsThemeSelectorVisible(true),
    },
    {
      icon: Info,
      title: t("supportSettings.settingsItems.appVersion"),
      value: "1.2.0",
      bgColor: "#E5E7EB",
      iconColor: "#6B7280",
      isInfo: true,
    },
  ];

  const handlePushNotificationPress = async () => {
    if (isSettingUpNotifications) {
      return; // Prevent multiple simultaneous requests
    }

    setIsSettingUpNotifications(true);

    try {
      const result = await setupPushNotificationsComplete(phoneNumber || undefined, true);

      if (result.success) {
        Alert.alert(
          'Push Notifications Enabled',
          'You will now receive push notifications from Picker Pro. A test notification has been sent.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Push Notifications Setup Failed',
          result.error || 'Unable to set up push notifications. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error handling push notification press:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while setting up push notifications.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSettingUpNotifications(false);
    }
  };

  const notificationItems = [
    {
      icon: Bell,
      title: t("supportSettings.notificationItems.pushNotifications"),
      bgColor: "#FEE2E2",
      iconColor: "#EF4444",
      onPress: handlePushNotificationPress,
      disabled: isSettingUpNotifications,
    },
  ];

  const aboutItems = [
    {
      icon: FileText,
      title: t("supportSettings.aboutItems.termsConditions"),
      bgColor: "#FEF3C7",
      iconColor: "#FACC15",
      onPress: () => router.push("/terms-conditions" as any),
    },
    {
      icon: Shield,
      title: t("supportSettings.aboutItems.privacyPolicy"),
      bgColor: "#FFEDD5",
      iconColor: "#F97316",
      onPress: () => router.push("/privacy-policy" as any),
    },
  ];

  const renderSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={item.isInfo || item.disabled ? 1 : 0.7}
              onPress={item.onPress}
              disabled={item.isInfo || item.disabled}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                <item.icon color={item.iconColor} size={24} strokeWidth={2} />
              </View>
              <Text style={[styles.settingTitle, item.disabled && styles.settingTitleDisabled]}>
                {item.title}
              </Text>
              {item.value && (
                <Text style={styles.settingValue}>{item.value}</Text>
              )}
              {item.disabled && (
                <Text style={styles.settingValue}>Setting up...</Text>
              )}
              {!item.isInfo && !item.disabled && (
                <ChevronRight color={colors.border.medium} size={20} strokeWidth={2} />
              )}
            </TouchableOpacity>
            {index < items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={t("supportSettings.title")} 
        subtitle={t("supportSettings.subtitle")} 
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSection(t("supportSettings.sections.helpSupport"), helpItems)}
        {renderSection(t("supportSettings.sections.appSettings"), settingsItems)}
        {renderSection(t("supportSettings.sections.notifications"), notificationItems)}
        {renderSection(t("supportSettings.sections.about"), aboutItems)}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LanguageSelector
        visible={isLanguageSelectorVisible}
        onClose={() => setIsLanguageSelectorVisible(false)}
      />

      <ThemeSelector
        visible={isThemeSelectorVisible}
        onClose={() => setIsThemeSelectorVisible(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorsContextValue) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.text.tertiary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)', elevation: 2 }
      : { shadowColor: "#000000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }
    ),
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  settingTitleDisabled: {
    opacity: 0.6,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: colors.text.secondary,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 76,
  },
  bottomSpacer: {
    height: 20,
  },
});
