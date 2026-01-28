import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, X, Sun, Moon, Monitor } from "lucide-react-native";
import { useTheme, Theme, ThemeMode } from "@/state/themeContext";
import { useLanguage } from "@/state/languageContext";
import { useTranslation } from "@/utils/i18n";

const getThemeTranslationKey = (mode: ThemeMode): string => {
  return `supportSettings.themeNames.${mode}`;
};

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export default function ThemeSelector({ visible, onClose }: ThemeSelectorProps) {
  const { themeMode, setTheme, supportedThemes } = useTheme();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage);

  const handleThemeSelect = async (themeMode: ThemeMode) => {
    await setTheme(themeMode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("supportSettings.settingsItems.theme")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#6B7280" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.themeList}>
            {supportedThemes.map((theme: Theme) => {
              const Icon = themeIcons[theme.mode];
              const isSelected = themeMode === theme.mode;
              return (
                <TouchableOpacity
                  key={theme.mode}
                  style={[
                    styles.themeItem,
                    isSelected && styles.themeItemActive,
                  ]}
                  onPress={() => handleThemeSelect(theme.mode)}
                  activeOpacity={0.7}
                >
                  <View style={styles.themeInfo}>
                    <Icon 
                      color={isSelected ? "#10B981" : "#6B7280"} 
                      size={24} 
                      strokeWidth={2} 
                    />
                    <Text style={[styles.themeName, isSelected && styles.themeNameActive]}>
                      {t(getThemeTranslationKey(theme.mode))}
                    </Text>
                  </View>
                  {isSelected && (
                    <Check color="#10B981" size={24} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "80%",
    ...(Platform.OS === "web"
      ? { boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.1)" }
      : {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  themeList: {
    paddingVertical: 8,
  },
  themeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  themeItemActive: {
    backgroundColor: "#F0FDF4",
  },
  themeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  themeNameActive: {
    color: "#10B981",
  },
});
