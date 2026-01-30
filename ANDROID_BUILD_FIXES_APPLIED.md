# Android Build Fixes Applied

## Build status: SUCCESS

**APK path:** `android\app\build\outputs\apk\release\app-release.apk`  
**Signing:** Debug keystore (for production, configure your own keystore in `android/app/build.gradle` → `signingConfigs.release`).  
**Architecture:** arm64-v8a only (set in `gradle.properties`; change to `armeabi-v7a,arm64-v8a,x86,x86_64` for all archs).

---

## Summary of Fixes

### 1. SDK location not found
- **Fix:** Created `android/local.properties` with `sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk`.
- If your SDK is elsewhere, edit `android/local.properties` and set `sdk.dir` to your path.

### 2. NDK version mismatch (react-native-worklets-core)
- **Error:** `NDK at ...\27.0.12077973 did not have a source.properties file` or `android.ndkVersion [27.0.12077973] disagrees with ndk.dir`.
- **Fix:** Set `android.ndkVersion=27.1.12297006` in `android/gradle.properties`.
- **Fix:** Patched `node_modules/react-native-worklets-core/android/build.gradle` to use `ndkVersion` from root project (Expo/RN 27.1.12297006). **Re-apply this after `npm install`** if you remove node_modules:
  - In `node_modules/react-native-worklets-core/android/build.gradle`, inside the `android { }` block, add:
    `ndkVersion (rootProject.hasProperty("ext") && rootProject.ext.has("ndkVersion") ? rootProject.ext.get("ndkVersion") : "27.1.12297006")`

### 3. Manifest merger: minSdkVersion 24 < 26 (vision-camera-face-detector)
- **Error:** `uses-sdk:minSdkVersion 24 cannot be smaller than version 26 declared in library [:react-native-vision-camera-face-detector]`.
- **Fix:** Set `minSdkVersion` to 26 in `app.json` and in `android/app/build.gradle` use `minSdkVersion Math.max(26, rootProject.ext.minSdkVersion)`.

### 4. Ninja "manifest still dirty after 100 tries" (Windows)
- **Fix:** Set `org.gradle.parallel=false` and `org.gradle.workers.max=2` in `android/gradle.properties` to reduce parallel CMake builds.
- If it still fails, build with one architecture to avoid parallel native builds:
  - In `android/gradle.properties` set: `reactNativeArchitectures=arm64-v8a`
  - Then run `.\gradlew.bat assembleRelease`. APK will work on most 64-bit devices.

## Build Commands

From project root:

```powershell
cd android
.\gradlew.bat assembleRelease
```

Release APK output (unsigned, debug signing for now):
`android\app\build\outputs\apk\release\app-release.apk`

Build can take **15–25+ minutes** (native CMake for worklets, vision-camera, reanimated). Let it run to completion.

## If Build Fails Again

1. **Ninja manifest dirty:** Clean native caches and retry:
   ```powershell
   Remove-Item -Recurse -Force node_modules\react-native-worklets-core\android\.cxx -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules\react-native-vision-camera\android\.cxx -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules\react-native-reanimated\android\.cxx -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
   cd android; .\gradlew.bat assembleRelease
   ```

2. **Path too long (Windows):** Move project to a shorter path (e.g. `C:\proj\picker`) and rebuild.

3. **Out of memory:** In `android/gradle.properties` increase `org.gradle.jvmargs` (e.g. `-Xmx4096m`).
