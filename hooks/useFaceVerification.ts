/**
 * useFaceVerification
 *
 * Handles permission, front camera device, frame-processor-based face detection,
 * throttled verification (capture → verifyFace API), and success/failure callbacks.
 * Uses react-native-vision-camera + react-native-vision-camera-face-detector.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import { Worklets } from "react-native-worklets-core";
import { mapVisionCameraFacesToStatus } from "@/utils/visionCameraFaceMapper";
import { verifyFace } from "@/services/faceVerification.service";
import type { FaceDetectionStatus } from "@/types/faceVerification";
import { isExpoGo } from "@/utils/expoGoDetection";

// Conditionally import react-native-vision-camera (not available in Expo Go)
let useCameraDevice: any = null;
let useCameraPermission: any = null;
let useFrameProcessor: any = null;
let runAsync: any = null;
let Camera: any = null;
let useFaceDetector: any = null;
type Face = any;

try {
  if (Platform.OS !== 'web' && !isExpoGo()) {
    const visionCamera = require("react-native-vision-camera");
    useCameraDevice = visionCamera.useCameraDevice;
    useCameraPermission = visionCamera.useCameraPermission;
    useFrameProcessor = visionCamera.useFrameProcessor;
    runAsync = visionCamera.runAsync;
    Camera = visionCamera.Camera;
    
    const faceDetector = require("react-native-vision-camera-face-detector");
    useFaceDetector = faceDetector.useFaceDetector;
  }
} catch (error) {
  // Module not available (Expo Go or not installed)
  if (__DEV__) {
    console.warn("[useFaceVerification] react-native-vision-camera not available:", error);
  }
}

const VERIFY_THROTTLE_MS = 1500;
const CHECK_INTERVAL_MS = 400;
const DEFAULT_STATUS: FaceDetectionStatus = {
  faceDetected: false,
  hatDetected: false,
  sunglassesDetected: false,
  maskDetected: false,
  lightingScore: 0.3,
  faceCentered: false,
};

function isStatusReady(s: FaceDetectionStatus): boolean {
  return (
    s.faceDetected &&
    !s.hatDetected &&
    !s.sunglassesDetected &&
    !s.maskDetected &&
    s.lightingScore > 0.7 &&
    s.faceCentered
  );
}

export interface UseFaceVerificationOptions {
  onStatusChange: (status: FaceDetectionStatus) => void;
  /** When both provided, throttled verifyFace API runs and success/failure trigger these. */
  onVerified?: () => void;
  onVerifyFailed?: (error: string) => void;
  /** Optional auth token for verify API */
  token?: string;
}

export function useFaceVerification({
  onStatusChange,
  onVerified,
  onVerifyFailed,
  token,
}: UseFaceVerificationOptions) {
  // Check if camera module is available
  const isCameraAvailable = !!useCameraDevice && !!useCameraPermission && !!useFrameProcessor && Platform.OS !== 'web' && !isExpoGo();
  
  // Only use camera hooks if available
  const device = isCameraAvailable && useCameraDevice ? useCameraDevice("front") : null;
  const cameraPermission = isCameraAvailable && useCameraPermission ? useCameraPermission() : { hasPermission: false, requestPermission: () => Promise.resolve(false) };
  const { hasPermission, requestPermission } = cameraPermission;
  const [status, setStatus] = useState<FaceDetectionStatus>(DEFAULT_STATUS);
  const [isActive, setIsActive] = useState(true);
  const cameraRef = useRef<any>(null);
  const lastVerifyTs = useRef(0);
  const verifying = useRef(false);
  const mounted = useRef(true);

  const onStatusChangeRef = useRef(onStatusChange);
  const onVerifiedRef = useRef(onVerified);
  const onVerifyFailedRef = useRef(onVerifyFailed);
  const tokenRef = useRef(token);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    onVerifiedRef.current = onVerified;
    onVerifyFailedRef.current = onVerifyFailed;
    tokenRef.current = token;
  }, [onStatusChange, onVerified, onVerifyFailed, token]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      setIsActive(next === "active");
    });
    return () => sub.remove();
  }, []);

  const faceOptions = useRef({
    performanceMode: "fast" as const,
    classificationMode: true,
    landmarkMode: false,
    contourMode: false,
    minFaceSize: 0.15,
    trackingEnabled: false,
    cameraFacing: "front" as const,
  }).current;

  // Only use face detector if available
  const faceDetectorResult = isCameraAvailable && useFaceDetector ? useFaceDetector(faceOptions) : { detectFaces: () => [], stopListeners: () => {} };
  const { detectFaces, stopListeners } = faceDetectorResult;

  useEffect(() => {
    return () => {
      stopListeners();
    };
  }, [stopListeners]);

  useEffect(() => {
    if (!device) {
      stopListeners();
    }
  }, [device, stopListeners]);

  const handleFaces = useCallback(
    (faces: Face[], width: number, height: number) => {
      const next = mapVisionCameraFacesToStatus(
        faces as unknown as import("@/utils/visionCameraFaceMapper").VisionCameraFace[],
        width,
        height
      );
      setStatus(next);
      onStatusChangeRef.current(next);
    },
    []
  );

  const handleFacesJS = Worklets.createRunOnJS(handleFaces);

  // Only create frame processor if camera is available
  const frameProcessor = isCameraAvailable && useFrameProcessor && runAsync ? useFrameProcessor(
    (frame: any) => {
      "worklet";
      runAsync(frame, () => {
        "worklet";
        const faces = detectFaces(frame);
        const w = frame.width;
        const h = frame.height;
        handleFacesJS(faces, w, h);
      });
    },
    [detectFaces, handleFacesJS]
  ) : undefined;

  const captureAndVerify = useCallback(async () => {
    const cam = cameraRef.current;
    const onVerified = onVerifiedRef.current;
    const onFail = onVerifyFailedRef.current;
    if (!cam || verifying.current || !mounted.current || !onVerified || !onFail) return;

    verifying.current = true;
    try {
      const photo = await cam.takePhoto({
        enableShutterSound: false,
      });
      const uri = `file://${photo.path}`;
      const result = await verifyFace({ uri }, { token: tokenRef.current ?? undefined });

      if (!mounted.current) return;

      if (result.success && result.verified) {
        onVerified();
      } else {
        onFail(result.error ?? "Verification failed");
      }
    } catch (e) {
      if (mounted.current && onVerifyFailedRef.current) {
        onVerifyFailedRef.current(e instanceof Error ? e.message : "Capture failed");
      }
    } finally {
      verifying.current = false;
    }
  }, []);

  const runVerification = Boolean(onVerified && onVerifyFailed);

  useEffect(() => {
    if (!runVerification || !device || !hasPermission || !isActive) return;

    const interval = setInterval(() => {
      if (!mounted.current || !isActive) return;
      if (!isStatusReady(status)) return;
      if (verifying.current) return;
      const now = Date.now();
      if (now - lastVerifyTs.current < VERIFY_THROTTLE_MS) return;

      lastVerifyTs.current = now;
      captureAndVerify();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [runVerification, device, hasPermission, isActive, status, captureAndVerify]);

  return {
    cameraRef,
    device,
    hasPermission,
    requestPermission,
    frameProcessor,
    isActive: isActive && !!device && !!hasPermission,
    status,
  };
}
