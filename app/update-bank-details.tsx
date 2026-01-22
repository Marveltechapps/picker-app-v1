import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Hash, Building2, CreditCard, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react-native";
import Header from "@/components/Header";
import { Colors, Typography, Spacing, BorderRadius, Shadows, IconSizes } from "@/constants/theme";

const STORAGE_KEY = "@bank/bank_details";

export default function UpdateBankDetailsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [accountHolder, setAccountHolder] = useState("Arjun Kumar");
  const [accountNumber, setAccountNumber] = useState("1234567890123456");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("1234567890123456");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [branch, setBranch] = useState("MG Road, Bangalore");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const bankData = JSON.parse(data);
        setAccountHolder(bankData.accountHolder || "Arjun Kumar");
        setAccountNumber(bankData.accountNumber || "1234567890123456");
        setConfirmAccountNumber(bankData.accountNumber || "1234567890123456");
        setBankName(bankData.bankName || "HDFC Bank");
        setIfscCode(bankData.ifscCode || "HDFC0001234");
        setBranch(bankData.branch || "MG Road, Bangalore");
      }
    } catch (error) {
      console.error("Error loading bank details:", error);
    }
  };

  const handleUpdate = async () => {
    if (accountNumber !== confirmAccountNumber) {
      Alert.alert("Error", "Account numbers do not match");
      return;
    }

    if (!accountHolder || !accountNumber || !bankName || !ifscCode || !branch) {
      Alert.alert("Error", "Please fill all bank details");
      return;
    }

    if (ifscCode.length !== 11) {
      Alert.alert("Error", "IFSC code must be 11 characters");
      return;
    }

    setLoading(true);
    try {
      const bankData = {
        accountHolder,
        accountNumber,
        bankName,
        ifscCode,
        branch,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bankData));
      
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          "Success",
          "Bank details updated successfully",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to save bank details");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Update Bank Details" />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Bank Account Details</Text>
          <Text style={styles.sectionSubtitle}>Enter your bank information for salary payments</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Holder Name</Text>
            <View style={[styles.inputContainer, focusedField === "accountHolder" && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                value={accountHolder}
                onChangeText={setAccountHolder}
                placeholder="Enter full name as per bank account"
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="words"
                onFocus={() => setFocusedField("accountHolder")}
                onBlur={() => setFocusedField(null)}
              />
              {accountHolder.length > 0 && (
                <CheckCircle2 color={Colors.success[400]} size={IconSizes.sm} strokeWidth={2} />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={[styles.inputContainer, focusedField === "accountNumber" && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Enter your bank account number"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={20}
                onFocus={() => setFocusedField("accountNumber")}
                onBlur={() => setFocusedField(null)}
              />
              {accountNumber.length > 0 && (
                <CheckCircle2 color={Colors.success[400]} size={IconSizes.sm} strokeWidth={2} />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Account Number</Text>
            <View style={[styles.inputContainer, focusedField === "confirmAccountNumber" && styles.inputContainerFocused, accountNumber !== confirmAccountNumber && confirmAccountNumber.length > 0 && styles.inputContainerError]}>
              <TextInput
                style={styles.input}
                value={confirmAccountNumber}
                onChangeText={setConfirmAccountNumber}
                placeholder="Re-enter account number to confirm"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={20}
                onFocus={() => setFocusedField("confirmAccountNumber")}
                onBlur={() => setFocusedField(null)}
              />
              {accountNumber === confirmAccountNumber && confirmAccountNumber.length > 0 && (
                <CheckCircle2 color={Colors.success[400]} size={IconSizes.sm} strokeWidth={2} />
              )}
            </View>
            {accountNumber !== confirmAccountNumber && confirmAccountNumber.length > 0 && (
              <Text style={styles.errorText}>Account numbers do not match</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank Name</Text>
            <View style={[styles.inputContainer, focusedField === "bankName" && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Enter your bank name"
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="words"
                onFocus={() => setFocusedField("bankName")}
                onBlur={() => setFocusedField(null)}
              />
              {bankName.length > 0 && (
                <CheckCircle2 color={Colors.success[400]} size={IconSizes.sm} strokeWidth={2} />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>IFSC Code</Text>
            <View style={[styles.inputContainer, focusedField === "ifscCode" && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                value={ifscCode}
                onChangeText={(text) => setIfscCode(text.toUpperCase())}
                placeholder="Enter 11-digit IFSC code"
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="characters"
                maxLength={11}
                onFocus={() => setFocusedField("ifscCode")}
                onBlur={() => setFocusedField(null)}
              />
              {ifscCode.length === 11 && (
                <CheckCircle2 color={Colors.success[400]} size={IconSizes.sm} strokeWidth={2} />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Branch Location</Text>
            <View style={[styles.inputContainer, focusedField === "branch" && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                value={branch}
                onChangeText={setBranch}
                placeholder="Enter branch name and location"
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="words"
                onFocus={() => setFocusedField("branch")}
                onBlur={() => setFocusedField(null)}
              />
              {branch.length > 0 && (
                <CheckCircle2 color={Colors.success[400]} size={IconSizes.sm} strokeWidth={2} />
              )}
            </View>
          </View>

          <View style={styles.infoBox}>
            <AlertTriangle color={Colors.warning[400]} size={IconSizes.md} strokeWidth={2} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Important</Text>
              <Text style={styles.infoText}>
                Ensure your bank details are correct. All salary payments will be credited to this account.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>
              {loading ? "Updating..." : "Update Bank Details"}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.md,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.gray[700],
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  inputContainerFocused: {
    borderColor: Colors.primary[500],
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.error[400],
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.primary,
    padding: 0,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.error[400],
    marginTop: Spacing.sm,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.warning[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning[100],
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.secondary[700],
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.secondary[700],
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  updateButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});

