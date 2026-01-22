import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ChevronLeft, ChevronRight, MapPin, Clock, Zap } from "lucide-react-native";
import Header from "@/components/Header";

type TabType = "working" | "ot";
type DayStatus = "present" | "half" | "ot" | null;

interface DayData {
  date: number;
  status: DayStatus;
}

interface DayDetail {
  date: string;
  warehouse: string;
  ordersCompleted: number;
  shiftTime: string;
  regularHours: number;
  incentivesEarned?: number;
  overtimeHours?: number;
  otEarnings?: number;
}

const mockWorkingDaysData: DayDetail[] = [
  {
    date: "January 17, 2024",
    warehouse: "Warehouse A",
    ordersCompleted: 34,
    shiftTime: "9:30 AM - 6:30 PM",
    regularHours: 9,
    incentivesEarned: 189,
  },
  {
    date: "January 25, 2024",
    warehouse: "Warehouse A",
    ordersCompleted: 42,
    shiftTime: "9:30 AM - 6:30 PM",
    regularHours: 9,
    incentivesEarned: 220,
  },
];

const mockOTDaysData: DayDetail[] = [
  {
    date: "January 24, 2024",
    warehouse: "Warehouse B",
    ordersCompleted: 58,
    shiftTime: "9:30 AM - 6:30 PM",
    regularHours: 9,
    overtimeHours: 2.5,
    otEarnings: 313,
  },
  {
    date: "January 25, 2024",
    warehouse: "Warehouse B",
    ordersCompleted: 45,
    shiftTime: "9:30 AM - 6:30 PM",
    regularHours: 9,
    overtimeHours: 1.5,
    otEarnings: 188,
  },
];

const generateCalendarDays = (month: number, year: number, tab: TabType): DayData[] => {
  const days: DayData[] = [];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    days.push({ date: 0, status: null });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    let status: DayStatus = null;
    
    if (tab === "working") {
      if ([1, 2, 3, 4, 8, 9, 11, 15, 16, 17, 22, 24, 25].includes(i)) {
        status = "present";
      } else if ([10, 23].includes(i)) {
        status = "half";
      }
    } else {
      if ([3, 8, 15, 17, 22, 24].includes(i)) {
        status = "ot";
      }
    }
    
    days.push({ date: i, status });
  }

  return days;
};

export default function WorkHistoryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("working");
  const [selectedDate, setSelectedDate] = useState<number>(25);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(2024);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarDays = generateCalendarDays(currentMonth, currentYear, activeTab);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(0);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(0);
  };

  const handleDatePress = (date: number, status: DayStatus) => {
    if (status) {
      setSelectedDate(date);
    }
  };

  const getSelectedDayDetail = (): DayDetail | null => {
    if (!selectedDate) return null;
    
    const data = activeTab === "working" ? mockWorkingDaysData : mockOTDaysData;
    const dateStr = `${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`;
    return data.find(d => d.date === dateStr) || null;
  };

  const selectedDetail = getSelectedDayDetail();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Work History" subtitle="Track working days & overtime" />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "working" && styles.activeTab]}
          onPress={() => {
            setActiveTab("working");
            setSelectedDate(0);
          }}
        >
          <Text style={[styles.tabText, activeTab === "working" && styles.activeTabText]}>
            Working days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ot" && styles.activeTab]}
          onPress={() => {
            setActiveTab("ot");
            setSelectedDate(0);
          }}
        >
          <Text style={[styles.tabText, activeTab === "ot" && styles.activeTabText]}>
            OT days
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity style={styles.monthButton} onPress={handlePrevMonth}>
              <ChevronLeft color="#111827" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
              <ChevronRight color="#111827" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dayCell}
                onPress={() => day.date > 0 && handleDatePress(day.date, day.status)}
                disabled={!day.status}
              >
                {day.date > 0 && (
                  <>
                    <View
                      style={[
                        styles.dateCircle,
                        selectedDate === day.date && styles.selectedDateCircle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          !day.status && styles.disabledDateText,
                          selectedDate === day.date && styles.selectedDateText,
                        ]}
                      >
                        {day.date}
                      </Text>
                    </View>
                    {day.status && (
                      <View
                        style={[
                          styles.statusDot,
                          day.status === "present" && styles.presentDot,
                          day.status === "half" && styles.halfDot,
                          day.status === "ot" && styles.otDot,
                        ]}
                      />
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "working" && (
            <View style={styles.summaryCards}>
              <View style={styles.summaryCardSmall}>
                <Text style={styles.summaryNumber}>13</Text>
                <Text style={styles.summaryLabel}>Present Days</Text>
              </View>
              <View style={[styles.summaryCardSmall, styles.summaryCardYellow]}>
                <Text style={styles.summaryNumber}>2</Text>
                <Text style={styles.summaryLabel}>Half Days</Text>
              </View>
            </View>
          )}

          {activeTab === "ot" && (
            <View style={styles.summaryCards}>
              <View style={[styles.summaryCardSmall, styles.summaryCardYellow]}>
                <Text style={styles.summaryNumber}>6</Text>
                <Text style={styles.summaryLabel}>OT Days</Text>
              </View>
              <View style={[styles.summaryCardSmall, styles.summaryCardOrange]}>
                <Text style={styles.summaryNumberLarge}>12.5</Text>
                <Text style={styles.summaryLabel}>hrs</Text>
              </View>
            </View>
          )}

          <View style={[
            styles.totalCard,
            activeTab === "ot" && styles.totalCardYellow
          ]}>
            <View style={styles.totalCardContent}>
              <Clock color={activeTab === "working" ? "#8B5CF6" : "#FACC15"} size={24} strokeWidth={2} />
              <Text style={styles.totalLabel}>
                {activeTab === "working" ? "Total Hours" : "OT Earnings"}
              </Text>
            </View>
            <Text style={styles.totalValue}>
              {activeTab === "working" ? "126.0 hrs" : "₹1563"}
            </Text>
            {activeTab === "working" && (
              <Text style={styles.totalSubtext}>Worked 15 days this month</Text>
            )}
            {activeTab === "ot" && (
              <Text style={styles.totalSubtext}>At 1.25x rate • ₹125/hr</Text>
            )}
          </View>
        </View>

        {selectedDetail && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              {activeTab === "ot" && (
                <Zap color="#FACC15" size={20} strokeWidth={2} fill="#FACC15" />
              )}
              <Text style={styles.detailDate}>{selectedDetail.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <MapPin color="#8B5CF6" size={18} strokeWidth={2} />
                <Text style={styles.detailLabel}>Warehouse</Text>
              </View>
              <Text style={styles.detailValue}>{selectedDetail.warehouse}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Orders Completed</Text>
              <Text style={styles.detailValue}>{selectedDetail.ordersCompleted}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shift Time</Text>
              <Text style={styles.detailValue}>{selectedDetail.shiftTime}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Regular Hours</Text>
              <Text style={styles.detailValue}>{selectedDetail.regularHours} hrs</Text>
            </View>

            {selectedDetail.overtimeHours && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <View style={styles.detailRowLeft}>
                    <Zap color="#FACC15" size={18} strokeWidth={2} fill="#FACC15" />
                    <Text style={styles.detailLabel}>Overtime Hours</Text>
                  </View>
                  <Text style={[styles.detailValue, styles.otText]}>
                    {selectedDetail.overtimeHours} hrs
                  </Text>
                </View>
              </>
            )}

            {selectedDetail.otEarnings && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>OT Earnings</Text>
                  <Text style={[styles.detailValue, styles.earningsText]}>
                    ₹{selectedDetail.otEarnings}
                  </Text>
                </View>
              </>
            )}

            {selectedDetail.incentivesEarned && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <View style={styles.detailRowLeft}>
                    <Zap color="#10B981" size={18} strokeWidth={2} fill="#10B981" />
                    <Text style={styles.detailLabel}>Incentives Earned</Text>
                  </View>
                  <Text style={[styles.detailValue, styles.incentiveText]}>
                    ₹{selectedDetail.incentivesEarned}
                  </Text>
                </View>
              </>
            )}
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
    backgroundColor: "#F9FAFB",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#F3F4F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  activeTabText: {
    color: "#5B4EFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  monthButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#9CA3AF",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDateCircle: {
    backgroundColor: "#8B5CF6",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#111827",
  },
  disabledDateText: {
    color: "#D1D5DB",
  },
  selectedDateText: {
    color: "#FFFFFF",
    fontWeight: "700" as const,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  presentDot: {
    backgroundColor: "#10B981",
  },
  halfDot: {
    backgroundColor: "#FACC15",
  },
  otDot: {
    backgroundColor: "#FACC15",
  },
  summaryCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCardSmall: {
    flex: 1,
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  summaryCardYellow: {
    backgroundColor: "#FEF3C7",
  },
  summaryCardOrange: {
    backgroundColor: "#FFEDD5",
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#10B981",
    marginBottom: 4,
  },
  summaryNumberLarge: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#F97316",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  totalCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
  },
  totalCardYellow: {
    backgroundColor: "#FEF3C7",
  },
  totalCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: "#6B7280",
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  detailDate: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  otText: {
    color: "#FACC15",
  },
  earningsText: {
    color: "#F97316",
  },
  incentiveText: {
    color: "#10B981",
  },
  bottomSpacer: {
    height: 20,
  },
});
