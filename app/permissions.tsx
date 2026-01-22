import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Camera, Battery, MapPin, MapPinned } from "lucide-react-native";
import { useAuth, PermissionsState } from "@/state/authContext";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import PermissionCard from "@/components/PermissionCard";
import PermissionModal from "@/components/PermissionModal";
import PrimaryButton from "@/components/PrimaryButton";

const PERMISSIONS_LIST: {
  key: keyof PermissionsState;
  icon: typeof Bell;
  title: string;
  description: string;
}[] = [
  {
    key: "pushNotifications",
    icon: Bell,
    title: "Push Notification",
    description: "Turn on notifications to get updates about your application",
  },
  {
    key: "camera",
    icon: Camera,
    title: "Camera",
    description: "We need your camera to take pictures or upload documents",
  },
  {
    key: "battery",
    icon: Battery,
    title: "Battery Usage",
    description: "We need you to allow unrestricted battery usage to connect you to nearby Stores",
  },
  {
    key: "location",
    icon: MapPin,
    title: "Location",
    description: "We need your location to connect you to nearby Stores",
  },
  {
    key: "backgroundLocation",
    icon: MapPinned,
    title: "Background Location",
    description: "We require background location for accurate rider location updates and geofence detection",
  },
];

export default function PermissionsRequiredScreen() {
  const router = useRouter();
  const { permissions, setPermission, completePermissionOnboarding, allPermissionsGranted } = useAuth();
  const [selectedPermission, setSelectedPermission] = useState<keyof PermissionsState | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Reset all permissions to "pending" when screen loads to ensure cards start white
  useEffect(() => {
    if (!hasInitialized) {
      const resetPermissions = async () => {
        const permissionKeys: (keyof PermissionsState)[] = [
          "pushNotifications",
          "camera",
          "battery",
          "location",
          "backgroundLocation",
        ];
        
        for (const key of permissionKeys) {
          await setPermission(key, "pending");
        }
        setHasInitialized(true);
      };
      resetPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePermissionPress = (key: keyof PermissionsState) => {
    setSelectedPermission(key);
  };

  const handleAllow = () => {
    if (selectedPermission) {
      setPermission(selectedPermission, "allowed");
      setSelectedPermission(null);
    }
  };

  const handleDontAllow = () => {
    if (selectedPermission) {
      setPermission(selectedPermission, "denied");
      setSelectedPermission(null);
    }
  };

  const handleProceed = async () => {
    if (allPermissionsGranted()) {
      await completePermissionOnboarding();
      router.replace("/login");
    }
  };

  const canProceed = allPermissionsGranted();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Bell color="#FFFFFF" size={48} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Permissions Required</Text>
          <Text style={styles.subtitle}>Grant the required access to continue using the App</Text>
        </View>

        <View style={styles.permissionsList}>
          {PERMISSIONS_LIST.map((permission) => (
            <PermissionCard
              key={permission.key}
              icon={permission.icon}
              title={permission.title}
              description={permission.description}
              status={permissions[permission.key]}
              onPress={() => handlePermissionPress(permission.key)}
            />
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {canProceed && (
        <View style={styles.buttonContainer}>
          <PrimaryButton title="Proceed" onPress={handleProceed} />
        </View>
      )}

      {selectedPermission && (
        <PermissionModal
          visible={!!selectedPermission}
          permissionKey={selectedPermission}
          onAllow={handleAllow}
          onDontAllow={handleDontAllow}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['7xl'],
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.headerTop,
    paddingBottom: Spacing['4xl'],
  },
  iconContainer: {
    width: Spacing['7xl'],
    height: Spacing['7xl'],
    borderRadius: BorderRadius['2xl-lg'],
    backgroundColor: Colors.primary[650],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing['2xl'],
    shadowColor: Colors.primary[650],
    shadowOffset: { width: 0, height: Spacing.sm },
    shadowOpacity: 0.3,
    shadowRadius: Spacing.lg,
    elevation: 8,
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.fontSize['md-lg'],
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.normal * Typography.fontSize['md-lg'],
    paddingHorizontal: Spacing.xl,
  },
  permissionsList: {
    gap: 0,
  },
  spacer: {
    height: Spacing.xl,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadows.lg,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
});
