import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import { Fingerprint, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import PrimaryButton from "./PrimaryButton";

interface FingerprintVerifySheetProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
  onBack: () => void;
}

export default function FingerprintVerifySheet({ visible, onSuccess, onClose, onBack }: FingerprintVerifySheetProps) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (verifying) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 3.33;
        });
      }, 100);

      const timer = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        clearInterval(progressInterval);
        setVerifying(false);
        setVerified(true);
        setTimeout(() => {
          onSuccess();
        }, 800);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [verifying, scaleAnim, onSuccess]);

  const handleScan = () => {
    setVerifying(true);
    setProgress(0);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Fingerprint Scan" height="85%" onBack={onBack}>
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

          <Animated.View
            style={[
              styles.fingerprintContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={[styles.fingerprintCircle, verified && styles.fingerprintCircleSuccess]}>
              <Fingerprint color={verified ? "#10B981" : "#6366F1"} size={100} strokeWidth={2} />
            </View>
            {verifying && (
              <View style={styles.progressRing}>
                <View style={[styles.progressRingFill, { height: `${progress}%` }]} />
              </View>
            )}
          </Animated.View>

          {verified ? (
            <>
              <View style={styles.checkContainer}>
                <Check color="#10B981" size={40} strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Fingerprint Verified!</Text>
              <Text style={styles.successSubtitle}>Identity confirmed successfully</Text>
            </>
          ) : verifying ? (
            <>
              <Text style={styles.title}>Verifying...</Text>
              <Text style={styles.subtitle}>Keep your finger on the sensor</Text>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Place finger on sensor</Text>
              <Text style={styles.subtitle}>Tap the button to simulate fingerprint scan</Text>
            </>
          )}
        </View>

        {!verifying && !verified && (
          <View style={styles.footer}>
            <PrimaryButton title="Scan Fingerprint" onPress={handleScan} />
          </View>
        )}
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
    paddingTop: 24,
    alignItems: "center",
  },
  stepIndicator: {
    width: "100%",
    marginBottom: 40,
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
  fingerprintContainer: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    position: "relative",
  },
  fingerprintCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  fingerprintCircleSuccess: {
    backgroundColor: "#D1FAE5",
  },
  progressRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressRingFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#6366F1",
    opacity: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  progressTextContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  checkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#10B981",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
});
