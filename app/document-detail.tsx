import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/state/authContext";
import Header from "@/components/Header";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { CheckCircle2 } from "lucide-react-native";

export default function DocumentDetailScreen() {
  const router = useRouter();
  const { docType } = useLocalSearchParams<{ docType: string }>();
  const { documentUploads } = useAuth();
  
  const docData = docType === "aadhar" 
    ? { 
        title: "Aadhar Card", 
        front: documentUploads.aadhar.front, 
        back: documentUploads.aadhar.back 
      }
    : { 
        title: "PAN Card", 
        front: documentUploads.pan.front, 
        back: documentUploads.pan.back 
      };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={docData.title}
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/documents");
          }
        }}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {docData.front && (
          <View style={styles.imageSection}>
            <View style={styles.imageHeader}>
              <Text style={styles.sectionTitle}>Front Side</Text>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 color={Colors.success[400]} size={20} strokeWidth={2} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: docData.front }} 
                style={styles.documentImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {docData.back && (
          <View style={styles.imageSection}>
            <View style={styles.imageHeader}>
              <Text style={styles.sectionTitle}>Back Side</Text>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 color={Colors.success[400]} size={20} strokeWidth={2} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: docData.back }} 
                style={styles.documentImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  imageSection: {
    marginBottom: Spacing.xl,
  },
  imageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.success[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.success[600],
  },
  imageContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  documentImage: {
    width: "100%",
    height: 400,
    borderRadius: BorderRadius.md,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});

