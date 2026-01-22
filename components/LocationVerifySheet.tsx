import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import { MapPin, Check } from "lucide-react-native";

interface LocationVerifySheetProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export default function LocationVerifySheet({ visible, onSuccess, onClose }: LocationVerifySheetProps) {
  const [verifying, setVerifying] = useState(true);
  const bounceAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      setVerifying(true);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -20,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const timer = setTimeout(() => {
        setVerifying(false);
        bounceAnim.stopAnimation();
        setTimeout(() => {
          onSuccess();
        }, 800);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, bounceAnim, onSuccess]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Verifying Location" height="80%">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.stepIndicator}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "50%" }]} />
            </View>
            <View style={styles.stepLabels}>
              <Text style={styles.stepLabelActive}>Step 1 of 2</Text>
              <Text style={styles.stepLabelInactive}>Identity Verification</Text>
            </View>
          </View>

          <Animated.View style={[styles.iconContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <View style={styles.iconCircle}>
              <MapPin color="#6366F1" size={60} strokeWidth={2.5} />
            </View>
          </Animated.View>

          {verifying ? (
            <>
              <Text style={styles.title}>Verifying Location</Text>
              <Text style={styles.subtitle}>Please wait while we confirm you&apos;re at the hub</Text>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.checkContainer}>
                <Check color="#10B981" size={40} strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Location Verified!</Text>
              <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                  <MapPin color="#10B981" size={20} strokeWidth={2} />
                  <Text style={styles.locationText}>MG Road, Bangalore - 560001</Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>GPS Accuracy</Text>
                    <Text style={styles.infoValueGreen}>+3m</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={styles.infoValueBlue}>At Hub</Text>
                  </View>
                </View>
              </View>
            </>
          )}
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
  stepLabelInactive: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#9CA3AF",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
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
  loadingDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#C7D2FE",
  },
  dot1: {
    backgroundColor: "#6366F1",
  },
  dot2: {
    backgroundColor: "#A5B4FC",
  },
  dot3: {
    backgroundColor: "#C7D2FE",
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
    marginBottom: 24,
    textAlign: "center",
  },
  locationCard: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValueGreen: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#10B981",
  },
  infoValueBlue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
});
