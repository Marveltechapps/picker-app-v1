# Live Face Verification - Quick Start

## ✅ Implementation Complete

Live real-time face verification is now implemented. The camera opens automatically and verifies faces continuously.

## What Changed

1. **New Hook**: `hooks/useLiveFaceVerification.ts`
   - Real-time frame processing (not photo capture)
   - Auto-verification when face is ready
   - Throttled API calls (2 seconds)

2. **Updated Component**: `components/FaceDetectionCamera.tsx`
   - Now uses `useLiveFaceVerification` instead of `useFaceVerification`
   - No UI changes - seamless integration

3. **Service**: `services/faceVerification.service.ts`
   - Already supports base64 frames ✅

## Installation

```bash
# Optional: For better file handling (recommended)
npx expo install expo-file-system

# Prebuild native code (required)
npx expo prebuild --clean

# iOS
cd ios && pod install

# Run
npx expo run:ios
# or
npx expo run:android
```

## How It Works

1. **Screen loads** → Front camera opens automatically
2. **Frame processing** → Every frame is analyzed in real-time
3. **Face detection** → Checks for single face, centered, no glasses, etc.
4. **Auto-verify** → When ready, sends frame to API (throttled 2 sec)
5. **Success/Failure** → Triggers existing callbacks

## API Endpoint

Your backend should accept:

```json
POST /verify/face
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

Response:
```json
{
  "success": true,
  "verified": true,
  "message": "Face verified successfully"
}
```

## Configuration

Set in `.env`:
```bash
EXPO_PUBLIC_API_URL=https://your-api.com
```

## Verification Rules

Auto-verifies when ALL are met:
- ✅ Single face detected
- ✅ Face centered (50% width × 50% height)
- ✅ No sunglasses
- ✅ Good lighting (score > 0.7)

## Testing

1. Open verification screen
2. Camera opens automatically
3. Position face in oval
4. Wait for checklist to turn green
5. Verification triggers automatically (within 2 seconds)

## Troubleshooting

**Camera not opening?**
- Check permissions
- Verify `npx expo prebuild` was run

**Verification not triggering?**
- Check all face conditions are met
- Wait 2 seconds between attempts
- Check API endpoint is working

**Frame conversion errors?**
- Install: `npx expo install expo-file-system`
- Or update `react-native-vision-camera` to latest

## Full Documentation

See `docs/LIVE_FACE_VERIFICATION_SETUP.md` for complete details.
