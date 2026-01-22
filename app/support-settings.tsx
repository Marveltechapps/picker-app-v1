import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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

export default function SupportSettingsScreen() {
  const router = useRouter();

  const helpItems = [
    {
      icon: HelpCircle,
      title: "FAQs",
      bgColor: "#EEF2FF",
      iconColor: "#8B5CF6",
      onPress: () => router.push("/faqs" as any),
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      bgColor: "#D1FAE5",
      iconColor: "#10B981",
      onPress: () => router.push("/contact-support" as any),
    },
  ];

  const settingsItems = [
    {
      icon: Globe,
      title: "Language",
      value: "English",
      bgColor: "#FEF3C7",
      iconColor: "#FACC15",
      onPress: () => {},
    },
    {
      icon: Palette,
      title: "Theme",
      value: "System",
      bgColor: "#FFEDD5",
      iconColor: "#F97316",
      onPress: () => {},
    },
    {
      icon: Info,
      title: "App Version",
      value: "1.2.0",
      bgColor: "#E5E7EB",
      iconColor: "#6B7280",
      isInfo: true,
    },
  ];

  const notificationItems = [
    {
      icon: Bell,
      title: "Push Notifications",
      bgColor: "#FEE2E2",
      iconColor: "#EF4444",
      onPress: () => {},
    },
  ];

  const aboutItems = [
    {
      icon: FileText,
      title: "Terms & Conditions",
      bgColor: "#FEF3C7",
      iconColor: "#FACC15",
      onPress: () => router.push("/terms-conditions" as any),
    },
    {
      icon: Shield,
      title: "Privacy Policy",
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
              activeOpacity={item.isInfo ? 1 : 0.7}
              onPress={item.onPress}
              disabled={item.isInfo}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                <item.icon color={item.iconColor} size={24} strokeWidth={2} />
              </View>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.value && (
                <Text style={styles.settingValue}>{item.value}</Text>
              )}
              {!item.isInfo && (
                <ChevronRight color="#D1D5DB" size={20} strokeWidth={2} />
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
      <Header title="Support & Settings" subtitle="Help, preferences & app settings" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSection("HELP & SUPPORT", helpItems)}
        {renderSection("APP SETTINGS", settingsItems)}
        {renderSection("NOTIFICATIONS", notificationItems)}
        {renderSection("ABOUT", aboutItems)}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    color: "#9CA3AF",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    color: "#111827",
  },
  settingValue: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#9CA3AF",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 76,
  },
  bottomSpacer: {
    height: 20,
  },
});
