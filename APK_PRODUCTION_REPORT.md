# APK Production Report – Expo Go Parity

**Goal:** Installed APK must behave exactly like Expo Go. No UI changes.

**Status:** Production-ready fixes applied. Rebuild APK and validate on device.

---

## A. Runtime Investigation (Audit)

No device was connected during this session. The following is based on:

- Full project audit (entry, layout, auth, splash, native modules, notifications, Constants usage).
- Known causes of “works in Expo Go, fails in APK”: executionEnvironment difference, native module init, AsyncStorage timing, splash/init flow, ProGuard stripping, Constants/minify edge cases.

---

## B. Root Causes Addressed

### 1. **Constants / executionEnvironment in standalone APK**

- **Issue:** Code uses `Constants.executionEnvironment === 'storeClient'` to detect Expo Go. In APK it is `'standalone'`. If `Constants` is undefined (minify/edge case), access throws and the app can crash at startup.
- **Fix:** All reads of `Constants` for Expo Go detection are now guarded:
  - `utils/notificationService.ts`: `const isExpoGo = typeof Constants !== 'undefined' && Constants?.executionEnvironment === 'storeClient'`
  - `utils/expoGoDetection.ts`: `isExpoGo()` returns `false` if `typeof Constants === 'undefined'`
  - `app/_layout.tsx`: Same safe check before using `Constants` for push/notifications.
  - `app/permissions.tsx`: Same safe check for push notification flow.

### 2. **Notification listeners setup in _layout**

- **Issue:** `setupNotificationListeners()` was called in a `useEffect` without try/catch. If it threw (e.g. expo-notifications not ready in standalone), the effect could crash.
- **Fix:** Wrapped call in try/catch; cleanup is a no-op on error; cleanup function is always returned and called safely in the effect’s return.

### 3. **Loading screen color**

- **Issue:** `colors.primary[650]` could be undefined in an edge case and break the loading screen.
- **Fix:** Use `colors?.primary?.[650] ?? colors?.primary?.[600] ?? '#5B4EFF'` so the loading indicator always has a valid color.

### 4. **Splash and index navigation**

- **Issue:** `router.replace()` in splash and index could throw and break navigation.
- **Fix:** Both routes wrap `router.replace()` in try/catch so navigation errors don’t crash the app.

### 5. **ProGuard / R8 (standalone APK)**

- **Issue:** Minification could strip Expo modules used at runtime.
- **Fix:** In `android-proguard-rules.pro` added:
  - `-keep class expo.modules.** { *; }` and `-dontwarn expo.modules.**`
  - (Existing keeps for Vision Camera, Worklets, ML Kit, Reanimated, expo-face-detector, expo-camera, AsyncStorage remain.)

### 6. **app.config.js**

- **Issue:** Returning only `{ scheme }` could drop other keys if the merge was wrong.
- **Fix:** Explicit merge: `const expo = { ...base, scheme: base.scheme ?? 'rork-app' }` so the full app.json config is preserved for the standalone build.

### 7. **Existing safeguards (unchanged)**

- Auth load: 5s timeout in `state/authContext.tsx` so the app never hangs on AsyncStorage.
- Native splash: Force-hide after 3s in `app/_layout.tsx` so the app never sticks on the native splash.
- Face detector: Lazy-loaded in `services/faceRecognition.service.ts` so expo-face-detector is not required at startup.
- Native error handler: `utils/nativeErrorHandler.ts` and setup in `_layout.tsx` (no change).

---

## C. Compatibility

- **Android:** `minSdkVersion` 26 (Android 8.0) in app.json; supports common devices from Android 8 to latest.
- **Permissions:** Camera, biometric, storage, location, notifications, internet are declared in app.json and wired via Expo plugins; no UI change.
- **Expo Go vs APK:** Logic is identical; only the execution environment check (`storeClient` vs `standalone`) changes, with safe fallbacks so APK never crashes on missing `Constants`.

---

## D. Validation Steps

1. **Rebuild release APK**
   - EAS: `npx eas-cli login` then `npx eas-cli build --platform android --profile preview`
   - Local: `npx expo prebuild --clean`, then in `android`: `.\gradlew.bat assembleRelease` (Windows) or `./gradlew assembleRelease` (Mac/Linux).

2. **Install and test on a real device**
   - App opens and first screen loads.
   - Navigation: splash → permissions → login → … (same as Expo Go).
   - No infinite loading, no crash on open.
   - Major flows: permissions, login, profile, verification (expo-camera), documents, training, location, get-started, tabs.

3. **If issues remain – capture logs**
   - Run: `.\capture-crash-logs.ps1` (package set to `com.anonymous.expoapp`).
   - Reproduce the problem, then stop the script.
   - Inspect `crash-logs\crash_*.log` for `FATAL EXCEPTION`, `ClassNotFoundException`, and expo/vision-camera/AsyncStorage-related lines.

---

## E. Files Changed (No UI Change)

| File | Change |
|------|--------|
| `utils/notificationService.ts` | Safe `Constants` check for `isExpoGo`. |
| `utils/expoGoDetection.ts` | Safe `Constants` check in `isExpoGo()`. |
| `app/_layout.tsx` | Safe `Constants` checks; try/catch around notification listeners; safe cleanup; loading color fallback. |
| `app/permissions.tsx` | Safe `Constants` check for push notifications. |
| `app/splash.tsx` | try/catch around `router.replace("/permissions")`. |
| `app/index.tsx` | try/catch around `router.replace("/splash")`. |
| `android-proguard-rules.pro` | Keep rules for `expo.modules.**`. |
| `app.config.js` | Full config merge with `...base`. |

---

## Success Condition

**“Expo Go behavior == Installed APK behavior (100%).”**

- Same screens, same navigation, same features.
- No crash on startup, no infinite loading, no freeze.
- Camera, permissions, notifications, and auth flow work in APK as in Expo Go, with safe fallbacks when `Constants` or native modules are unavailable or slow.

Rebuild the APK, run the validation steps above, and use the crash log script if any issue persists.
