# Real Device Biometric & Face Recognition Setup

This document explains how to set up and use real device biometric authentication and face recognition in the app.

## 📦 Required Packages

The following packages are required and have been added to `package.json`:

```json
{
  "expo-local-authentication": "~15.0.3",
  "expo-face-detector": "~14.0.3",
  "expo-camera": "~17.0.10" // Already installed
}
```

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 2. Rebuild Native Code

**IMPORTANT**: These features require native code and will NOT work in Expo Go. You must use a development build.

#### Option A: Expo Dev Client (Recommended)

```bash
# Install Expo Dev Client
npx expo install expo-dev-client

# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android
```

#### Option B: EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for development
eas build --profile development --platform ios
eas build --profile development --platform android
```

## 📱 Permissions Configuration

Permissions have been configured in `app.json`:

### iOS (`infoPlist`)
- `NSFaceIDUsageDescription`: Face ID permission
- `NSCameraUsageDescription`: Camera permission (already present)

### Android (`permissions`)
- Camera permission (already present)
- Biometric permission is handled automatically by `expo-local-authentication`

### Plugins
- `expo-local-authentication`: Configures Face ID permission
- `expo-face-detector`: Configures camera permission for face detection
- `expo-camera`: Camera access

## 🔧 Implementation Details

### Biometric Authentication

**Service**: `services/biometric.service.ts`
- Checks hardware availability
- Verifies enrollment status
- Performs authentication
- Handles errors gracefully

**Hook**: `hooks/useBiometricAuth.ts`
- React hook for biometric authentication
- Manages state (loading, success, error)
- Handles app lifecycle (foreground/background)
- Auto-checks availability on mount

**Component**: `components/FingerprintVerifySheet.tsx`
- Uses `useBiometricAuth` hook
- Supports both fingerprint and Face ID
- Shows appropriate UI based on biometric type
- Handles errors and user cancellation

### Face Recognition

**Service**: `services/faceRecognition.service.ts`
- Processes face detection results
- Validates face quality (lighting, centering, obstructions)
- Calculates quality scores
- Provides face detector settings

**Hook**: `hooks/useFaceRecognition.ts`
- React hook for real-time face recognition
- Uses `expo-camera` with `expo-face-detector`
- Auto-opens front camera
- Real-time face detection
- Auto-verification when quality threshold met
- Handles permissions and app lifecycle

**Component**: `components/FaceVerifySheet.tsx`
- Uses `useFaceRecognition` hook
- Shows live camera preview
- Displays face detection status
- Real-time quality feedback
- Auto-verification or manual trigger

## 🎯 Usage

### Biometric Authentication

```tsx
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

function MyComponent() {
  const {
    isAvailable,
    biometricType,
    isAuthenticating,
    authenticate,
  } = useBiometricAuth({
    onSuccess: () => {
      console.log('Authentication successful!');
    },
    onError: (error) => {
      console.error('Authentication failed:', error);
    },
  });

  return (
    <Button
      title="Authenticate"
      onPress={authenticate}
      disabled={!isAvailable || isAuthenticating}
    />
  );
}
```

### Face Recognition

```tsx
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { CameraView, CameraType } from 'expo-camera';

function MyComponent() {
  const {
    permission,
    requestPermission,
    cameraRef,
    status,
    handleFacesDetected,
    verify,
  } = useFaceRecognition({
    onVerified: () => {
      console.log('Face verified!');
    },
    autoVerify: true,
  });

  if (!permission?.granted) {
    return <Button title="Request Permission" onPress={requestPermission} />;
  }

  return (
    <CameraView
      ref={cameraRef}
      facing={CameraType.front}
      onFacesDetected={handleFacesDetected}
      faceDetectorSettings={getFaceDetectorSettings()}
    />
  );
}
```

## ⚠️ Important Notes

### Expo Go Limitations

**These features DO NOT work in Expo Go** because they require native code:
- `expo-local-authentication` requires native biometric APIs
- `expo-face-detector` requires native MLKit/face detection libraries
- `expo-camera` with face detection requires native camera APIs

**Solution**: Use Expo Dev Client or EAS Build (see Installation section above).

### Device Requirements

#### Biometric Authentication
- **iOS**: Device with Touch ID or Face ID
- **Android**: Device with fingerprint sensor or face unlock
- Biometrics must be enrolled in device settings

#### Face Recognition
- **iOS**: Device with front-facing camera
- **Android**: Device with front-facing camera
- Camera permission must be granted

### Common Issues & Fixes

#### 1. "Biometric authentication not available"
- **Cause**: No biometrics enrolled or hardware not supported
- **Fix**: Set up fingerprint/Face ID in device settings

#### 2. "Camera permission denied"
- **Cause**: User denied camera permission
- **Fix**: Go to device settings → App → Permissions → Enable Camera

#### 3. "No camera device found"
- **Cause**: Camera hardware issue or permission not granted
- **Fix**: Check device camera, restart app, reinstall if needed

#### 4. Face detection not working
- **Cause**: Poor lighting, face not centered, or obstructions
- **Fix**: Improve lighting, center face, remove hat/sunglasses/mask

#### 5. Auto-verification not triggering
- **Cause**: Face quality below threshold or not stable long enough
- **Fix**: Adjust `minQualityScore` or `stableDuration` in hook options

#### 6. App crashes on biometric auth
- **Cause**: Missing native modules or incorrect build
- **Fix**: Rebuild app with `npx expo run:ios` or `npx expo run:android`

## 🧪 Testing

### Test on Real Device

1. **Build development client**:
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

2. **Test Biometric**:
   - Open app → Navigate to fingerprint screen
   - Tap "Scan Fingerprint" or "Authenticate with Face ID"
   - Use real biometric (fingerprint/Face ID)
   - Verify success callback fires

3. **Test Face Recognition**:
   - Open app → Navigate to face recognition screen
   - Grant camera permission if prompted
   - Position face in camera frame
   - Wait for auto-verification or tap "Verify Now"
   - Verify success callback fires

### Test Scenarios

#### Biometric
- ✅ Valid authentication
- ✅ User cancellation
- ✅ No biometrics enrolled
- ✅ Hardware not available
- ✅ App backgrounded during auth

#### Face Recognition
- ✅ Single face detected
- ✅ Multiple faces (should block)
- ✅ Poor lighting
- ✅ Face not centered
- ✅ Hat/sunglasses/mask detected
- ✅ Auto-verification
- ✅ Manual verification
- ✅ Camera permission denied

## 📚 API Reference

### BiometricService

```typescript
// Check hardware support
const result = await biometricService.checkHardwareSupport();
// Returns: { available: boolean, type: 'fingerprint' | 'facial' | 'iris' | 'none', error?: string }

// Authenticate
const result = await biometricService.authenticate({
  promptMessage: 'Authenticate to continue',
  cancelLabel: 'Cancel',
  disableDeviceFallback: false,
});
// Returns: { success: boolean, error?: string }
```

### FaceRecognitionService

```typescript
// Process face detection
const status = faceRecognitionService.processFaceDetection(faces, width, height);
// Returns: FaceDetectionStatus

// Validate quality
const quality = faceRecognitionService.validateFaceQuality(status);
// Returns: { isValid: boolean, issues: string[], score: number }

// Get detector settings
const settings = faceRecognitionService.getFaceDetectorSettings();
// Returns: FaceDetectorOptions
```

## 🔒 Security Considerations

1. **Biometric Data**: Never stored locally or transmitted. Only used for authentication.
2. **Face Images**: Not stored or transmitted. Only used for real-time verification.
3. **Permissions**: Requested only when needed, with clear explanations.
4. **Fallback**: Device passcode fallback available (can be disabled).

## 🚨 Production Checklist

- [ ] Tested on real iOS device
- [ ] Tested on real Android device
- [ ] Verified biometric enrollment check
- [ ] Verified camera permission flow
- [ ] Tested error handling
- [ ] Tested app lifecycle (background/foreground)
- [ ] Verified auto-verification timing
- [ ] Tested with poor lighting conditions
- [ ] Tested with obstructions (hat, sunglasses, mask)
- [ ] Verified multiple face detection blocking
- [ ] Tested user cancellation flows
- [ ] Verified success callbacks fire correctly

## 📝 Notes

- Face recognition uses `expo-face-detector` which is based on MLKit
- Biometric authentication uses native iOS/Android APIs
- Both features require native builds (not Expo Go)
- UI remains unchanged - only logic was replaced
- All existing success/error callbacks are preserved
