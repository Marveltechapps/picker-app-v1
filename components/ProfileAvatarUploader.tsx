import React, { useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform, Alert, ActionSheetIOS, Modal, Dimensions, AccessibilityInfo } from "react-native";
import { Camera, Check, X, Edit2, RotateCw } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import PrimaryButton from "./PrimaryButton";
import CircularImageCrop from "./CircularImageCrop";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { isValidImageUri, getSafeImageSource } from "@/utils/imageUriValidator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 400; // Responsive breakpoint
const isMobile = Platform.OS !== 'web'; // Mobile device detection

// Constants
const MIN_IMAGE_DIMENSION = 200;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const IMAGE_QUALITY = 0.9;
const SUCCESS_BADGE_DURATION = 2000;

interface ProfileAvatarUploaderProps {
  photoUri: string | null;
  onPhotoSelected: (uri: string) => void;
  maxFileSize?: number; // Optional override for max file size
  minDimension?: number; // Optional override for min dimension
}

export default function ProfileAvatarUploader({ 
  photoUri, 
  onPhotoSelected,
  maxFileSize = MAX_FILE_SIZE,
  minDimension = MIN_IMAGE_DIMENSION
}: ProfileAvatarUploaderProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showCropEditor, setShowCropEditor] = useState<boolean>(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [croppedImageUri, setCroppedImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const pickImage = useCallback(async (useCamera: boolean) => {
    try {
      setUploading(true);
      setUploadSuccess(false);
      setShowPreview(false);
      setCroppedImageUri(null);
      setError(null);

      // Request appropriate permissions
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        const permissionType = useCamera ? "camera" : "photo library";
        const errorMessage = `Please allow ${permissionType} access in your device settings to upload your profile photo.`;
        
        Alert.alert(
          "Permission Required",
          errorMessage,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => {
                // On iOS, this will open app settings
                // On Android, user needs to manually go to settings
                if (Platform.OS === 'ios') {
                  // Linking.openSettings() can be used if expo-linking is available
                }
              }
            }
          ]
        );
        setUploading(false);
        return;
      }

      // Launch image picker or camera
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        allowsEditing: false, // We'll use custom circular crop
        quality: IMAGE_QUALITY,
        exif: false,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync({
            ...pickerOptions,
            mediaTypes: ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions?.Images || 'images',
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uri = asset.uri;
        
        // Validate image dimensions
        if (asset.width && asset.height) {
          if (asset.width < minDimension || asset.height < minDimension) {
            const errorMsg = `Please select an image that is at least ${minDimension}x${minDimension} pixels for better quality.`;
            Alert.alert("Image Too Small", errorMsg, [{ text: "OK" }]);
            setUploading(false);
            setError(errorMsg);
            return;
          }
        }

        // Check file size if available
        if (asset.fileSize && asset.fileSize > maxFileSize) {
          const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
          const errorMsg = `Please select an image smaller than ${maxSizeMB}MB.`;
          Alert.alert("File Too Large", errorMsg, [{ text: "OK" }]);
          setUploading(false);
          setError(errorMsg);
          return;
        }

        // Store the selected image and show circular crop editor
        setSelectedImageUri(uri);
        setUploading(false);
        setShowCropEditor(true);
        
        // Announce to screen readers
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          AccessibilityInfo.announceForAccessibility("Image selected. Opening crop editor.");
        }
      } else {
        // User cancelled
        setUploading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to pick image. Please try again.";
      
      Alert.alert(
        "Error",
        errorMessage,
        [{ text: "OK" }]
      );
      setUploading(false);
      setError(errorMessage);
    }
  }, [minDimension, maxFileSize]);

  const handleCropComplete = (croppedUri: string) => {
    setCroppedImageUri(croppedUri);
    setShowCropEditor(false);
    setShowPreview(true);
  };

  const handleCropCancel = () => {
    setShowCropEditor(false);
    setSelectedImageUri(null);
    setUploading(false);
  };

  const handleConfirmCrop = useCallback(async () => {
    if (!croppedImageUri) return;

    setUploading(true);
    setError(null);
    
    try {
      // Small delay for smooth UX transition
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Apply the cropped image
      onPhotoSelected(croppedImageUri);
      setUploadSuccess(true);
      setShowPreview(false);
      setCroppedImageUri(null);
      setSelectedImageUri(null);
      
      // Announce success to screen readers
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility("Profile image updated successfully.");
      }
      
      // Clear previous timeout if exists
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      
      // Reset success badge after duration
      successTimeoutRef.current = setTimeout(() => {
        setUploadSuccess(false);
      }, SUCCESS_BADGE_DURATION);
    } catch (error) {
      console.error("Error applying image:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to set profile image. Please try again.";
      
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [croppedImageUri, onPhotoSelected]);

  const handleRetake = () => {
    setShowPreview(false);
    setCroppedImageUri(null);
    setSelectedImageUri(null);
    // Show picker options again
    setTimeout(() => {
      showImagePickerOptions(!!photoUri);
    }, 300);
  };

  const handleCancelCrop = () => {
    setShowPreview(false);
    setCroppedImageUri(null);
  };

  const showImagePickerOptions = useCallback((isEdit: boolean = false) => {
    const title = isEdit ? "Edit Photo" : "Add Photo";
    const message = isEdit 
      ? "Re-crop current photo or choose a new one" 
      : "Choose an option to add your profile photo";
    
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
          title,
          message,
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
        title,
        message,
        [
          { 
            text: "Cancel", 
            style: "cancel",
            onPress: () => {
              // Announce cancellation to screen readers
              if (Platform.OS === 'android') {
                AccessibilityInfo.announceForAccessibility("Photo selection cancelled.");
              }
            }
          },
          { 
            text: "Take Photo", 
            onPress: () => pickImage(true),
            style: "default"
          },
          { 
            text: "Choose from Library", 
            onPress: () => pickImage(false),
            style: "default"
          },
        ],
        { cancelable: true }
      );
    }
  }, [pickImage]);

  const handleEditPress = () => {
    showImagePickerOptions(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={photoUri ? undefined : () => showImagePickerOptions(false)}
          activeOpacity={0.7}
          disabled={!!photoUri || uploading}
          accessibilityRole="button"
          accessibilityLabel={photoUri ? "Profile photo" : "Add profile photo"}
          accessibilityHint={photoUri ? "Double tap to edit your profile photo" : "Double tap to add a profile photo"}
        >
          {photoUri && isValidImageUri(photoUri) && getSafeImageSource(photoUri) ? (
            <Image 
              source={getSafeImageSource(photoUri)!} 
              style={styles.avatar}
              onError={() => {
                if (__DEV__) {
                  console.warn('Failed to load profile avatar:', photoUri);
                }
              }}
            />
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

          {uploadSuccess && !uploading && photoUri && (
            <View style={styles.successBadge}>
              <Check color="#FFFFFF" size={20} strokeWidth={3} />
            </View>
          )}

          {!photoUri && !uploading && (
            <View style={styles.addPhotoButton}>
              <Text style={styles.addPhotoText}>+ Add Photo</Text>
            </View>
          )}

          {/* Error Message Display */}
          {error && !uploading && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Edit Button Overlay - Only visible when photo exists */}
        {photoUri && !uploading && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
            accessibilityHint="Double tap to change your profile photo"
          >
            <View style={styles.editButtonInner}>
              <Edit2 color="#FFFFFF" size={16} strokeWidth={2.5} />
              <Text style={[styles.editButtonText, { marginLeft: 4 }]}>Edit</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Circular Crop Editor Modal */}
      {selectedImageUri && (
        <Modal
          visible={showCropEditor}
          transparent={false}
          animationType="slide"
          onRequestClose={handleCropCancel}
          statusBarTranslucent
        >
          <CircularImageCrop
            imageUri={selectedImageUri}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        </Modal>
      )}

      {/* Crop Preview Modal with Professional UI */}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={handleCancelCrop}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <View style={styles.previewHeaderContent}>
                <Text style={styles.previewTitle}>Crop & Set Profile Image</Text>
                <Text style={styles.previewSubtitle}>Review your profile photo</Text>
              </View>
              <TouchableOpacity 
                onPress={handleCancelCrop} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color={Colors.gray[500]} size={22} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            
            {/* Circular Preview Image */}
            <View style={styles.previewImageWrapper}>
              <View style={styles.previewImageContainer}>
                {croppedImageUri && isValidImageUri(croppedImageUri) && getSafeImageSource(croppedImageUri) && (
                  <Image 
                    source={getSafeImageSource(croppedImageUri)!} 
                    style={styles.previewImage}
                    resizeMode="cover"
                    onError={() => {
                      if (__DEV__) {
                        console.warn('Failed to load cropped image:', croppedImageUri);
                      }
                    }}
                  />
                )}
                {uploading && (
                  <View style={styles.previewOverlay}>
                    <ActivityIndicator size="large" color={Colors.primary[500]} />
                    <Text style={styles.uploadingText}>Setting profile image...</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.previewActions}>
              {isSmallScreen ? (
                // Mobile: Stack buttons vertically
                <>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.retakeButton} 
                      onPress={handleRetake}
                      activeOpacity={0.7}
                      disabled={uploading}
                    >
                      <RotateCw color={Colors.gray[500]} size={18} strokeWidth={2} />
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.cancelButton, { opacity: uploading ? 0.5 : 1 }]} 
                      onPress={handleCancelCrop}
                      activeOpacity={0.7}
                      disabled={uploading}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <PrimaryButton
                    title="Set Profile Image"
                    onPress={handleConfirmCrop}
                    disabled={uploading}
                    loading={uploading}
                    style={styles.setProfileButton}
                  />
                </>
              ) : (
                // Desktop: Horizontal layout
                <>
                  <TouchableOpacity 
                    style={styles.retakeButton} 
                    onPress={handleRetake}
                    activeOpacity={0.7}
                    disabled={uploading}
                  >
                    <RotateCw color={Colors.gray[500]} size={18} strokeWidth={2} />
                    <Text style={styles.retakeButtonText}>Retake</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.cancelButton, { opacity: uploading ? 0.5 : 1 }]} 
                    onPress={handleCancelCrop}
                    activeOpacity={0.7}
                    disabled={uploading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <PrimaryButton
                    title="Set Profile Image"
                    onPress={handleConfirmCrop}
                    disabled={uploading}
                    loading={uploading}
                    style={styles.setProfileButton}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Create responsive styles based on screen width
const createStyles = () => {
  return StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 32,
  },
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: Colors.gray[100],
  },
  emptyAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border.medium,
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
    backgroundColor: Colors.success[400],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
  },
  addPhotoButton: {
    position: "absolute",
    bottom: -32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addPhotoText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Platform.OS === 'web' ? 600 : Typography.fontWeight.semibold, // Use number for web
    color: Colors.primary[500],
    marginTop: Spacing.sm,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  editButton: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    marginLeft: -40,
    width: 80,
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.md,
  },
  editButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Platform.OS === 'web' ? 700 : Typography.fontWeight.bold, // Use number for web
    color: Colors.white,
    letterSpacing: Typography.letterSpacing.wide,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: isSmallScreen ? Spacing.md : Spacing.xl, // Smaller padding on mobile
  },
  previewContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    width: "100%",
    maxWidth: Math.min(SCREEN_WIDTH - (isSmallScreen ? 20 : 40), 420), // More space on mobile
    padding: 0,
    overflow: "hidden",
    maxHeight: isSmallScreen ? "90%" : undefined, // Prevent overflow on mobile
    ...Shadows.xl,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    padding: isSmallScreen ? Spacing.lg : Spacing['2xl'], // Smaller padding on mobile
    paddingBottom: isSmallScreen ? Spacing.md : Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  previewHeaderContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  previewTitle: {
    fontSize: isSmallScreen ? Typography.fontSize.xl : Typography.fontSize['2xl'], // Smaller on mobile
    fontWeight: Platform.OS === 'web' ? 700 : Typography.fontWeight.bold, // Use number for web
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.tight,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  previewSubtitle: {
    fontSize: isSmallScreen ? Typography.fontSize.sm : Typography.fontSize.md, // Smaller on mobile
    fontWeight: Platform.OS === 'web' ? 400 : Typography.fontWeight.regular, // Use number for web
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[50],
  },
  previewImageWrapper: {
    padding: isSmallScreen ? Spacing.lg : Spacing['2xl'], // Smaller padding on mobile
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray[50],
  },
  previewImageContainer: {
    width: Math.min(SCREEN_WIDTH - (isSmallScreen ? 80 : 120), 320), // More space on mobile
    height: Math.min(SCREEN_WIDTH - (isSmallScreen ? 80 : 120), 320),
    borderRadius: Math.min(SCREEN_WIDTH - (isSmallScreen ? 80 : 120), 320) / 2, // Perfect circle
    overflow: "hidden",
    backgroundColor: Colors.gray[100],
    ...Shadows.lg,
    position: "relative",
    borderWidth: isSmallScreen ? 3 : 4, // Thinner border on mobile
    borderColor: Colors.white,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Math.min(SCREEN_WIDTH - 120, 320) / 2,
  },
  uploadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontWeight: Platform.OS === 'web' ? 500 : Typography.fontWeight.medium, // Use number for web
    color: Colors.text.secondary,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  previewActions: {
    flexDirection: (isSmallScreen || isMobile) ? "column" : "row", // Stack vertically on mobile/small screens
    width: "100%",
    paddingHorizontal: (isSmallScreen || isMobile) ? Spacing.lg : Spacing['2xl'],
    paddingVertical: (isSmallScreen || isMobile) ? Spacing.lg : Spacing.xl,
    gap: (isSmallScreen || isMobile) ? Spacing.md : Spacing.sm, // Consistent gap on mobile
    alignItems: "stretch", // Stretch buttons to full width on mobile
    justifyContent: "center",
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.medium,
    height: 48,
    width: (isSmallScreen || isMobile) ? "100%" : "auto", // Full width on mobile
    flex: (isSmallScreen || isMobile) ? 0 : undefined, // Don't flex on mobile
    flexShrink: 0,
    marginRight: (isSmallScreen || isMobile) ? 0 : Spacing.md,
    marginBottom: 0,
  },
  retakeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Platform.OS === 'web' ? 600 : Typography.fontWeight.semibold, // Use number for web
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  cancelButton: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    width: (isSmallScreen || isMobile) ? "100%" : "auto", // Full width on mobile
    flex: (isSmallScreen || isMobile) ? 0 : 1, // Don't flex on mobile
    marginRight: (isSmallScreen || isMobile) ? 0 : Spacing.md,
    marginBottom: 0,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Platform.OS === 'web' ? 600 : Typography.fontWeight.semibold, // Use number for web
    color: Colors.text.secondary,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  setProfileButton: {
    flex: (isSmallScreen || isMobile) ? 0 : 1.5, // Don't flex on mobile
    minWidth: (isSmallScreen || isMobile) ? 0 : 140,
    height: 48,
    width: (isSmallScreen || isMobile) ? "100%" : undefined, // Full width on mobile
  },
  errorContainer: {
    position: "absolute",
    bottom: -50,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Platform.OS === 'web' ? 500 : Typography.fontWeight.medium, // Use number for web
    color: Colors.error[500],
    textAlign: "center",
    backgroundColor: Colors.error[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error[200],
    maxWidth: "100%",
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: undefined,
    }),
    ...(Platform.OS === 'web' ? {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    } : {}),
  },
  });
};

const styles = createStyles();
