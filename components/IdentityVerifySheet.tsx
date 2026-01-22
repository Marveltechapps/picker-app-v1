import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import { Camera, Fingerprint, Shield, ChevronRight } from "lucide-react-native";

interface IdentityVerifySheetProps {
  visible: boolean;
  onSelectMethod: (method: "face" | "fingerprint") => void;
  onClose: () => void;
  onBack: () => void;
}

export default function IdentityVerifySheet({ visible, onSelectMethod, onClose, onBack }: IdentityVerifySheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<"face" | "fingerprint" | null>(null);

  const handleSelectMethod = (method: "face" | "fingerprint") => {
    setSelectedMethod(method);
    setTimeout(() => {
      onSelectMethod(method);
    }, 300);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Verify Identity" height="80%" onBack={onBack}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.stepIndicator}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "100%" }]} />
            </View>
            <View style={styles.stepLabels}>
              <Text style={styles.stepLabelActive}>Step 2 of 2</Text>
              <Text style={styles.stepLabelActive}>Identity Verification</Text>
            </View>
          </View>

          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Shield color="#6366F1" size={60} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>Choose your preferred method</Text>

          <View style={styles.methodsContainer}>
            <TouchableOpacity
              style={[
                styles.methodCard,
                styles.methodCardBlue,
                selectedMethod === "face" && styles.methodCardSelected,
              ]}
              onPress={() => handleSelectMethod("face")}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.methodIcon, styles.methodIconBlue]}>
                  <Camera color="#3B82F6" size={28} strokeWidth={2.5} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Face Recognition</Text>
                  <Text style={styles.methodSubtitle}>Quick and contactless</Text>
                </View>
              </View>
              <ChevronRight color="#9CA3AF" size={24} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                styles.methodCardPink,
                selectedMethod === "fingerprint" && styles.methodCardSelected,
              ]}
              onPress={() => handleSelectMethod("fingerprint")}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.methodIcon, styles.methodIconPink]}>
                  <Fingerprint color="#EC4899" size={28} strokeWidth={2.5} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Fingerprint Scan</Text>
                  <Text style={styles.methodSubtitle}>Secure biometric</Text>
                </View>
              </View>
              <ChevronRight color="#9CA3AF" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxText}>Remember my choice</Text>
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  stepIndicator: {
    width: "100%",
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 2,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepLabelActive: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  methodsContainer: {
    width: "100%",
    gap: 16,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  methodCardBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  methodCardPink: {
    backgroundColor: "#FCE7F3",
    borderColor: "#FBCFE8",
  },
  methodCardSelected: {
    borderColor: "#6366F1",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconBlue: {
    backgroundColor: "#DBEAFE",
  },
  methodIconPink: {
    backgroundColor: "#FBCFE8",
  },
  methodInfo: {
    gap: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  methodSubtitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
});
