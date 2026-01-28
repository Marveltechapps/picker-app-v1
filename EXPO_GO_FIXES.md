# Expo Go Compatibility Fixes

## Root Cause Analysis

### Why Web Works But Mobile (Expo Go) Fails

1. **Unsupported Native Modules in Expo Go**
   - `react-native-vision-camera` - NOT available in Expo Go (requires dev client)
   - `@infinitered/react-native-mlkit-face-detection` - NOT available in Expo Go
   - `react-native-vision-camera-face-detector` - NOT available in Expo Go
   - These modules require custom native code that Expo Go doesn't support

2. **Plugin Configuration Issue**
   - `app.json` had `react-native-vision-camera` plugin configured
   - This causes Expo Go to fail during app initialization

3. **Direct Imports at Top Level**
   - Some hooks had direct imports of unsupported modules
   - These imports execute immediately, causing crashes in Expo Go

## Fixes Applied

### 1. Removed Unsupported Plugin from app.json
**File:** `app.json`
- Removed `react-native-vision-camera` plugin configuration
- This plugin is only needed for dev client builds, not Expo Go

### 2. Created Expo Go Detection Utility
**File:** `utils/expoGoDetection.ts` (NEW)
- Utility function `isExpoGo()` to detect Expo Go environment
- Uses `Constants.executionEnvironment === 'storeClient'` for detection
- Includes legacy checks for older Expo SDK versions

### 3. Made Camera Hooks Expo Go Compatible
**Files:**
- `hooks/useFaceVerification.ts`
- `hooks/useLiveFaceVerification.ts`

**Changes:**
- Replaced direct imports with conditional `require()` statements
- Added `isExpoGo()` checks before importing modules
- Added fallback values when modules are unavailable
- All camera hooks now gracefully degrade in Expo Go

### 4. Existing Safeguards (Already in Place)
**Files:**
- `components/FaceDetectionCamera.tsx` - Already had conditional imports
- `hooks/useLiveFaceCamera.ts` - Already had conditional imports
- `services/faceRecognition.service.ts` - Already had conditional imports
- `state/locationContext.tsx` - Already uses `Platform.OS` checks

## Modules Status

### ✅ Expo Go Compatible (Work in Expo Go)
- `expo-camera` - ✅ Works
- `expo-local-authentication` - ✅ Works
- `expo-location` - ✅ Works
- `expo-face-detector` - ⚠️ Deprecated but works (with conditional imports)
- All other `expo-*` modules - ✅ Work

### ❌ NOT Compatible with Expo Go (Require Dev Client)
- `react-native-vision-camera` - ❌ Requires dev client
- `@infinitered/react-native-mlkit-face-detection` - ❌ Requires dev client
- `react-native-vision-camera-face-detector` - ❌ Requires dev client

## How It Works Now

### In Expo Go:
1. App detects Expo Go environment using `isExpoGo()`
2. Camera hooks return fallback values (no camera device, no permission)
3. `FaceDetectionCamera` shows fallback UI with simulation
4. `useLiveFaceCamera` simulates face verification
5. App continues to work without crashing

### In Dev Client / Standalone:
1. App detects it's NOT Expo Go
2. Camera modules are loaded conditionally
3. Full camera functionality is available
4. All features work as expected

## Testing Checklist

- [x] App starts in Expo Go without red screen
- [x] No crashes from unsupported module imports
- [x] Face verification shows fallback UI in Expo Go
- [x] Location services work (uses expo-location on mobile)
- [x] Biometric auth works (uses expo-local-authentication)
- [x] Camera features gracefully degrade in Expo Go

## Next Steps for Full Camera Features

To use `react-native-vision-camera` features, you need to:

1. **Create a Development Build:**
   ```bash
   npx expo prebuild
   npx expo run:android
   # or
   npx expo run:ios
   ```

2. **Or use EAS Build:**
   ```bash
   eas build --profile development --platform android
   ```

3. **Re-add the plugin** in `app.json` (only for dev client):
   ```json
   [
     "react-native-vision-camera",
     {
       "cameraPermissionText": "$(PRODUCT_NAME) needs access to your Camera for live face verification.",
       "enableMicrophonePermission": false
     }
   ]
   ```

## Notes

- The app now works in Expo Go with graceful degradation
- Camera-based face detection is simulated in Expo Go
- Biometric auth (fingerprint/face unlock) works via `expo-local-authentication`
- All other features work normally in Expo Go
- For production, consider using dev client builds for full camera features
