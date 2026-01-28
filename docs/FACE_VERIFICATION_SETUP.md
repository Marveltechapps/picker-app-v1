# Real-Time Face Verification Setup

## Overview

Live face verification uses **react-native-vision-camera** and **react-native-vision-camera-face-detector** for real-time face detection via frame processors. When a single, centered face meets all rules, frames are throttled (every ~1.5s), captured, and sent to `verifyFace`. On success, the app runs the existing success flow; on failure, it shows an alert.

## 1. Package Installation

```bash
npm install react-native-vision-camera react-native-vision-camera-face-detector react-native-worklets-core --legacy-peer-deps
# or, if using Expo:
npx expo install react-native-vision-camera
npm install react-native-vision-camera-face-detector react-native-worklets-core --legacy-peer-deps
```

## 2. Babel Configuration

Ensure `babel.config.js` includes:

- `react-native-worklets-core/plugin` (before Reanimated)
- `react-native-reanimated/plugin` (last)

```js
plugins: [
  "react-native-worklets-core/plugin",
  "react-native-reanimated/plugin",
],
```

## 3. Expo Config Plugin (app.json)

Add the Vision Camera plugin:

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

## 4. Android + iOS Native Setup

### Prebuild (Expo)

```bash
npx expo prebuild --clean
```

### iOS

- Camera usage description is set via the Vision Camera plugin.
- Run `npx pod-install` or `cd ios && pod install` after prebuild.

### Android

- `AndroidManifest.xml` gets camera permission from the plugin.
- Minimum SDK 21+. If you use latest Vision Camera / face detector, check their docs for any higher minSdkVersion.

### Gradle / Kotlin issues (face detector)

If you see `compileDebugKotlin` or similar errors:

1. Clear Gradle cache: `cd android && ./gradlew clean`
2. Ensure Kotlin version is compatible (see [face-detector issues](https://github.com/luicfrr/react-native-vision-camera-face-detector/issues)).

## 5. Example `verifyFace` API

The app calls `verifyFace` from `services/faceVerification.service.ts`. Two payload shapes are supported:

### Option A: File URI (multipart)

```ts
await verifyFace({ uri: "file:///path/to/photo.jpg" });
```

The service sends `multipart/form-data` with the file.

### Option B: Base64

```ts
await verifyFace({ base64: "data:image/jpeg;base64,..." });
```

The service sends `application/json` with `{ image: "<base64>" }`.

### Example backend (Node/Express)

```js
// POST /verify/face
// Body: either multipart file "face" or JSON { image: "<base64>" }

app.post("/verify/face", async (req, res) => {
  let imageBuffer;
  if (req.is("multipart/form-data") && req.files?.face) {
    imageBuffer = req.files.face.data;
  } else if (req.body?.image) {
    imageBuffer = Buffer.from(req.body.image, "base64");
  } else {
    return res.status(400).json({ error: "Missing image" });
  }
  // Run your face verification (e.g. compare to stored template, call 3rd‑party API)
  const verified = await yourVerificationLogic(imageBuffer);
  res.json({ success: true, verified });
});
```

Replace `yourVerificationLogic` with your actual verification (e.g. face match, liveness).

## 6. Configuration

- **Base URL**: Set `EXPO_PUBLIC_API_URL` (or pass `baseUrl` into `verifyFace` options) to your API root.
- **Auth**: Pass `token` into `useFaceVerification` options; it’s sent as `Authorization: Bearer <token>`.

## 7. Architecture

| Piece | Role |
|-------|------|
| `hooks/useFaceVerification` | Permission, front device, frame processor, face→status mapping, throttled capture→verify, success/failure callbacks |
| `services/faceVerification.service` | `verifyFace` API client, retries, error handling |
| `utils/visionCameraFaceMapper` | Maps detector `Face[]` + dimensions → `FaceDetectionStatus` |
| `components/FaceDetectionCamera` | Renders Vision Camera + oval overlay; uses `useFaceVerification` |
| `app/verification` | Passes `onVerified` / `onVerifyFailed`; connects to existing success/error flow |

## 8. Performance and Stability

- **Frame processor**: Face detection runs inside `runAsync` so it doesn’t block the camera pipeline.
- **Throttling**: Verification runs at most once every ~1.5s when the face is “ready.”
- **App state**: Camera and verification are paused when the app is backgrounded (`AppState`).
- **Cleanup**: `stopListeners` is called on unmount; intervals and subscriptions are cleared.
- **Web**: `FaceDetectionCamera.web` is used on web (mock). Vision Camera and face detector run only on native.

## 9. Verification Rules

Verification is **blocked** unless:

- Exactly one face is detected.
- Face is centered (within 50% width × 50% height).
- No sunglasses (eyes open above threshold).
- Hat/mask: not derived from ML Kit; currently treated as “not detected.”

When all conditions hold, throttled capture and `verifyFace` run automatically.

## 10. Optional: Remove ML Kit Face Detection

The previous implementation used `@infinitered/react-native-mlkit-face-detection`. Live verification now uses **react-native-vision-camera-face-detector** only. You can remove the ML Kit package if it’s unused elsewhere:

```bash
npm uninstall @infinitered/react-native-mlkit-face-detection
```

Delete `utils/faceDetectionMapper.ts` if you no longer need the ML Kit–specific mapper.

## 11. Running the App

- **Native (dev build)**:
  ```bash
  npx expo prebuild
  npx expo run:ios
  # or
  npx expo run:android
  ```
- **Expo Go**: Vision Camera and the face detector plugin use native modules; use a **development build**, not Expo Go.
- **Web**: The verification screen uses `FaceDetectionCamera.web` (mock). Real-time verification runs only on native.
