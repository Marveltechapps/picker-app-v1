/**
 * Utility to detect if the app is running in Expo Go
 * 
 * Expo Go does not support:
 * - react-native-vision-camera
 * - @infinitered/react-native-mlkit-face-detection
 * - react-native-vision-camera-face-detector
 * - Custom native modules
 * 
 * Use this utility to conditionally enable/disable features that require dev client.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Check if the app is running in Expo Go
 * @returns true if running in Expo Go, false otherwise
 */
export function isExpoGo(): boolean {
  // On web, never Expo Go
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    // Safe for standalone APK: Constants may be undefined or not yet ready in standalone
    if (typeof Constants === 'undefined') {
      return false;
    }

    // Check execution environment
    // 'storeClient' = Expo Go
    // 'standalone' = Development build or production build (APK)
    // 'bare' = Bare React Native
    if (Constants.executionEnvironment === 'storeClient') {
      return true;
    }

    // Legacy check for older Expo SDK versions
    if (Constants.appOwnership === 'expo') {
      if (Constants.manifest && !(Constants.manifest as any).developer) {
        return true;
      }
    }
  } catch {
    // In standalone APK, Constants may not be ready at first access; treat as non–Expo Go
    return false;
  }

  return false;
}

/**
 * Check if a native module is available
 * Use this to safely check if a module that requires dev client is available
 */
export function isNativeModuleAvailable(moduleName: string): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  if (isExpoGo()) {
    // In Expo Go, only Expo modules are available
    // Check if it's an Expo module (starts with 'expo-')
    return moduleName.startsWith('expo-');
  }

  // In dev client or standalone, all modules should be available
  return true;
}
