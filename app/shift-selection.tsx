import React, { useState } from "react";
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, LogOut, Clock, Package, CircleDollarSign, CheckCircle2, Info } from "lucide-react-native";
import { useAuth, type ShiftSelection } from "@/state/authContext";
import PrimaryButton from "@/components/PrimaryButton";

interface AvailableShift {
  id: string;
  name: string;
  time: string;
  duration: string;
  orders: number;
  basePay: number;
  color: string;
  limitedSpots?: boolean;
}

const AVAILABLE_SHIFTS: AvailableShift[] = [
  {
    id: "morning",
    name: "Morning Shift",
    time: "8:00 AM - 4:00 PM",
    duration: "8 hours",
    orders: 120,
    basePay: 480,
    color: "#F97316",
  },
  {
    id: "evening",
    name: "Evening Shift",
    time: "4:00 PM - 12:00 AM",
    duration: "8 hours",
    orders: 95,
    basePay: 520,
    color: "#8B5CF6",
  },
  {
    id: "night",
    name: "Night Shift",
    time: "12:00 AM - 8:00 AM",
    duration: "8 hours",
    orders: 70,
    basePay: 600,
    color: "#3B82F6",
    limitedSpots: true,
  },
];

export default function ShiftSelectionScreen() {
  const router = useRouter();
  const { selectedShifts, setSelectedShifts, locationType, completeSetup, logout } = useAuth();
  const [localSelectedShifts, setLocalSelectedShifts] = useState<ShiftSelection[]>(selectedShifts);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const toggleShift = (shift: AvailableShift) => {
    const isSelected = localSelectedShifts.some(s => s.id === shift.id);
    
    if (isSelected) {
      setLocalSelectedShifts([]);
    } else {
      // Only allow one shift at a time
      setLocalSelectedShifts([{
        id: shift.id,
        name: shift.name,
        time: shift.time,
      }]);
    }
  };

  const handleContinue = async () => {
    if (localSelectedShifts.length === 1) {
      setLoading(true);
      await setSelectedShifts(localSelectedShifts);
      await completeSetup();
      setLoading(false);
      router.replace("/get-started" as any);
    }
  };

  const isShiftSelected = (shiftId: string) => {
    return localSelectedShifts.some(s => s.id === shiftId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="#111827" size={28} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Shift</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <LogOut color="#6B7280" size={24} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Select Your Shift</Text>
          <Text style={styles.subtitle}>
            Padur {locationType === "darkstore" ? "Darkstore" : "Warehouse"} • Walk-in Available
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Info color="#6366F1" size={20} strokeWidth={2} />
          </View>
          <Text style={styles.infoText}>
            Select one shift to continue. You can change your preferences later.
          </Text>
        </View>

        <View style={styles.shiftsContainer}>
          {AVAILABLE_SHIFTS.map((shift) => {
            const isSelected = isShiftSelected(shift.id);
            
            return (
              <TouchableOpacity
                key={shift.id}
                style={[
                  styles.shiftCard,
                  isSelected && styles.shiftCardSelected,
                ]}
                onPress={() => toggleShift(shift)}
                activeOpacity={0.7}
              >
                <View style={styles.shiftHeader}>
                  <View style={[styles.shiftIcon, { backgroundColor: shift.color }]}>
                    <Clock color="#FFFFFF" size={24} strokeWidth={2.5} />
                  </View>
                  <View style={styles.shiftTitleContainer}>
                    <Text style={[styles.shiftName, isSelected && styles.shiftNameSelected]}>
                      {shift.name}
                    </Text>
                    <Text style={[styles.shiftTime, isSelected && styles.shiftTimeSelected]}>
                      {shift.time}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkboxContainer,
                    isSelected && styles.checkboxContainerSelected
                  ]}>
                    {isSelected && (
                      <CheckCircle2 color="#6366F1" size={24} strokeWidth={2.5} fill="#6366F1" />
                    )}
                  </View>
                </View>

                <View style={styles.shiftDetails}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, isSelected && styles.detailLabelSelected]}>
                      Duration
                    </Text>
                    <Text style={[styles.detailValue, isSelected && styles.detailValueSelected]}>
                      {shift.duration}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, isSelected && styles.detailLabelSelected]}>
                      Orders
                    </Text>
                    <Text style={[styles.detailValue, isSelected && styles.detailValueSelected]}>
                      {shift.orders}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, isSelected && styles.detailLabelSelected]}>
                      Base Pay
                    </Text>
                    <Text style={[styles.detailValue, isSelected && styles.detailValueSelected]}>
                      ₹{shift.basePay}
                    </Text>
                  </View>
                </View>

              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.walkinCard}>
          <View style={styles.walkinIcon}>
            <Package color="#3B82F6" size={20} strokeWidth={2} />
          </View>
          <View style={styles.walkinContent}>
            <Text style={styles.walkinTitle}>Walk-in Flexibility</Text>
            <Text style={styles.walkinText}>
              You can arrive up to 15 minutes before or after shift start time. Payment calculated based on actual hours worked.
            </Text>
          </View>
        </View>

        {localSelectedShifts.length === 1 && (
          <View style={styles.confirmationCard}>
            <View style={styles.confirmationHeader}>
              <CircleDollarSign color="#10B981" size={24} strokeWidth={2} />
              <Text style={styles.confirmationTitle}>CONFIRM SHIFT</Text>
            </View>
            <Text style={styles.confirmationSubtitle}>
              {localSelectedShifts[0].name} • {localSelectedShifts[0].time}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={localSelectedShifts.length === 1 ? "Confirm Shift" : "Select a Shift"}
          onPress={handleContinue}
          disabled={localSelectedShifts.length !== 1}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
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
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#4F46E5",
    lineHeight: 18,
  },
  shiftsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  shiftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  shiftCardSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#F5F3FF",
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  shiftIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  shiftTitleContainer: {
    flex: 1,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  shiftNameSelected: {
    color: "#4F46E5",
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  shiftTimeSelected: {
    color: "#6366F1",
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainerSelected: {
    borderColor: "transparent",
  },
  shiftDetails: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    gap: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  detailLabelSelected: {
    color: "#818CF8",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  detailValueSelected: {
    color: "#4F46E5",
  },
  limitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  limitedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
    marginRight: 8,
  },
  limitedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F97316",
  },
  walkinCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  walkinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  walkinContent: {
    flex: 1,
  },
  walkinTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  walkinText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3B82F6",
    lineHeight: 18,
  },
  confirmationCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  confirmationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  confirmationSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  bottomSpacer: {
    height: 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
});
