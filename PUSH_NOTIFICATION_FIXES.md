# Push Notification Setup Fixes

## Date: 2026-01-27

## Issues Fixed

### 1. **EAS Project ID Retrieval**
   - **Problem**: Project ID was only checked from one source (`expoConfig`), which might not work in all Expo SDK versions
   - **Fixed**: Now checks multiple sources in order:
     - `Constants.manifest2?.extra?.eas?.projectId` (SDK 54+)
     - `Constants.expoConfig?.extra?.eas?.projectId` (older SDK)
     - `Constants.manifest?.extra?.eas?.projectId` (legacy)
   - **Location**: `utils/notificationService.ts` line 164-180

### 2. **Expo Go Detection**
   - **Problem**: Detection logic was too strict, potentially blocking development builds
   - **Fixed**: Simplified to only check `Constants.executionEnvironment === 'storeClient'`
   - **Location**: `utils/notificationService.ts`, `app/_layout.tsx`, `app/permissions.tsx`

### 3. **Notification Handler Setup**
   - **Problem**: Handler setup could fail silently
   - **Fixed**: Added platform check and better error logging
   - **Location**: `utils/notificationService.ts` line 20-36

### 4. **Error Handling & Logging**
   - **Problem**: Errors were not descriptive enough
   - **Fixed**: 
     - Added helpful error messages with tips
     - Added debug logging for token registration
     - Added verification function for diagnostics
   - **Location**: `utils/notificationService.ts`

### 5. **Device Detection**
   - **Problem**: Device check could fail if expo-device wasn't available
   - **Fixed**: Added null-safe checks
   - **Location**: `utils/notificationService.ts`

## New Features

### Verification Function
Added `verifyPushNotificationSetup()` function to help diagnose push notification issues:
```typescript
import { verifyPushNotificationSetup } from '@/utils/notificationService';

const diagnostics = await verifyPushNotificationSetup();
console.log(diagnostics);
// Returns: { isSupported, isExpoGo, isPhysicalDevice, hasPermissions, hasProjectId, projectId, errors }
```

## Setup Requirements

### 1. Configure EAS Project (Required for Push Notifications)

Push notifications require an EAS project ID. To set it up:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure your project (this will add projectId to app.json)
eas build:configure
```

This will automatically add the `projectId` to your `app.json` under `extra.eas.projectId`.

### 2. Development Build Required

**Push notifications DO NOT work in Expo Go** (SDK 53+). You need a development build:

```bash
# Create a development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Or use local builds
npx expo prebuild
npx expo run:ios
npx expo run:android
```

### 3. Physical Device Required

Push notifications only work on **physical devices**, not simulators/emulators.

### 4. Backend Configuration (Optional)

To send tokens to your backend, set the environment variable:

```bash
# Create .env file
EXPO_PUBLIC_API_URL=https://your-api.com
```

The backend endpoint should accept POST requests to `/api/push-tokens` with:
```json
{
  "token": "ExponentPushToken[...]",
  "userId": "user-id",
  "platform": "ios" | "android",
  "deviceId": "device-model"
}
```

## Testing Push Notifications

### 1. Verify Setup
```typescript
import { verifyPushNotificationSetup } from '@/utils/notificationService';

const diagnostics = await verifyPushNotificationSetup();
if (diagnostics.errors.length > 0) {
  console.error('Push notification setup issues:', diagnostics.errors);
}
```

### 2. Request Permissions
```typescript
import { requestNotificationPermissions } from '@/utils/notificationService';

const granted = await requestNotificationPermissions();
if (granted) {
  console.log('Permissions granted!');
}
```

### 3. Register Token
```typescript
import { registerForPushNotifications } from '@/utils/notificationService';

const token = await registerForPushNotifications();
if (token) {
  console.log('Token:', token);
}
```

### 4. Send Test Notification
```typescript
import { sendTestNotification } from '@/utils/notificationService';

await sendTestNotification('Test', 'This is a test notification');
```

## Troubleshooting

### Issue: "EAS project ID not found"
**Solution**: Run `eas build:configure` to set up your EAS project

### Issue: "Push notifications not supported in Expo Go"
**Solution**: Create a development build using `eas build --profile development` or `npx expo prebuild`

### Issue: "Push notifications only work on physical devices"
**Solution**: Test on a real device, not a simulator/emulator

### Issue: "Notification permissions not granted"
**Solution**: 
- Check device settings
- Make sure you're requesting permissions correctly
- On iOS, permissions can only be requested once - reset app if needed

### Issue: Token registration fails
**Solution**:
1. Verify EAS project ID is configured
2. Check you're using a development build (not Expo Go)
3. Ensure you're on a physical device
4. Check notification permissions are granted
5. Review console logs for specific error messages

## Files Modified

1. `utils/notificationService.ts` - Fixed project ID retrieval, improved error handling
2. `app/_layout.tsx` - Fixed Expo Go detection, improved logging
3. `app/permissions.tsx` - Fixed Expo Go detection

## Next Steps

1. Run `eas build:configure` to set up EAS project ID
2. Create a development build for testing
3. Test on a physical device
4. Configure backend URL if needed (optional)

## Notes

- Push notifications are automatically skipped in Expo Go with helpful warnings
- All functions handle errors gracefully and won't crash the app
- Debug logging is enabled in development mode
- The app will function normally even if push notifications fail to set up
