import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Platform, Alert, ActivityIndicator } from "react-native";
import { CameraView } from "expo-camera";
import BottomSheetModal from "./BottomSheetModal";
import { Camera, Check } from "lucide-react-native";
import PrimaryButton from "./PrimaryButton";
import { useFaceRecognition, getFaceDetectorSettings } from "@/hooks/useFaceRecognition";
import * as Haptics from "expo-haptics";

// Safe import for CameraType - may not be available in Expo Go
let CameraType: any = null;
try {
  const cameraModule = require("expo-camera");
  CameraType = cameraModule.CameraType;
} catch (error) {
  // CameraType not available, use fallback
  if (__DEV__) {
    console.warn("[FaceVerifySheet] CameraType not available, using fallback");
  }
}

// Fallback camera type constant
const FRONT_CAMERA = CameraType?.front ?? 'front';

interface FaceVerifySheetProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
  onBack: () => void;
}

export default function FaceVerifySheet({ visible, onSuccess, onClose, onBack }: FaceVerifySheetProps) {
  const [verified, setVerified] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Face Recognition ALWAYS uses camera (never device biometric)
  const {
    permission,
    requestPermission,
    cameraRef,
    status,
    isVerifying,
    isVerified,
    error,
    handleFacesDetected,
    verify,
    reset,
  } = useFaceRecognition({
    onStatusChange: () => {},
    onVerified: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setVerified(true);
      pulseAnim.stopAnimation();
      setTimeout(() => onSuccess(), 800);
    },
    onVerifyFailed: (err) => {
      // Removed failure alerts - verification happens automatically on face detection
      // No spam of failure messages
    },
  });

  // Sync verified state
  useEffect(() => {
    if (isVerified && !verified) {
      setVerified(true);
    }
  }, [isVerified, verified]);

  // Request permission when sheet opens and ensure camera is active
  useEffect(() => {
    if (visible) {
      // Always request camera permission when sheet opens
      if (!permission?.granted && permission?.canAskAgain !== false) {
        requestPermission().catch((err) => {
          // Error is managed by the hook internally
          if (__DEV__) {
            console.error('[FaceVerifySheet] Error requesting camera permission:', err);
          }
        });
      }
      // Reset verification state when sheet opens to ensure fresh start
      try {
        reset();
        setVerified(false);
      } catch (err) {
        if (__DEV__) {
          console.error('[FaceVerifySheet] Error resetting state:', err);
        }
      }
    }
  }, [visible, permission?.granted, permission?.canAskAgain, requestPermission, reset]);

  // Reset when sheet closes
  useEffect(() => {
    if (!visible) {
      reset();
      setVerified(false);
    }
  }, [visible, reset]);

  // Animate pulse when verifying
  useEffect(() => {
    if (isVerifying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isVerifying, pulseAnim]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Face Recognition" height="85%" onBack={onBack}>
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

          {Platform.OS === 'web' ? (
            <>
              <View style={styles.cameraContainer}>
                <View style={styles.cameraPlaceholder}>
                  <Camera color="#6366F1" size={48} strokeWidth={2} />
                </View>
              </View>
              <Text style={styles.title}>Face Verification Not Available</Text>
              <Text style={styles.subtitle}>
                Face verification requires a native device. Please use the mobile app.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.cameraContainer}>
                {!permission?.granted ? (
                  <View style={styles.cameraPlaceholder}>
                    {permission?.canAskAgain !== false ? (
                      <>
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text style={styles.permissionText}>Requesting camera permission...</Text>
                      </>
                    ) : (
                      <>
                        <Camera color="#6366F1" size={48} strokeWidth={2} />
                        <Text style={styles.permissionText}>Camera access required</Text>
                        <Text style={styles.permissionSubtext}>
                          Please enable camera permission in your device settings to use face recognition.
                        </Text>
                        <PrimaryButton
                          title="Request Permission"
                          onPress={requestPermission}
                          style={styles.permissionButton}
                        />
                      </>
                    )}
                  </View>
                ) : (
                  <Animated.View
                    style={[
                      styles.cameraFrame,
                      isVerifying && {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <CameraView
                      ref={cameraRef}
                      style={styles.camera}
                      facing={FRONT_CAMERA}
                      onFacesDetected={handleFacesDetected}
                      faceDetectorSettings={getFaceDetectorSettings()}
                      enableTorch={false}
                    />
                    <View style={styles.overlay} />
                    {status.faceDetected && !isVerifying && !verified && (
                      <View style={styles.faceDetectedIndicator}>
                        <Text style={styles.faceDetectedText}>✓ Face Detected</Text>
                      </View>
                    )}
                  </Animated.View>
                )}
              </View>

              {verified ? (
                <>
                  <View style={styles.checkContainer}>
                    <Check color="#10B981" size={40} strokeWidth={3} />
                  </View>
                  <Text style={styles.successTitle}>Face Verified!</Text>
                  <Text style={styles.successSubtitle}>Identity confirmed successfully</Text>
                </>
              ) : isVerifying ? (
                <>
                  <Text style={styles.title}>Verifying...</Text>
                  <Text style={styles.subtitle}>Please hold still</Text>
                  <View style={styles.conditionsCard}>
                    <View style={styles.conditionRow}>
                      <Check 
                        color={status.faceDetected ? "#10B981" : "#9CA3AF"} 
                        size={20} 
                        strokeWidth={2.5} 
                      />
                      <Text style={[
                        styles.conditionText,
                        !status.faceDetected && styles.conditionTextInactive
                      ]}>
                        Face detected
                      </Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Check 
                        color={status.lightingScore > 0.7 ? "#10B981" : "#9CA3AF"} 
                        size={20} 
                        strokeWidth={2.5} 
                      />
                      <Text style={[
                        styles.conditionText,
                        status.lightingScore <= 0.7 && styles.conditionTextInactive
                      ]}>
                        Good lighting
                      </Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Check 
                        color={status.faceCentered ? "#10B981" : "#9CA3AF"} 
                        size={20} 
                        strokeWidth={2.5} 
                      />
                      <Text style={[
                        styles.conditionText,
                        !status.faceCentered && styles.conditionTextInactive
                      ]}>
                        Face centered
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {error && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                  {!status.faceDetected && permission?.granted && (
                    <>
                      <Text style={styles.title}>Position Your Face</Text>
                      <Text style={styles.subtitle}>
                        Look directly at the camera and ensure your face is clearly visible
                      </Text>
                      <View style={styles.conditionsCard}>
                        <View style={styles.conditionRow}>
                          <Text style={styles.conditionText}>
                            {status.faceDetected ? "✓" : "○"} Face detected
                          </Text>
                        </View>
                        <View style={styles.conditionRow}>
                          <Text style={styles.conditionText}>
                            {status.lightingScore > 0.7 ? "✓" : "○"} Good lighting
                          </Text>
                        </View>
                        <View style={styles.conditionRow}>
                          <Text style={styles.conditionText}>
                            {status.faceCentered ? "✓" : "○"} Face centered
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {Platform.OS === 'web' ? (
          <View style={styles.footer}>
            <PrimaryButton 
              title="Skip Verification (Demo)" 
              onPress={() => {
                setVerified(true);
                setTimeout(() => onSuccess(), 500);
              }}
            />
          </View>
        ) : !isVerifying && !verified && permission?.granted && (
          <View style={styles.footer}>
            <PrimaryButton 
              title={status.faceDetected ? "Verify Now" : "Position face in frame"} 
              onPress={verify}
              disabled={!status.faceDetected}
            />
            {!status.faceDetected && (
              <Text style={styles.helpText}>
                Make sure your face is clearly visible and well-lit
              </Text>
            )}
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
  cameraContainer: {
    width: "100%",
    aspectRatio: 0.75,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  cameraFrame: {
    width: 280,
    height: 360,
    borderRadius: 180,
    borderWidth: 4,
    borderColor: "#6366F1",
    backgroundColor: "#000000",
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 180,
    borderWidth: 4,
    borderColor: "transparent",
    pointerEvents: "none",
  },
  faceDetectedIndicator: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  faceDetectedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  cameraPlaceholder: {
    width: 280,
    height: 360,
    borderRadius: 180,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#6366F1",
  },
  permissionText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    textAlign: "center",
  },
  permissionSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "400" as const,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 20,
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
  conditionsCard: {
    marginTop: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  conditionTextInactive: {
    color: "#9CA3AF",
  },
  errorContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#DC2626",
    textAlign: "center",
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
  helpText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "400" as const,
    color: "#6B7280",
    textAlign: "center",
  },
});
