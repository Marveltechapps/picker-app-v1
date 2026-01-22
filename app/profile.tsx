import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, LogOut, User } from "lucide-react-native";
import { useAuth } from "@/state/authContext";
import ProfileAvatarUploader from "@/components/ProfileAvatarUploader";
import RadioGroup from "@/components/RadioGroup";
import PrimaryButton from "@/components/PrimaryButton";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function UserProfileScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const { completeProfile, resetAll } = useAuth();
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAgeChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric === "" || (parseInt(numeric) >= 1 && parseInt(numeric) <= 120)) {
      setAge(numeric);
    }
  };

  const handleLogout = async () => {
    console.log("Logging out and resetting all data...");
    setLoading(true);
    await resetAll();
    setLoading(false);
    router.replace("/permissions");
  };

  const handleContinue = async () => {
    const ageNum = parseInt(age);
    if (photoUri && name.length >= 2 && ageNum >= 1 && ageNum <= 120 && gender) {
      setLoading(true);
      console.log("Saving profile:", { name, age: ageNum, gender, photoUri });
      
      await completeProfile({
        name,
        age: ageNum,
        gender: gender as "male" | "female",
        photoUri,
      });

      setLoading(false);
      router.replace("/verification");
    }
  };

  const isValid = photoUri !== null && name.length >= 2 && age !== "" && parseInt(age) >= 1 && parseInt(age) <= 120 && gender !== null;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {canGoBack ? (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft color="#111827" size={28} strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Complete Profile
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Add your personal information
            </Text>
          </View>
          <TouchableOpacity style={styles.rightButton} onPress={handleLogout}>
            <LogOut color="#6B7280" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ProfileAvatarUploader 
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
          />

          <View style={styles.inputSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.inputWrapper}>
              <User color="#9CA3AF" size={20} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="John Doe"
                placeholderTextColor="#D1D5DB"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="25"
              placeholderTextColor="#D1D5DB"
              value={age}
              onChangeText={handleAgeChange}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={styles.inputSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <RadioGroup 
              options={GENDER_OPTIONS}
              selectedValue={gender}
              onSelect={setGender}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Animated.View style={{ opacity: isValid ? 1 : 0.5 }}>
              <PrimaryButton 
                title="Continue" 
                onPress={handleContinue} 
                disabled={!isValid}
                loading={loading}
              />
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 4,
  },
  rightButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  required: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 17,
    fontWeight: "500",
    color: "#111827",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 17,
    fontWeight: "500",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
});
