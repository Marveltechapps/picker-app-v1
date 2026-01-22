import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useAuth } from "@/state/authContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";

export default function OTPScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const { phoneNumber } = useLocalSearchParams();
  const { completeLogin, resetAll } = useAuth();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length > 1) {
      const digits = numeric.split("").slice(0, 4);
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = numeric;
      setOtp(newOtp);
      if (numeric && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      setLoading(true);
      console.log("Verifying OTP:", otpValue, "for phone:", phoneNumber);
      
      setTimeout(async () => {
        await completeLogin(phoneNumber as string);
        setLoading(false);
        router.replace("/profile");
      }, 1000);
    }
  };

  const handleLogout = async () => {
    console.log("Logging out and resetting all data...");
    setLoading(true);
    await resetAll();
    setLoading(false);
    router.replace("/permissions");
  };

  const isValid = otp.every((digit) => digit !== "");

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <Header 
        title="Verify OTP"
        subtitle="Enter the code sent to your phone"
        showBack={canGoBack}
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
          <View style={styles.titleSection}>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to{"\n"}
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendText}>Didn&apos;t receive the code? <Text style={styles.resendLink}>Resend</Text></Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <PrimaryButton 
              title="Verify OTP" 
              onPress={handleVerifyOTP} 
              disabled={!isValid}
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
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
  titleSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.lg,
  },
  phoneNumber: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[650],
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: Colors.primary[650],
    backgroundColor: Colors.primary[100],
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  resendText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
  },
  resendLink: {
    color: Colors.primary[650],
    fontWeight: Typography.fontWeight.bold,
  },
  buttonContainer: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing.xl,
  },
});
