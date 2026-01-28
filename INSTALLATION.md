# Installation Guide - Real Device Biometric & Face Recognition

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `expo-local-authentication@~15.0.3` - For biometric authentication
- `expo-face-detector@~14.0.3` - For face detection
- `expo-camera@~17.0.10` - Already installed, used for camera

### 2. Build for Real Device

**⚠️ IMPORTANT**: These features require native code and will NOT work in Expo Go.

#### Option A: Expo Dev Client (Recommended for Development)

```bash
# Install Expo Dev Client
npx expo install expo-dev-client

# Build and run on iOS
npx expo run:ios

# Build and run on Android
npx expo run:android
```

#### Option B: EAS Build (For Production/Testing)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build development client for iOS
eas build --profile development --platform ios

# Build development client for Android
eas build --profile development --platform android
```

### 3. Test on Real Device

1. **Biometric Authentication**:
   - Open app → Navigate to fingerprint/face ID screen
   - Tap "Scan Fingerprint" or "Authenticate with Face ID"
   - Use your real biometric (fingerprint/Face ID)
   - Should authenticate successfully

2. **Face Recognition**:
   - Open app → Navigate to face recognition screen
   - Grant camera permission when prompted
   - Position your face in the camera frame
   - Wait for auto-verification (2 seconds of stable face) or tap "Verify Now"
   - Should verify successfully

## Device Requirements

### Biometric Authentication
- **iOS**: iPhone with Touch ID or Face ID
- **Android**: Device with fingerprint sensor or face unlock
- Biometrics must be enrolled in device settings

### Face Recognition
- **iOS**: iPhone with front-facing camera
- **Android**: Device with front-facing camera
- Camera permission must be granted

## Troubleshooting

### "Biometric authentication not available"
- Ensure biometrics are set up in device settings
- Check if device supports biometric authentication

### "Camera permission denied"
- Go to device Settings → App → Permissions → Enable Camera
- Restart app after granting permission

### "No camera device found"
- Check if device has a front-facing camera
- Restart app
- Rebuild app if issue persists

### App crashes on launch
- Ensure you're using a development build (not Expo Go)
- Rebuild with `npx expo run:ios` or `npx expo run:android`
- Clear cache: `npx expo start --clear`

## Package Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for iOS
npm run ios
# or
npx expo run:ios

# Build for Android
npm run android
# or
npx expo run:android

# Clear cache and restart
npx expo start --clear
```

## Next Steps

See `docs/REAL_DEVICE_BIOMETRIC_SETUP.md` for detailed documentation on:
- Implementation details
- API reference
- Security considerations
- Production checklist
