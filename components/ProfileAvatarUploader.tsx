import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform, Alert, ActionSheetIOS } from "react-native";
import { Camera, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

interface ProfileAvatarUploaderProps {
  photoUri: string | null;
  onPhotoSelected: (uri: string) => void;
}

export default function ProfileAvatarUploader({ photoUri, onPhotoSelected }: ProfileAvatarUploaderProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      setUploading(true);
      setUploadSuccess(false);

      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", `Please allow ${useCamera ? "camera" : "photo library"} access to continue.`);
        setUploading(false);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log("Image selected:", uri);
        
        setTimeout(() => {
          onPhotoSelected(uri);
          setUploadSuccess(true);
          setUploading(false);
        }, 500);
      } else {
        setUploading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImage(true);
          } else if (buttonIndex === 2) {
            pickImage(false);
          }
        }
      );
    } else {
      Alert.alert(
        "Add Photo",
        "Choose an option",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: () => pickImage(true) },
          { text: "Choose from Library", onPress: () => pickImage(false) },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer} 
        onPress={showImagePickerOptions}
        activeOpacity={0.7}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.emptyAvatar}>
            <Camera color="#9CA3AF" size={40} strokeWidth={1.5} />
          </View>
        )}
        
        {uploading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}

        {uploadSuccess && !uploading && (
          <View style={styles.successBadge}>
            <Check color="#FFFFFF" size={20} strokeWidth={3} />
          </View>
        )}

        {!photoUri && !uploading && (
          <View style={styles.addPhotoButton}>
            <Text style={styles.addPhotoText}>+ Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
  },
  emptyAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  addPhotoButton: {
    position: "absolute",
    bottom: -32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
    marginTop: 8,
  },
});
