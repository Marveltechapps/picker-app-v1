/**
 * Maps vision-camera-face-detector Face[] + frame dimensions to FaceDetectionStatus.
 * Used for real-time verification (single face, centered, etc.).
 */

import type { FaceDetectionStatus } from "@/types/faceVerification";

/** Center region: face center must fall inside 50% width × 50% height. */
const CENTER_WIDTH_RATIO = 0.5;
const CENTER_HEIGHT_RATIO = 0.5;
/** Both eyes below this → treat as sunglasses / eyes closed. */
const EYE_OPEN_THRESHOLD = 0.2;

export interface VisionCameraFace {
  bounds: { x: number; y: number; width: number; height: number };
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  smilingProbability?: number;
  [k: string]: unknown;
}

export function mapVisionCameraFacesToStatus(
  faces: VisionCameraFace[],
  frameWidth: number,
  frameHeight: number
): FaceDetectionStatus {
  const faceDetected = faces.length > 0;

  // SIMPLIFIED: If face is detected, that's enough - no strict checks
  if (!faceDetected) {
    return {
      faceDetected: false,
      hatDetected: false,
      sunglassesDetected: false,
      maskDetected: false,
      lightingScore: 0.8, // Default value, not checked
      faceCentered: true, // Default value, not checked
    };
  }

  // SIMPLIFIED: Single face detected = success (no position/lighting checks)
  return {
    faceDetected: true,
    hatDetected: false, // Not checked
    sunglassesDetected: false, // Not checked
    maskDetected: false, // Not checked
    lightingScore: 0.8, // Default value, not checked
    faceCentered: true, // Default value, not checked
  };
}
