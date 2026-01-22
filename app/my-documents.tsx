import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { FileText, Eye } from "lucide-react-native";
import { useAuth } from "@/state/authContext";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";

interface DocumentItem {
  id: string;
  title: string;
  verified: boolean;
}

export default function MyDocumentsScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const { documentUploads, resetAll } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const aadharUploaded = documentUploads.aadhar.front !== null && documentUploads.aadhar.back !== null;
  const panUploaded = documentUploads.pan.front !== null && documentUploads.pan.back !== null;

  const documents: DocumentItem[] = [
    {
      id: 'aadhar',
      title: 'Aadhar Card',
      verified: aadharUploaded,
    },
    {
      id: 'pan',
      title: 'PAN Card',
      verified: panUploaded,
    },
  ];

  const verifiedCount = documents.filter(doc => doc.verified).length;
  const bothVerified = aadharUploaded && panUploaded;

  const handleViewDocument = (docId: string) => {
    if (docId === 'aadhar') {
      router.push('/document-detail?docType=aadhar');
    } else if (docId === 'pan') {
      router.push('/document-detail?docType=pan');
    }
  };

  const handleLogout = async () => {
    console.log("Logging out and resetting all data...");
    setLoading(true);
    await resetAll();
    setLoading(false);
    router.replace("/permissions");
  };

  const handleContinue = async () => {
    if (bothVerified) {
      setLoading(true);
      // Navigate to training screen
      setLoading(false);
      router.replace("/training");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title="Documents"
        subtitle="View your uploaded documents"
        showBack={canGoBack}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.documentsContainer}>
          {documents.map((doc) => (
            <TouchableOpacity 
              key={doc.id} 
              style={styles.documentCard}
              onPress={() => handleViewDocument(doc.id)}
              activeOpacity={0.7}
            >
              <View style={styles.documentLeft}>
                <View style={styles.iconContainer}>
                  <FileText color={Colors.error[400]} size={28} strokeWidth={2} />
                </View>
                <View style={styles.documentInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.documentTitle}>{doc.title}</Text>
                    {doc.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.documentDate}>Verified</Text>
                </View>
              </View>
              {doc.verified && (
                <View style={styles.viewButton}>
                  <Eye color={Colors.white} size={18} strokeWidth={2} />
                  <Text style={styles.viewButtonText}>View</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.guidelinesContainer}>
          <View style={styles.guidelinesHeader}>
            <FileText color={Colors.text.secondary} size={20} strokeWidth={2} />
            <Text style={styles.guidelinesTitle}>Document Guidelines</Text>
          </View>
          <View style={styles.guidelinesList}>
            <Text style={styles.guidelineText}>Upload clear, readable copies of documents</Text>
            <Text style={styles.guidelineText}>Ensure all details are visible</Text>
            <Text style={styles.guidelineText}>Verification takes 24-48 hours</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {bothVerified && (
        <View style={styles.buttonContainer}>
          <PrimaryButton 
            title="Continue to Training" 
            onPress={handleContinue} 
            loading={loading}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Spacing.xl,
    paddingBottom: 20,
  },
  documentsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  documentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  documentTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  verifiedBadge: {
    width: Spacing.xl,
    height: Spacing.xl,
    borderRadius: Spacing.xl / 2,
    backgroundColor: Colors.success[400],
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  documentDate: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing['xs-sm'],
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  viewButtonText: {
    fontSize: Typography.fontSize['md-lg'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
  guidelinesContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  guidelinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  guidelinesTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  guidelinesList: {
    gap: Spacing.sm,
  },
  guidelineText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.md,
  },
  bottomSpacer: {
    height: 100,
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
    ...Shadows.md,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
});


