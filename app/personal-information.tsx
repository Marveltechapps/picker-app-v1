import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Phone, Mail, Calendar } from "lucide-react-native";
import { useAuth } from "@/state/authContext";
import Header from "@/components/Header";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";

export default function PersonalInformationScreen() {
  const { phoneNumber } = useAuth();

  const infoCards = [
    {
      icon: Phone,
      label: "Phone",
      value: phoneNumber || "+91 98765 43210",
      bgColor: "#DCFCE7",
      iconColor: "#10B981",
    },
    {
      icon: Mail,
      label: "Email",
      value: "arjun.kumar@pickerapp.com",
      bgColor: "#FEF3C7",
      iconColor: "#FACC15",
    },
    {
      icon: Calendar,
      label: "Joining Date",
      value: "Dec 15, 2023",
      bgColor: "#FFEDD5",
      iconColor: "#F97316",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Personal Information" subtitle="Contact details & location" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {infoCards.map((card, index) => (
          <View key={index} style={[styles.infoCard, index === 0 && styles.firstCard]}>
            <View style={[styles.iconWrapper, { backgroundColor: card.bgColor }]}>
              <card.icon color={card.iconColor} size={24} strokeWidth={2} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{card.label}</Text>
              <Text style={styles.infoValue}>{card.value}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.editButtonDisabled}
          activeOpacity={1}
          disabled={true}
        >
          <Text style={styles.editButtonText}>Edit Information</Text>
        </TouchableOpacity>
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
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  firstCard: {
    marginTop: 20,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  editButtonDisabled: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    opacity: 0.4,
  },
  editButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
});
