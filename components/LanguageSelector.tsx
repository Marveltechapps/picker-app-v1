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
import { Check, X } from "lucide-react-native";
import { useLanguage, Language, LanguageCode } from "@/state/languageContext";
import { useTranslation } from "@/utils/i18n";

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation(currentLanguage);

  const handleLanguageSelect = async (languageCode: LanguageCode) => {
    await setLanguage(languageCode);
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
            <Text style={styles.headerTitle}>{t("supportSettings.settingsItems.selectLanguage")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#6B7280" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.languageList}>
            {supportedLanguages.map((language: Language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  currentLanguage === language.code && styles.languageItemActive,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                </View>
                {currentLanguage === language.code && (
                  <Check color="#10B981" size={24} strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
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
  languageList: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  languageItemActive: {
    backgroundColor: "#F0FDF4",
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: "#6B7280",
  },
});
