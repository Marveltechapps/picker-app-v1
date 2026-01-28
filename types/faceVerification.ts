/**
 * Shared types for face verification (detection status, etc.).
 */

export interface FaceDetectionStatus {
  faceDetected: boolean;
  hatDetected: boolean;
  sunglassesDetected: boolean;
  maskDetected: boolean;
  lightingScore: number;
  faceCentered: boolean;
}
