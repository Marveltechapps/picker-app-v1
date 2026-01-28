import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Animated, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Upload, CheckCircle2, FileText } from "lucide-react-native";
import { useAuth } from "@/state/authContext";
import DocumentThumbnail from "@/components/DocumentThumbnail";
import PrimaryButton from "@/components/PrimaryButton";
import { uploadDocument, validateDocumentFile } from "@/utils/documentService";

export default function AadharUploadScreen() {
  const router = useRouter();
  const { documentUploads, updateDocumentUpload } = useAuth();
  const [uploadingFront, setUploadingFront] = useState<boolean>(false);
  const [uploadingBack, setUploadingBack] = useState<boolean>(false);

  const frontUri = documentUploads.aadhar.front;
  const backUri = documentUploads.aadhar.back;
  const bothUploaded = frontUri !== null && backUri !== null;

  // Removed validateImage - using documentService.validateDocumentFile instead

  const pickImage = async (side: "front" | "back") => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photo library");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions?.Images || 'images',
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.9, // Higher quality for better clarity
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uri = asset.uri;
        
        // Validate file
        const validation = validateDocumentFile(
          uri,
          asset.fileSize,
          asset.width,
          asset.height
        );

        if (!validation.isValid) {
          Alert.alert("Validation Error", validation.error || "Invalid file", [{ text: "OK" }]);
          return;
        }
        
        if (side === "front") {
          setUploadingFront(true);
        } else {
          setUploadingBack(true);
        }

        try {
          // Upload to backend (placeholder - replace with actual API)
          const uploadResult = await uploadDocument("aadhar", side, uri);
          
          if (uploadResult.success) {
            // Save to local state
            await updateDocumentUpload("aadhar", side, uri);
          } else {
            Alert.alert(
              "Upload Failed",
              uploadResult.error || "Failed to upload document. Please try again.",
              [{ text: "OK" }]
            );
          }
        } catch (error) {
          console.error("Error uploading document:", error);
          Alert.alert(
            "Error",
            "An unexpected error occurred. Please try again.",
            [{ text: "OK" }]
          );
        } finally {
          if (side === "front") {
            setUploadingFront(false);
          } else {
            setUploadingBack(false);
          }
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setUploadingFront(false);
      setUploadingBack(false);
    }
  };

  const handleContinue = () => {
    if (bothUploaded) {
      // Navigate back to documents screen or my-documents if coming from profile
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/documents');
        }
      } catch (error) {
        router.replace('/documents');
      }
    }
  };

  const handleReplace = (side: "front" | "back") => {
    Alert.alert(
      `Replace ${side === "front" ? "Front" : "Back"} Side`,
      `Are you sure you want to replace the ${side} side of your Aadhaar Card?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Replace",
          onPress: () => pickImage(side),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              try {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push("/documents");
                }
              } catch (error) {
                // Silently handle navigation error
                try {
                  router.push("/documents");
                } catch {
                  // Fallback failed
                }
              }
            }}
          >
            <ChevronLeft color="#111827" size={28} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aadhaar Card</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Upload front and back</Text>

          <View style={styles.guidelinesContainer}>
            <View style={styles.guidelinesHeader}>
              <FileText color="#6B7280" size={18} strokeWidth={2} />
              <Text style={styles.guidelinesTitle}>Upload Guidelines</Text>
            </View>
            <View style={styles.guidelinesList}>
              <Text style={styles.guidelineText}>• Ensure the document is clear and all text is readable</Text>
              <Text style={styles.guidelineText}>• Use good lighting and avoid shadows</Text>
              <Text style={styles.guidelineText}>• Make sure the entire document is visible in the frame</Text>
              <Text style={styles.guidelineText}>• Both front and back sides must be uploaded</Text>
            </View>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Front Side</Text>
            <TouchableOpacity
              style={[styles.uploadBox, frontUri && styles.uploadBoxComplete]}
              onPress={() => pickImage("front")}
              activeOpacity={0.7}
            >
              {uploadingFront ? (
                <DocumentThumbnail uri={null} isUploading={true} />
              ) : frontUri ? (
                <View style={styles.uploadedContent}>
                  <DocumentThumbnail uri={frontUri} />
                  <View style={styles.uploadedOverlay}>
                    <CheckCircle2 color="#8B5CF6" size={32} strokeWidth={2.5} />
                    <Text style={styles.uploadedText}>Front uploaded</Text>
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => handleReplace("front")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Upload color="#9CA3AF" size={48} strokeWidth={2} />
                  <Text style={styles.uploadPromptText}>Tap to upload front side</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Back Side</Text>
            <TouchableOpacity
              style={[styles.uploadBox, backUri && styles.uploadBoxComplete]}
              onPress={() => pickImage("back")}
              activeOpacity={0.7}
            >
              {uploadingBack ? (
                <DocumentThumbnail uri={null} isUploading={true} />
              ) : backUri ? (
                <View style={styles.uploadedContent}>
                  <DocumentThumbnail uri={backUri} />
                  <View style={styles.uploadedOverlay}>
                    <CheckCircle2 color="#8B5CF6" size={32} strokeWidth={2.5} />
                    <Text style={styles.uploadedText}>Back uploaded</Text>
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => handleReplace("back")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Upload color="#9CA3AF" size={48} strokeWidth={2} />
                  <Text style={styles.uploadPromptText}>Tap to upload back side</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Animated.View style={{ opacity: bothUploaded ? 1 : 0.5 }}>
              <PrimaryButton 
                title="Continue" 
                onPress={handleContinue} 
                disabled={!bothUploaded}
              />
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 44,
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 24,
  },
  guidelinesContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  guidelinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  guidelinesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  guidelinesList: {
    gap: 8,
  },
  guidelineText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    lineHeight: 18,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  uploadBox: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadBoxComplete: {
    borderColor: "#8B5CF6",
    borderStyle: "solid",
    backgroundColor: "#F5F3FF",
  },
  uploadPrompt: {
    alignItems: "center",
  },
  uploadPromptText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 12,
  },
  uploadedContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadedOverlay: {
    alignItems: "center",
    marginTop: 12,
  },
  uploadedText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8B5CF6",
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  replaceButton: {
    marginTop: 12,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replaceButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
