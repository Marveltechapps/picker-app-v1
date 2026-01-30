# Android APK Build Guide – Production-Ready

Step-by-step commands to generate a **signed release APK** with zero-crash, fast response, and all permissions configured.

---

## Prerequisites

- **Node.js** 18+ and **npm** or **bun**
- **Expo CLI**: `npm install -g expo-cli eas-cli`
- **EAS account**: `eas login` (free tier works for APK)
- **Android SDK** (for local build): Android Studio or `sdkmanager` with `build-tools;34.0.0`, `platforms;android-34`

---

## Option A: EAS Build (Recommended – No local Android SDK)

### 1. Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

### 2. Configure project (first time)

```bash
# From project root
cd c:\Users\lmhfa\Downloads\picker-app-v1-master
eas build:configure
# Select Android when prompted
```

### 3. Build release APK (preview / internal)

```bash
# APK for direct install (no Play Store)
eas build --platform android --profile preview
```

- Build runs on Expo servers.
- When done, download the **APK** from the link in terminal or from [expo.dev](https://expo.dev) → your project → Builds.

### 4. Build production AAB (Play Store)

```bash
eas build --platform android --profile production
```

- Produces an **AAB** (Android App Bundle) for Play Store upload.

### 5. Build development APK (debug)

```bash
eas build --platform android --profile development
```

---

## Option B: Local build (prebuild + Gradle)

### 1. Install dependencies

```bash
cd c:\Users\lmhfa\Downloads\picker-app-v1-master
npm install
```

### 2. Generate native Android project

```bash
npx expo prebuild --platform android --clean
```

- Creates/overwrites the `android/` folder with correct plugins (Vision Camera, ProGuard, etc.).
- **Required** after any change to `app.json` plugins or Android config.

### 3. Build release APK locally

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

- **Windows (PowerShell):**
  ```powershell
  cd android
  .\gradlew.bat clean
  .\gradlew.bat assembleRelease
  ```

- **Output:** `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### 4. Sign the APK (release)

You need a **keystore**. If you don’t have one:

```bash
# One-time: create keystore (replace with your alias/passwords)
keytool -genkeypair -v -storetype PKCS12 -keystore picker-release.keystore -alias picker-key -keyalg RSA -keysize 2048 -validity 10000
```

Then sign (Android docs: [sign your app](https://developer.android.com/studio/publish/app-signing)):

```bash
# Using apksigner (from Android SDK build-tools)
# Paths may vary; adjust ANDROID_HOME to your SDK path
set ANDROID_HOME=C:\Users\<YOU>\AppData\Local\Android\Sdk
%ANDROID_HOME%\build-tools\34.0.0\apksigner sign --ks picker-release.keystore --out app-release-signed.apk app-release-unsigned.apk
```

Or configure **signing in Gradle** (recommended for repeat builds):

- Create `android/keystore.properties` (do not commit):
  ```properties
  storePassword=***
  keyPassword=***
  keyAlias=picker-key
  storeFile=../picker-release.keystore
  ```
- In `android/app/build.gradle`, add a `signingConfigs.release` block that reads `keystore.properties` and set `buildTypes.release.signingConfig = signingConfigs.release`.
- Then `./gradlew assembleRelease` will produce a **signed** APK in `android/app/build/outputs/apk/release/`.

---

## Option C: Local development build (test release behaviour)

```bash
npx expo prebuild --platform android --clean
npx expo run:android --variant release
```

- Installs a release build on connected device/emulator so you can test performance and crashes before distributing.

---

## Verification checklist before release

- [ ] Ran `npx expo prebuild --clean` after any plugin/config change.
- [ ] Tested in release mode: `npx expo start --no-dev --minify` or `npx expo run:android --variant release`.
- [ ] Camera, face verification, biometric, location work without crash.
- [ ] All permissions granted (Camera, Storage, Location, Biometric, Internet) – check in app settings.
- [ ] No red screen / unhandled errors; use `adb logcat` or `capture-crash-logs.ps1` while testing.

---

## Final working APK (summary)

1. **EAS (recommended):**  
   `eas build --platform android --profile preview`  
   → Download the APK from the build link and install on device. No local Android SDK needed.

2. **Local signed APK:**  
   - `npx expo prebuild --platform android --clean`  
   - Create and configure a keystore (see "Sign the APK" above).  
   - `cd android && ./gradlew assembleRelease` (with signing configured in `build.gradle`).  
   - Output: `android/app/build/outputs/apk/release/app-release.apk` (or your signed output path).

3. **Verify:** Install APK, grant Camera / Storage / Location / Biometric / Internet, and test: login, verification, face/camera, biometric, and all main screens. No crash, fast response.

---

## Quick reference

| Goal                    | Command |
|------------------------|--------|
| EAS APK (no SDK)       | `eas build --platform android --profile preview` |
| EAS AAB (Play Store)   | `eas build --platform android --profile production` |
| Local APK              | `npx expo prebuild --clean` then `cd android && ./gradlew assembleRelease` |
| Test release on device | `npx expo run:android --variant release` |
| Capture crash logs     | `.\capture-crash-logs.ps1` (Windows) |

---

## Troubleshooting

- **“Vision Camera / native module not found”**  
  Ensure `react-native-vision-camera` is in `app.json` plugins and run `npx expo prebuild --clean`.

- **“ClassNotFoundException” in release**  
  ProGuard rules are in `android-proguard-rules.pro` and wired via `expo-build-properties` in `app.json`. Prebuild again after changes.

- **Permission denied / crash on camera/biometric**  
  Confirm `app.json` → `android.permissions` includes `CAMERA`, `USE_BIOMETRIC`, `USE_FINGERPRINT`, `INTERNET`, and location permissions. Re-prebuild and reinstall.

- **APK install “App not installed”**  
  Uninstall previous build first, or ensure you’re signing the same app (same package name and signing key).
