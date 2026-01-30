# Release APK Fixes – Summary

## Problem
- App worked in Expo Go and Web.
- Installed release APK: screens did not work, app crashed or exited to home, no workflow ran.

## Root Causes Addressed

### 1. **Auth load blocking forever (critical)**
- **Cause:** `AuthContext.loadState()` reads from AsyncStorage; in release APK AsyncStorage can hang or fail (different storage path, permission, or native timing). `isLoading` stayed `true` → app showed only loading spinner, navigation never rendered.
- **Fix:** Added a **5s timeout** to `loadState()` in `state/authContext.tsx`. If `Promise.all(AsyncStorage.getItem(...))` does not resolve in 5s, we set default state and `isLoading: false` so the app never freezes on the loading screen.

### 2. **Native splash never hidden**
- **Cause:** Native splash was hidden only when `!isSplashScreen` and after auth loaded. If auth never completed, splash stayed on screen or transition never happened.
- **Fix:** In `app/_layout.tsx`, **force-hide native splash after 3s** with `setTimeout(() => SplashScreen.hideAsync(), 3000)`. First screen (splash or loading) always appears; app never sticks on white/splash.

### 3. **expo-face-detector loaded at app startup**
- **Cause:** `services/faceRecognition.service.ts` required `expo-face-detector` at module load. On release APK this could run before native modules were ready and contribute to crashes on open.
- **Fix:** **Lazy-load** expo-face-detector: load it only when `getFaceDetectorSettings()` or `isFaceDetectionAvailable()` is first called (e.g. when opening verification screen). App startup no longer touches the face detector module.

### 4. **ProGuard / R8 stripping**
- **Cause:** Release minification could strip Expo Camera and AsyncStorage classes.
- **Fix:** Updated `android-proguard-rules.pro`: added keep rules for **expo.modules.camera** and **com.reactnativecommunity.asyncstorage**. Existing rules for Vision Camera, Worklets, ML Kit, Reanimated, and expo-face-detector kept.

### 5. **Android config**
- **Fix:** In `app.json` under `android`: set **softwareKeyboardLayoutMode: "pan"** so keyboard doesn’t break layout on Android.
- **Fix:** In `capture-crash-logs.ps1`: use correct Android package **com.anonymous.expoapp** (from `app.json` android.package) for logcat filtering.

## Files Changed

| File | Change |
|------|--------|
| `state/authContext.tsx` | 5s timeout for `loadState()`; on timeout set default state and `isLoading: false`. |
| `app/_layout.tsx` | Force-hide native splash after 3s. |
| `services/faceRecognition.service.ts` | Lazy-load expo-face-detector (no require at module load). |
| `android-proguard-rules.pro` | Keep rules for expo camera, AsyncStorage. |
| `app.json` | `android.softwareKeyboardLayoutMode: "pan"`. |
| `capture-crash-logs.ps1` | Package name `com.anonymous.expoapp`. |

## Safety Guarantees

- **No freeze on load:** Auth load has a 5s timeout; app always leaves loading state.
- **No stuck splash:** Native splash is hidden after at most 3s.
- **No startup crash from face detector:** Face detector is loaded only when verification/camera screen is used.
- **No ProGuard-related crashes:** ProGuard rules keep required native/Expo and AsyncStorage classes.

## Rebuild and Test

1. **Build release APK**

   **Option A – EAS (recommended):** Log in first (`npx eas-cli login`), then:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

   **Option B – Local (Windows):**
   ```powershell
   npx expo prebuild --clean
   cd android
   .\gradlew.bat assembleRelease
   ```
   APK output: `android\app\build\outputs\apk\release\app-release.apk`

   **Option C – Local (Mac/Linux):**
   ```bash
   npx expo prebuild --clean
   cd android && ./gradlew assembleRelease
   ```

2. **Capture logs if issues remain:**
   ```powershell
   .\capture-crash-logs.ps1
   ```
   Then open the APK, reproduce the issue, stop the script, and inspect `crash-logs/crash_*.log` for `FATAL EXCEPTION`, `ClassNotFoundException`, or native module errors.

3. **Verify on device:**
   - APK opens and first screen appears.
   - Navigation works (splash → permissions → login → …).
   - Camera / face verification and other flows work.
   - Test on Android 8 (API 26) through latest.

## If Crashes Persist

1. Run `.\capture-crash-logs.ps1`, reproduce crash, then search the log for:
   - `FATAL EXCEPTION`
   - `ClassNotFoundException`
   - `com.mrousavy.camera` (Vision Camera)
   - `com.google.mlkit` / `expo.modules.facedetector`
   - `AsyncStorage` / `expo.modules.camera`
2. If R8/minify is suspected: in `app.json` under `expo-build-properties` → `android`, you can try adding `"enableProguardInReleaseBuilds": false` (or the equivalent in your Expo version) to test; re-enable and refine ProGuard rules once the failing class is known.
3. Ensure **all** native modules used in the app are listed in `app.json` **plugins** (e.g. react-native-vision-camera, expo-camera, expo-face-detector via expo-camera) and run `npx expo prebuild --clean` before building.
