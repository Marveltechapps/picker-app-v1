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

  // Check execution environment
  // 'storeClient' = Expo Go
  // 'standalone' = Development build or production build
  // 'bare' = Bare React Native
  if (Constants.executionEnvironment === 'storeClient') {
    return true;
  }

  // Legacy check for older Expo SDK versions
  // appOwnership === 'expo' means Expo Go
  if (Constants.appOwnership === 'expo') {
    // Additional check: if manifest exists but no developer field, it's Expo Go
    if (Constants.manifest && !(Constants.manifest as any).developer) {
      return true;
    }
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
