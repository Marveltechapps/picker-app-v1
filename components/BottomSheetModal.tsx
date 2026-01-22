import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { X, ChevronLeft } from "lucide-react-native";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: string;
  scrollable?: boolean;
  onBack?: () => void;
}

export default function BottomSheetModal({ 
  visible, 
  onClose, 
  title, 
  children, 
  height = "60%", 
  scrollable = false, 
  onBack 
}: BottomSheetModalProps) {
  const screenHeight = Dimensions.get("window").height;
  const heightValue = height.includes("%") ? (parseFloat(height) / 100) * screenHeight : parseFloat(height);

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable ? { showsVerticalScrollIndicator: false, style: styles.scrollContent } : { style: styles.content };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.bottomSheet, { height: heightValue }]}>
          <View style={styles.handleBar} />
          <View style={styles.header}>
            {onBack ? (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <ChevronLeft color="#111827" size={24} strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerLeft} />
            )}
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color="#6B7280" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <ContentWrapper {...contentProps}>{children}</ContentWrapper>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    width: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
