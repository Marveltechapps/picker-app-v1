import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useAuth } from "@/state/authContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";
import BottomSheetModal from "@/components/BottomSheetModal";
import LegalContent from "@/components/LegalContent";

export default function LoginPhoneScreen() {
  const router = useRouter();
  const { skipToLocationSetup, resetAll } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isValidIndianNumber = (number: string): boolean => {
    if (number.length !== 10) return false;
    if (!/^\d+$/.test(number)) return false;
    const firstDigit = parseInt(number[0]);
    return firstDigit >= 6 && firstDigit <= 9;
  };

  const handlePhoneChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length <= 10) {
      setPhoneNumber(numeric);
    }
  };

  const handleSendOTP = () => {
    if (isValidIndianNumber(phoneNumber)) {
      console.log("Sending OTP to:", phoneNumber);
      router.push({ pathname: "/otp", params: { phoneNumber } });
    }
  };

  const handleSkip = async () => {
    await skipToLocationSetup();
    router.replace("/location-type");
  };

  const handleLogout = async () => {
    console.log("Logging out and resetting all data...");
    setLoading(true);
    await resetAll();
    setLoading(false);
    router.replace("/permissions");
  };

  const isValid = isValidIndianNumber(phoneNumber);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <Header 
        title="Sign in"
        subtitle="Enter your phone number"
        showBack={true}
        rightIcon={LogOut}
        onRightPress={handleLogout}
        rightIconColor={Colors.text.secondary}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.content}>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0000000000"
              placeholderTextColor={Colors.gray[300]}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="number-pad"
              maxLength={10}
              autoFocus
            />
          </View>

          <View style={styles.spacer} />

          <View style={styles.buttonContainer}>
            <PrimaryButton 
              title="Send OTP" 
              onPress={handleSendOTP} 
              disabled={!isValid}
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>Terms & Conditions</Text>
              {"\n"}and <Text style={styles.termsLink} onPress={() => setShowPrivacyModal(true)}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheetModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms & Conditions" height="80%" scrollable>
        <LegalContent type="terms" onAccept={() => setShowTermsModal(false)} />
      </BottomSheetModal>

      <BottomSheetModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy Policy" height="80%" scrollable>
        <LegalContent type="privacy" onAccept={() => setShowPrivacyModal(false)} />
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  inputSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  label: {
    fontSize: Typography.fontSize['md-lg'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg + 2,
    fontSize: Typography.fontSize['lg-md'],
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing['4xl'],
  },
  termsContainer: {
    marginBottom: Spacing['2xl'],
  },
  termsText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  termsLink: {
    color: Colors.primary[650],
    fontWeight: Typography.fontWeight.semibold,
    textDecorationLine: "underline",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  skipText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    marginBottom: Spacing.xl,
  },
});
