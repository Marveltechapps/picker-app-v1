import React, { useEffect } from "react";
import { View, Text, StyleSheet, StatusBar, Image, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const hideNativeSplash = async () => {
      try {
        await ExpoSplashScreen.hideAsync();
      } catch (_) {}
    };
    hideNativeSplash();

    const timer = setTimeout(() => {
      try {
        router.replace("/permissions");
      } catch (_) {}
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A3AFF" />
      
      {/* Logo/Icon Container */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Image 
            source={require("@/assets/images/icon.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Text Container */}
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Picker Pro</Text>
        <Text style={styles.tagline}>Scan Fast. Pick Smart.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A3AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    top: "37%", // Approximately 280.75px from top in 757.5px height
    alignItems: "center",
    justifyContent: "center",
  },
  logoBackground: {
    width: 98,
    height: 98,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 8px 10px rgba(0, 0, 0, 0.1)', elevation: 8 }
      : { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 }
    ),
  },
  logo: {
    width: 42,
    height: 42,
  },
  textContainer: {
    position: "absolute",
    bottom: "30%", // Approximately 406.75px from top in 757.5px height
    alignItems: "center",
    gap: 10.5,
  },
  heading: {
    fontSize: 31.5,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.79, // -2.5% of 31.5
    lineHeight: 35,
  },
  tagline: {
    fontSize: 15.75,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24.5,
  },
});

