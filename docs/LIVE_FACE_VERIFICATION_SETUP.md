# Live Real-Time Face Verification Setup

## Overview

This implementation provides **LIVE real-time face verification** using continuous frame processing (not photo capture). The camera opens automatically on screen mount, processes frames in real-time, and auto-verifies when face conditions are met.

**Key Features:**
- ✅ Auto-opens front camera on mount
- ✅ Real-time continuous frame processing
- ✅ Live face detection (no manual capture)
- ✅ Auto-verification when face is ready (throttled 1-2 sec)
- ✅ No UI changes - integrates seamlessly

## 1. Package Installation

All required packages are already installed. Verify:

```bash
# Core packages (already installed)
npm list react-native-vision-camera
npm list react-native-vision-camera-face-detector
npm list react-native-worklets-core

# Optional: expo-file-system (for file reading fallback)
npx expo install expo-file-system
```

**Note:** `expo-file-system` is optional but recommended for better file handling. The implementation includes a fallback if it's not available.

## 2. Babel Configuration

✅ Already configured in `babel.config.js`:

```js
plugins: [
  "react-native-worklets-core/plugin",  // ✅ Present
  "react-native-reanimated/plugin",     // ✅ Present
],
```

## 3. Expo Config Plugin

✅ Already configured in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "$(PRODUCT_NAME) needs access to your Camera for live face verification.",
          "enableMicrophonePermission": false
        }
      ]
    ]
  }
}
```

## 4. Native Setup

### Prebuild (Required)

```bash
npx expo prebuild --clean
```

### iOS

```bash
cd ios && pod install
# or
npx pod-install
```

### Android

- Minimum SDK: 21+ (configured automatically)
- Camera permission: Added automatically via plugin

## 5. Architecture

### New Implementation

| Component | Purpose |
|-----------|---------|
| `hooks/useLiveFaceVerification.ts` | **NEW** - Live real-time frame processing, auto-verification |
| `services/faceVerification.service.ts` | API client (supports base64 frames) |
| `components/FaceDetectionCamera.tsx` | Camera component (uses new hook) |
| `app/verification.tsx` | Screen (no changes needed) |

### How It Works

1. **Screen Mount** → Camera opens automatically (front camera)
2. **Frame Processor** → Processes every frame in real-time
3. **Face Detection** → Detects faces, checks conditions (single face, centered, no glasses, etc.)
4. **Auto-Verification** → When conditions met, converts frame to base64 and sends to API (throttled 1-2 sec)
5. **Success/Failure** → Triggers existing callbacks

## 6. Frame Processing

The implementation uses **two methods** for frame-to-base64 conversion:

### Method 1: Direct Base64 (Preferred)
- Uses `frame.toBase64("jpeg", 85)` if available (newer Vision Camera versions)
- Fastest, no file I/O

### Method 2: File-Based (Fallback)
- Uses `frame.toFile("jpeg", 85)` to save temporary file
- Reads file and converts to base64
- Works on all versions

Both methods are handled automatically - no configuration needed.

## 7. Verification API

The service already supports base64 frames:

```typescript
// In useLiveFaceVerification hook
await verifyFace(
  { base64: `data:image/jpeg;base64,${base64}` },
  { token: tokenRef.current }
);
```

### Backend Example (Node/Express)

```js
// POST /verify/face
app.post("/verify/face", async (req, res) => {
  let imageBuffer;
  
  if (req.body?.image) {
    // Remove data:image/jpeg;base64, prefix if present
    const base64 = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
    imageBuffer = Buffer.from(base64, "base64");
  } else {
    return res.status(400).json({ error: "Missing image" });
  }

  // Your verification logic
  const verified = await yourVerificationLogic(imageBuffer);
  
  res.json({ 
    success: true, 
    verified,
    message: verified ? "Face verified successfully" : "Face verification failed"
  });
});
```

## 8. Configuration

### Environment Variables

Set in `.env` or `app.json`:

```bash
EXPO_PUBLIC_API_URL=https://your-api.com
```

### Auth Token (Optional)

Pass token to hook via props (if needed):

```typescript
// In FaceDetectionCamera or verification screen
const { token } = useAuth(); // Your auth context

<FaceDetectionCamera
  onStatusChange={setDetectionStatus}
  onVerified={handleVerified}
  onVerifyFailed={handleVerifyFailed}
  token={token} // Optional
/>
```

## 9. Verification Rules

Verification is **automatically triggered** when ALL conditions are met:

- ✅ Exactly **one face** detected
- ✅ Face is **centered** (within 50% width × 50% height of frame)
- ✅ **No sunglasses** (eyes open above threshold)
- ✅ **No hat** (currently not detected by ML Kit, treated as false)
- ✅ **No mask** (currently not detected by ML Kit, treated as false)
- ✅ **Good lighting** (lighting score > 0.7)

**Throttling:** Verification runs at most once every **2 seconds** when conditions are met.

## 10. Performance & Memory

### Optimizations

- **Frame Processing**: Runs in `runAsync` worklet (non-blocking)
- **Throttling**: Prevents excessive API calls (2 sec interval)
- **App State**: Camera pauses when app is backgrounded
- **Cleanup**: All listeners and intervals cleared on unmount
- **Memory**: Frames are processed and discarded immediately (no accumulation)

### Memory Leak Prevention

- ✅ `mounted.current` flag prevents state updates after unmount
- ✅ `verifying.current` flag prevents concurrent verification calls
- ✅ All intervals cleared in `useEffect` cleanup
- ✅ Face detector listeners stopped on unmount

## 11. Troubleshooting

### Camera Not Opening

1. Check permissions: `hasPermission` should be `true`
2. Verify device: `device` should not be `null`
3. Check app state: Camera only active when app is in foreground

### Verification Not Triggering

1. Check face conditions: All must be met (see section 9)
2. Check throttling: Wait 2 seconds between attempts
3. Check API: Verify `verifyFace` service is working
4. Check logs: Look for errors in console

### Frame Conversion Errors

1. **"Failed to encode frame"**: 
   - Check if `frame.toBase64()` is available (update react-native-vision-camera)
   - Or ensure `expo-file-system` is installed for fallback

2. **"Failed to read frame file"**:
   - Install `expo-file-system`: `npx expo install expo-file-system`
   - Or update to newer Vision Camera version with `toBase64()` support

### Build Errors

**iOS:**
```bash
cd ios && pod install
```

**Android:**
```bash
cd android && ./gradlew clean
```

## 12. Running the App

### Development Build (Required)

Vision Camera requires native modules - **Expo Go won't work**.

```bash
# Prebuild native code
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

### Web

Face verification is **native-only**. Web uses `FaceDetectionCamera.web.tsx` (mock component).

## 13. Testing

### Manual Testing

1. Open verification screen
2. Camera should open automatically (front camera)
3. Position face in oval
4. Wait for checklist items to turn green
5. Verification should trigger automatically (within 2 seconds)
6. Check API logs to confirm frame is received

### Debug Logging

Add logs in `useLiveFaceVerification.ts`:

```typescript
console.log("Face ready:", isStatusReady(status));
console.log("Last verify:", Date.now() - lastVerifyTs.current);
console.log("Verifying:", verifying.current);
```

## 14. Migration from Old Implementation

The old `useFaceVerification` hook used `takePhoto()` (single capture). The new `useLiveFaceVerification` uses continuous frame processing.

**No breaking changes** - `FaceDetectionCamera` component interface remains the same.

**Old hook** (`useFaceVerification`) is still available but not used by default.

## 15. Production Checklist

- [ ] Set `EXPO_PUBLIC_API_URL` environment variable
- [ ] Configure backend `/verify/face` endpoint
- [ ] Test on real devices (iOS + Android)
- [ ] Verify memory usage (no leaks)
- [ ] Test app state transitions (background/foreground)
- [ ] Test with poor lighting conditions
- [ ] Test with multiple faces in frame
- [ ] Verify throttling works (not too many API calls)
- [ ] Test error handling (network failures, API errors)

## Support

For issues:
1. Check [react-native-vision-camera docs](https://react-native-vision-camera.com/)
2. Check [face-detector issues](https://github.com/luicfrr/react-native-vision-camera-face-detector/issues)
3. Review console logs for errors
4. Verify native setup (prebuild, pods, gradle)
