import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export interface FaceDetectionStatus {
  faceDetected: boolean;
  hatDetected: boolean;
  sunglassesDetected: boolean;
  maskDetected: boolean;
  lightingScore: number;
  faceCentered: boolean;
}

interface FaceDetectionCameraProps {
  onStatusChange: (status: FaceDetectionStatus) => void;
}

export default function FaceDetectionCamera({ onStatusChange }: FaceDetectionCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const mockDetectionTimer = setTimeout(() => {
      onStatusChange({
        faceDetected: true,
        hatDetected: false,
        sunglassesDetected: false,
        maskDetected: false,
        lightingScore: 0.8,
        faceCentered: true,
      });
    }, 3000);

    return () => clearTimeout(mockDetectionTimer);
  }, [onStatusChange]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  if (!permission?.granted) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <CameraView 
          style={styles.camera}
          facing="front"
        />
      ) : (
        <View style={styles.mockCamera} />
      )}
      
      <Animated.View 
        style={[
          styles.ovalOverlay,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={styles.ovalBorder} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#000000",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  mockCamera: {
    flex: 1,
    backgroundColor: "#1F2937",
  },
  ovalOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "75%",
    aspectRatio: 3 / 4,
    marginLeft: "-37.5%",
    marginTop: "-37.5%",
    alignItems: "center",
    justifyContent: "center",
  },
  ovalBorder: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderStyle: "solid",
  },
});
