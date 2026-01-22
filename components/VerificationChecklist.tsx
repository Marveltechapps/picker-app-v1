import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, X } from "lucide-react-native";

export interface ChecklistItem {
  label: string;
  status: boolean;
}

interface VerificationChecklistProps {
  items: ChecklistItem[];
}

export default function VerificationChecklist({ items }: VerificationChecklistProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <View style={[styles.iconContainer, item.status && styles.iconContainerActive]}>
            {item.status ? (
              <Check color="#10B981" size={18} strokeWidth={2.5} />
            ) : (
              <X color="#EF4444" size={18} strokeWidth={2.5} />
            )}
          </View>
          <Text style={[styles.label, item.status && styles.labelActive]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "#D1FAE5",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  labelActive: {
    color: "#111827",
    fontWeight: "600",
  },
});
