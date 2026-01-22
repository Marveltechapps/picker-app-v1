import React from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

interface DocumentThumbnailProps {
  uri: string | null;
  isUploading?: boolean;
}

export default function DocumentThumbnail({ uri, isUploading }: DocumentThumbnailProps) {
  if (isUploading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }

  if (!uri) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />
      <View style={styles.checkBadge}>
        <CheckCircle2 color="#FFFFFF" size={16} strokeWidth={2.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
