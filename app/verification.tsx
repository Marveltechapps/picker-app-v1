import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useAuth } from "@/state/authContext";
import { Colors, Typography, Spacing } from "@/constants/theme";
import Header from "@/components/Header";
import FaceDetectionCamera, { FaceDetectionStatus } from "@/components/FaceDetectionCamera";
import VerificationChecklist, { ChecklistItem } from "@/components/VerificationChecklist";
import PrimaryButton from "@/components/PrimaryButton";

export default function LiveVerificationScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const { completeVerification, resetAll } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [detectionStatus, setDetectionStatus] = useState<FaceDetectionStatus>({
    faceDetected: false,
    hatDetected: true,
    sunglassesDetected: true,
    maskDetected: true,
    lightingScore: 0.3,
    faceCentered: false,
  });

  const handleLogout = async () => {
    console.log("Logging out and resetting all data...");
    setLoading(true);
    await resetAll();
    setLoading(false);
    router.replace("/permissions");
  };

  const handleContinue = async () => {
    setLoading(true);
    console.log("Live verification completed");
    
    await completeVerification();
    setLoading(false);
    router.replace("/my-documents");
  };

  const checklistItems: ChecklistItem[] = [
    { label: "Remove hat", status: !detectionStatus.hatDetected },
    { label: "Remove sunglasses", status: !detectionStatus.sunglassesDetected },
    { label: "Remove mask", status: !detectionStatus.maskDetected },
    { label: "Good lighting", status: detectionStatus.lightingScore > 0.7 },
    { label: "Face centered", status: detectionStatus.faceCentered },
  ];

  const isVerificationReady = 
    detectionStatus.faceDetected && 
    !detectionStatus.hatDetected && 
    !detectionStatus.sunglassesDetected && 
    !detectionStatus.maskDetected && 
    detectionStatus.lightingScore > 0.7 && 
    detectionStatus.faceCentered;

  return (
    <View style={styles.container}>
      <Header 
        title="Live Verification"
        subtitle="Verify your identity"
        showBack={canGoBack}
        rightIcon={LogOut}
        onRightPress={handleLogout}
        rightIconColor={Colors.text.secondary}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.content}>
          <View style={styles.cameraSection}>
            <FaceDetectionCamera onStatusChange={setDetectionStatus} />
          </View>

          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Live Face Verification</Text>
            <Text style={styles.instructionsSubtitle}>Position your face in the oval</Text>
          </View>

          <View style={styles.checklistSection}>
            <VerificationChecklist items={checklistItems} />
          </View>

          <View style={styles.buttonContainer}>
            <Animated.View style={{ opacity: isVerificationReady ? 1 : 0.5 }}>
              <PrimaryButton 
                title="Continue" 
                onPress={handleContinue} 
                disabled={!isVerificationReady}
                loading={loading}
              />
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
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
  cameraSection: {
    marginBottom: Spacing['3xl'],
  },
  instructionsSection: {
    marginBottom: Spacing['3xl'],
  },
  instructionsTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    letterSpacing: Typography.letterSpacing.tight,
  },
  instructionsSubtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.lg,
  },
  checklistSection: {
    marginBottom: Spacing['2xl'],
  },
  buttonContainer: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
});
