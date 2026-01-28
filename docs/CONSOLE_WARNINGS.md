# Web Console Warnings

## 1. `"shadow*" style props are deprecated. Use "boxShadow"`

**Fix applied:** All app code that used `shadow*` on web now uses `boxShadow` when `Platform.OS === 'web'` (e.g. `collect-device`, modals, buttons). The theme `Shadows` in `constants/theme` uses `createShadow`, which returns `boxShadow` on web and `shadow*` on native.

If you still see this:
- It may come from **dependencies** (e.g. `@react-navigation`, `@gorhom/bottom-sheet`). Those need upstream fixes or patching.

---

## 2. `props.pointerEvents is deprecated. Use style.pointerEvents`

**Source:** This warning comes from **dependencies** (e.g. `@gorhom/bottom-sheet`, `react-navigation`, `react-native-gesture-handler`) that pass `pointerEvents` as a **prop** instead of in `style`. App code already uses `pointerEvents` only inside `style` (e.g. `style={[styles.x, { pointerEvents: "none" }]}`).

**What you can do:**
- Keep using `style.pointerEvents` in your own components.
- To remove the warning you’d need to patch those packages (e.g. `patch-package`) or wait for updates.

---

## 3. `Disconnected from Metro (1006)`

**What it is:** The dev app lost its WebSocket connection to the Metro bundler (browser tab refresh, Metro restart, sleep, network change, etc.).

**What to do:**
1. Reload the app in the browser (e.g. F5 or Cmd/Ctrl+R).
2. If it persists, restart Metro (`npm run start:web` or `npx expo start --web`) and reload again.
3. Ensure nothing is blocking Metro (firewall, VPN, etc.).

No code change fixes this; it’s a runtime connection issue.
