import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/state/authContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootLayoutNav() {
  const { hasCompletedPermissionOnboarding, hasCompletedLogin, hasCompletedProfile, hasCompletedVerification, hasCompletedDocuments, hasCompletedTraining, hasCompletedSetup, hasCompletedManagerOTP, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log("Still loading auth state...");
      return;
    }

    console.log("Auth state loaded:", {
      hasCompletedPermissionOnboarding,
      hasCompletedLogin,
      hasCompletedProfile,
      hasCompletedVerification,
      hasCompletedDocuments,
      hasCompletedTraining,
      hasCompletedSetup,
      hasCompletedManagerOTP,
      isLoading,
    });

    const isSplashScreen = segments[0] === "splash";
    
    // Only hide native splash when we're not on the splash screen
    // This allows the custom splash screen to show first
    if (!isSplashScreen) {
      SplashScreen.hideAsync().catch((err) => console.error("Error hiding splash:", err));
    }
    const inAuthFlow = segments[0] === "permissions" || segments[0] === "login" || segments[0] === "otp" || segments[0] === "profile" || segments[0] === "verification" || segments[0] === "documents" || segments[0] === "aadhar-upload" || segments[0] === "pan-upload" || segments[0] === "verification-loading" || segments[0] === "success" || segments[0] === "training" || segments[0] === "training-video" || segments[0] === "location-type" || segments[0] === "shift-selection" || segments[0] === "get-started" || segments[0] === "collect-device";
    const inTabs = segments[0] === "(tabs)";
    // Check if documents is in any segment position - this prevents redirects to home
    const isDocumentsRoute = (segments as string[]).includes("documents");
    const inProfilePages = segments[0] === "personal-information" || segments[0] === "work-history" || segments[0] === "bank-details" || segments[0] === "update-bank-details" || segments[0] === "update-upi-details" || segments[0] === "my-documents" || segments[0] === "document-detail" || segments[0] === "support-settings" || segments[0] === "notifications" || segments[0] === "faqs" || segments[0] === "contact-support" || segments[0] === "terms-conditions" || segments[0] === "privacy-policy" || segments[0] === "training" || segments[0] === "training-video" || isDocumentsRoute;

    console.log("Navigation check:", {
      segments,
      isSplashScreen,
      inAuthFlow,
      inTabs,
      isDocumentsRoute,
      inProfilePages,
    });

    // Don't redirect if on splash screen - let it handle its own navigation
    if (isSplashScreen) {
      return;
    }

    // Handle index route - it will redirect to splash
    // Don't interfere with that redirect
    if ((segments[0] as string) === "index") {
      return;
    }

    if (!hasCompletedPermissionOnboarding && !inAuthFlow) {
      console.log("Redirecting to permissions");
      router.replace("/permissions");
    } else if (hasCompletedPermissionOnboarding && !hasCompletedLogin && !inAuthFlow && !inTabs) {
      console.log("Redirecting to login");
      router.replace("/login");
    } else if (hasCompletedPermissionOnboarding && hasCompletedLogin && !hasCompletedProfile && !inAuthFlow && !inTabs) {
      console.log("Redirecting to profile");
      router.replace("/profile");
    } else if (hasCompletedPermissionOnboarding && hasCompletedLogin && hasCompletedProfile && !hasCompletedDocuments && !inAuthFlow && !inTabs) {
      console.log("Redirecting to documents");
      router.replace("/documents");
    } else if (hasCompletedPermissionOnboarding && hasCompletedLogin && hasCompletedProfile && hasCompletedDocuments && !hasCompletedVerification && !inAuthFlow && !inTabs) {
      console.log("Redirecting to verification");
      router.replace("/verification");
    } else if (hasCompletedPermissionOnboarding && hasCompletedLogin && hasCompletedProfile && hasCompletedDocuments && hasCompletedVerification && !hasCompletedTraining && !inAuthFlow && !inTabs) {
      console.log("Redirecting to training");
      router.replace("/training");
    } else if (hasCompletedPermissionOnboarding && hasCompletedLogin && hasCompletedProfile && hasCompletedVerification && hasCompletedDocuments && hasCompletedTraining && !hasCompletedSetup && !inAuthFlow && !inTabs) {
      console.log("Redirecting to location-type");
      router.replace("/location-type");
    } else if (hasCompletedPermissionOnboarding && hasCompletedLogin && hasCompletedProfile && hasCompletedVerification && hasCompletedDocuments && hasCompletedTraining && hasCompletedSetup && segments[0] !== "get-started" && segments[0] !== "(tabs)" && !inAuthFlow && !inTabs && !inProfilePages && !isDocumentsRoute) {
      console.log("Redirecting to get-started");
      router.replace("/get-started");
    } else if (hasCompletedPermissionOnboarding && hasCompletedLogin && hasCompletedProfile && hasCompletedVerification && hasCompletedDocuments && hasCompletedTraining && hasCompletedSetup && segments[0] === "get-started" && !inTabs && !inProfilePages && !isDocumentsRoute) {
      // Allow get-started screen, navigation to tabs will happen from get-started screen
      return;
    }
  }, [hasCompletedPermissionOnboarding, hasCompletedLogin, hasCompletedProfile, hasCompletedVerification, hasCompletedDocuments, hasCompletedTraining, hasCompletedSetup, hasCompletedManagerOTP, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B4EFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="permissions" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="verification" options={{ headerShown: false }} />
      <Stack.Screen name="documents" options={{ headerShown: false }} />
      <Stack.Screen name="aadhar-upload" options={{ headerShown: false }} />
      <Stack.Screen name="pan-upload" options={{ headerShown: false }} />
      <Stack.Screen name="verification-loading" options={{ headerShown: false }} />
      <Stack.Screen name="success" options={{ headerShown: false }} />
      <Stack.Screen name="training" options={{ headerShown: false }} />
      <Stack.Screen name="training-video" options={{ headerShown: false }} />
      <Stack.Screen name="location-type" options={{ headerShown: false }} />
      <Stack.Screen name="shift-selection" options={{ headerShown: false }} />
      <Stack.Screen name="get-started" options={{ headerShown: false }} />
      <Stack.Screen name="collect-device" options={{ headerShown: false }} />
      <Stack.Screen name="personal-information" options={{ headerShown: false }} />
      <Stack.Screen name="work-history" options={{ headerShown: false }} />
      <Stack.Screen name="bank-details" options={{ headerShown: false }} />
      <Stack.Screen name="update-bank-details" options={{ headerShown: false }} />
      <Stack.Screen name="update-upi-details" options={{ headerShown: false }} />
      <Stack.Screen name="document-detail" options={{ headerShown: false }} />
      <Stack.Screen name="my-documents" options={{ headerShown: false }} />
      <Stack.Screen name="support-settings" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="faqs" options={{ headerShown: false }} />
      <Stack.Screen name="contact-support" options={{ headerShown: false }} />
      <Stack.Screen name="terms-conditions" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
}
