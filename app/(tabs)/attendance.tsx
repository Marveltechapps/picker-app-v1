import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";
import { Bell, FileText, Zap, Calendar as CalendarIcon, Clock, MapPin, Package, TrendingUp, X } from "lucide-react-native";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

type TabType = "details" | "ot" | "history";

interface OTWeekData {
  week: string;
  dateRange: string;
  hours: number;
  earnings: number;
}

interface OTMonthData {
  [key: string]: OTWeekData[];
}

interface DayDetails {
  punchIn: string;
  punchOut: string;
  totalHours: number;
  warehouse: string;
  orders: number;
  incentive: number;
  overtime: number | null;
  status: "present" | "half-day" | "absent";
}

interface HistoryData {
  [date: string]: DayDetails;
}

export default function AttendanceScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [selectedMonth] = useState("January");
  const [selectedYear] = useState(2026);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = () => {
    const punchInTime = new Date();
    punchInTime.setHours(9, 28, 0);
    const diff = currentTime.getTime() - punchInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const otData: OTMonthData = {
    "January-2026": [
      { week: "Week 1", dateRange: "Jan 1-7", hours: 1.5, earnings: 188 },
      { week: "Week 2", dateRange: "Jan 8-14", hours: 3, earnings: 375 },
      { week: "Week 3", dateRange: "Jan 15-21", hours: 2.5, earnings: 313 },
      { week: "Week 4", dateRange: "Jan 22-28", hours: 1, earnings: 125 },
    ],
    "October-2025": [],
  };

  const historyData: HistoryData = {
    "2024-01-01": { punchIn: "9:15 AM", punchOut: "6:20 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 52, incentive: 420, overtime: null, status: "present" },
    "2024-01-02": { punchIn: "9:20 AM", punchOut: "6:15 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 48, incentive: 380, overtime: null, status: "present" },
    "2024-01-03": { punchIn: "9:10 AM", punchOut: "6:25 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 56, incentive: 460, overtime: null, status: "present" },
    "2024-01-04": { punchIn: "9:25 AM", punchOut: "6:10 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 50, incentive: 400, overtime: null, status: "present" },
    "2024-01-05": { punchIn: "9:05 AM", punchOut: "8:15 PM", totalHours: 11, warehouse: "Mumbai Central", orders: 62, incentive: 520, overtime: 2, status: "present" },
    "2024-01-08": { punchIn: "9:18 AM", punchOut: "6:22 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 51, incentive: 410, overtime: null, status: "present" },
    "2024-01-09": { punchIn: "9:12 AM", punchOut: "6:18 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 49, incentive: 390, overtime: null, status: "present" },
    "2024-01-10": { punchIn: "9:22 AM", punchOut: "2:30 PM", totalHours: 5, warehouse: "Mumbai Central", orders: 28, incentive: 200, overtime: null, status: "half-day" },
    "2024-01-11": { punchIn: "9:08 AM", punchOut: "6:12 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 53, incentive: 430, overtime: null, status: "present" },
    "2024-01-12": { punchIn: "9:15 AM", punchOut: "8:20 PM", totalHours: 11, warehouse: "Mumbai Central", orders: 64, incentive: 540, overtime: 2, status: "present" },
    "2024-01-15": { punchIn: "9:20 AM", punchOut: "6:25 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 50, incentive: 400, overtime: null, status: "present" },
    "2024-01-17": { punchIn: "9:10 AM", punchOut: "6:15 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 52, incentive: 420, overtime: null, status: "present" },
    "2024-01-18": { punchIn: "9:15 AM", punchOut: "8:25 PM", totalHours: 11, warehouse: "Mumbai Central", orders: 66, incentive: 560, overtime: 2, status: "present" },
    "2024-01-19": { punchIn: "9:12 AM", punchOut: "8:18 PM", totalHours: 11, warehouse: "Mumbai Central", orders: 63, incentive: 530, overtime: 2, status: "present" },
    "2024-01-22": { punchIn: "9:18 AM", punchOut: "6:20 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 51, incentive: 410, overtime: null, status: "present" },
    "2024-01-24": { punchIn: "9:10 AM", punchOut: "6:15 PM", totalHours: 9, warehouse: "Mumbai Central", orders: 54, incentive: 440, overtime: null, status: "present" },
    "2024-01-25": { punchIn: "9:05 AM", punchOut: "8:10 PM", totalHours: 11, warehouse: "Mumbai Central", orders: 65, incentive: 550, overtime: 2, status: "present" },
  };

  const getMonthKey = () => `${selectedMonth}-${selectedYear}`;
  const currentMonthData = otData[getMonthKey()] || [];
  const totalOTHours = currentMonthData.reduce((sum, week) => sum + week.hours, 0);
  const totalOTEarnings = currentMonthData.reduce((sum, week) => sum + week.earnings, 0);

  const getDaysInMonth = (month: string, year: number) => {
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: string, year: number) => {
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
    return new Date(year, monthIndex, 1).getDay();
  };

  const getDayStatus = (day: number) => {
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(selectedMonth);
    const dateKey = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const dayData = historyData[dateKey];
    if (!dayData) return null;
    if (dayData.overtime) return "overtime";
    if (dayData.status === "half-day") return "half-day";
    return "present";
  };

  const renderDetailsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "details" && styles.tabActive]}
          onPress={() => setActiveTab("details")}
        >
          <FileText size={20} color={activeTab === "details" ? "#5B4EFF" : "#9CA3AF"} />
          <Text style={[styles.tabText, activeTab === "details" && styles.tabTextActive]}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ot" && styles.tabActive]}
          onPress={() => setActiveTab("ot")}
        >
          <Zap size={20} color={activeTab === "ot" ? "#5B4EFF" : "#9CA3AF"} />
          <Text style={[styles.tabText, activeTab === "ot" && styles.tabTextActive]}>OT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <CalendarIcon size={20} color={activeTab === "history" ? "#5B4EFF" : "#9CA3AF"} />
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.combinedStatusCard}>
        <View style={styles.combinedStatusLeft}>
          <View style={styles.combinedStatusRow}>
            <View style={styles.topGreenDot} />
            <Text style={styles.topStatusTitle}>Present</Text>
          </View>
          <View style={styles.topTimeRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.topTimeText}>9:30 AM – 6:30 PM</Text>
          </View>
          <View style={styles.topCheckRow}>
            <View style={styles.topCheckIcon}>
              <Text style={styles.topCheckMark}>✓</Text>
            </View>
            <Text style={styles.topCheckText}>Punched in on time</Text>
          </View>
          <View style={styles.topHoursSection}>
            <Text style={styles.topHoursLabel}>Hours Worked Today</Text>
            <Text style={styles.topHoursTime}>{formatElapsedTime()}</Text>
          </View>
        </View>
        <View style={styles.topStatusRight}>
          <View style={styles.topProgressCircle}>
            <Svg width={90} height={90}>
              <Circle cx={45} cy={45} r={36} stroke="#E5E7EB" strokeWidth={8} fill="none" />
              <Circle
                cx={45}
                cy={45}
                r={36}
                stroke="#8B5CF6"
                strokeWidth={8}
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36 * 0.5} ${2 * Math.PI * 36}`}
                strokeLinecap="round"
                rotation="-90"
              />
            </Svg>
            <Text style={styles.topProgressText}>50%</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Warehouse</Text>
          <Text style={styles.detailValue}>Mumbai Central</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Punch In</Text>
          <Text style={styles.detailValue}>9:28 AM</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expected Punch Out</Text>
          <Text style={styles.detailValue}>6:30 PM</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Scheduled Hours</Text>
          <Text style={styles.detailValue}>9 hrs</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={styles.activeStatus}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderOTTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "details" && styles.tabActive]}
          onPress={() => setActiveTab("details")}
        >
          <FileText size={20} color={activeTab === "details" ? "#5B4EFF" : "#9CA3AF"} />
          <Text style={[styles.tabText, activeTab === "details" && styles.tabTextActive]}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ot" && styles.tabActive]}
          onPress={() => setActiveTab("ot")}
        >
          <Zap size={20} color={activeTab === "ot" ? "#5B4EFF" : "#9CA3AF"} />
          <Text style={[styles.tabText, activeTab === "ot" && styles.tabTextActive]}>OT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <CalendarIcon size={20} color={activeTab === "history" ? "#5B4EFF" : "#9CA3AF"} />
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.combinedStatusCard}>
        <View style={styles.combinedStatusLeft}>
          <View style={styles.combinedStatusRow}>
            <View style={styles.topGreenDot} />
            <Text style={styles.topStatusTitle}>Present</Text>
          </View>
          <View style={styles.topTimeRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.topTimeText}>9:30 AM – 6:30 PM</Text>
          </View>
          <View style={styles.topCheckRow}>
            <View style={styles.topCheckIcon}>
              <Text style={styles.topCheckMark}>✓</Text>
            </View>
            <Text style={styles.topCheckText}>Punched in on time</Text>
          </View>
          <View style={styles.topHoursSection}>
            <Text style={styles.topHoursLabel}>Hours Worked Today</Text>
            <Text style={styles.topHoursTime}>{formatElapsedTime()}</Text>
          </View>
        </View>
        <View style={styles.topStatusRight}>
          <View style={styles.topProgressCircle}>
            <Svg width={90} height={90}>
              <Circle cx={45} cy={45} r={36} stroke="#E5E7EB" strokeWidth={8} fill="none" />
              <Circle
                cx={45}
                cy={45}
                r={36}
                stroke="#8B5CF6"
                strokeWidth={8}
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36 * 0.5} ${2 * Math.PI * 36}`}
                strokeLinecap="round"
                rotation="-90"
              />
            </Svg>
            <Text style={styles.topProgressText}>50%</Text>
          </View>
        </View>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity>
          <Text style={styles.monthArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{selectedMonth} {selectedYear}</Text>
        <TouchableOpacity>
          <Text style={styles.monthArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.otSummaryCard}>
        <View style={styles.otSummaryLeft}>
          <Text style={styles.otSummaryLabel}>Total OT Hours</Text>
          <Text style={styles.otSummaryHours}>{totalOTHours} hrs</Text>
          <View style={styles.otRateRow}>
            <Text style={styles.otRateLabel}>OT Rate</Text>
            <Text style={styles.otRateValue}>1.25x</Text>
          </View>
        </View>
        <View style={styles.otIconWrapper}>
          <Zap size={32} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>

      {currentMonthData.length > 0 ? (
        <>
          <Text style={styles.weeklyTitle}>Weekly Breakdown</Text>
          {currentMonthData.map((week, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.weekCard,
                selectedWeek === week.week && styles.weekCardSelected,
              ]}
              onPress={() => setSelectedWeek(selectedWeek === week.week ? null : week.week)}
            >
              <View style={styles.weekLeft}>
                <Text style={styles.weekTitle}>{week.week}</Text>
                <Text style={styles.weekRange}>{week.dateRange}</Text>
              </View>
              <View style={styles.weekRight}>
                <Text style={[styles.weekHours, selectedWeek === week.week && styles.weekHoursSelected]}>
                  {week.hours} hrs
                </Text>
                <Text style={[styles.weekEarnings, selectedWeek === week.week && styles.weekEarningsSelected]}>
                  ₹{week.earnings}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {selectedWeek && (
            <View style={styles.weekDetailsCard}>
              <View style={styles.weekDetailsHeader}>
                <Text style={styles.weekDetailsTitle}>{selectedWeek}</Text>
                <Text style={styles.weekDetailsSubtitle}>Details</Text>
              </View>
              <TouchableOpacity style={styles.weekDetailsClose} onPress={() => setSelectedWeek(null)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.weekDetailsGrid}>
                <View style={styles.weekDetailBox}>
                  <Clock size={20} color="#8B5CF6" />
                  <Text style={styles.weekDetailLabel}>OT Hours</Text>
                  <Text style={styles.weekDetailValue}>1.5</Text>
                </View>
                <View style={styles.weekDetailBox}>
                  <Zap size={20} color="#8B5CF6" />
                  <Text style={styles.weekDetailLabel}>OT Rate</Text>
                  <Text style={styles.weekDetailValue}>1.25x</Text>
                </View>
                <View style={styles.weekDetailBox}>
                  <Text style={styles.weekDetailIcon}>₹</Text>
                  <Text style={styles.weekDetailLabel}>Base Rate</Text>
                  <Text style={styles.weekDetailValue}>₹100/hr</Text>
                </View>
                <View style={[styles.weekDetailBox, styles.weekDetailBoxHighlight]}>
                  <TrendingUp size={20} color="#F59E0B" />
                  <Text style={styles.weekDetailLabel}>Earnings</Text>
                  <Text style={styles.weekDetailValue}>₹188</Text>
                </View>
              </View>
              <View style={styles.calculationBox}>
                <Text style={styles.calculationLabel}>Calculation:</Text>
                <Text style={styles.calculationText}>1.5 hrs × ₹100 × 1.25 = <Text style={styles.calculationHighlight}>₹188</Text></Text>
              </View>
            </View>
          )}

          <View style={styles.totalEarningsCard}>
            <View style={styles.totalEarningsIcon}>
              <TrendingUp size={24} color="#FFFFFF" />
            </View>
            <View style={styles.totalEarningsContent}>
              <Text style={styles.totalEarningsLabel}>Total OT Earnings</Text>
              <Text style={styles.totalEarningsValue}>₹{totalOTEarnings}</Text>
              <Text style={styles.totalEarningsMonth}>for {selectedMonth} {selectedYear}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Zap size={48} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyText}>No overtime hours recorded</Text>
          <Text style={styles.emptySubtext}>for {selectedMonth} {selectedYear}</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => {
    const daysInMonth = getDaysInMonth("January", 2024);
    const firstDay = getFirstDayOfMonth("January", 2024);
    const calendarDays: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    const presentDays = Object.values(historyData).filter(d => d.status === "present").length;
    const halfDays = Object.values(historyData).filter(d => d.status === "half-day").length;

    const monthIndex = 0;
    const selectedDateKey = selectedDate ? `2024-${(monthIndex + 1).toString().padStart(2, "0")}-${selectedDate.padStart(2, "0")}` : null;
    const selectedDayData = selectedDateKey ? historyData[selectedDateKey] : null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "details" && styles.tabActive]}
            onPress={() => setActiveTab("details")}
          >
            <FileText size={20} color={activeTab === "details" ? "#5B4EFF" : "#9CA3AF"} />
            <Text style={[styles.tabText, activeTab === "details" && styles.tabTextActive]}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ot" && styles.tabActive]}
            onPress={() => setActiveTab("ot")}
          >
            <Zap size={20} color={activeTab === "ot" ? "#5B4EFF" : "#9CA3AF"} />
            <Text style={[styles.tabText, activeTab === "ot" && styles.tabTextActive]}>OT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.tabActive]}
            onPress={() => setActiveTab("history")}
          >
            <CalendarIcon size={20} color={activeTab === "history" ? "#5B4EFF" : "#9CA3AF"} />
            <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.combinedStatusCard}>
          <View style={styles.combinedStatusLeft}>
            <View style={styles.combinedStatusRow}>
              <View style={styles.topGreenDot} />
              <Text style={styles.topStatusTitle}>Present</Text>
            </View>
            <View style={styles.topTimeRow}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.topTimeText}>9:30 AM – 6:30 PM</Text>
            </View>
            <View style={styles.topCheckRow}>
              <View style={styles.topCheckIcon}>
                <Text style={styles.topCheckMark}>✓</Text>
              </View>
              <Text style={styles.topCheckText}>Punched in on time</Text>
            </View>
            <View style={styles.topHoursSection}>
              <Text style={styles.topHoursLabel}>Hours Worked Today</Text>
              <Text style={styles.topHoursTime}>{formatElapsedTime()}</Text>
            </View>
          </View>
          <View style={styles.topStatusRight}>
            <View style={styles.topProgressCircle}>
              <Svg width={90} height={90}>
                <Circle cx={45} cy={45} r={36} stroke="#E5E7EB" strokeWidth={8} fill="none" />
                <Circle
                  cx={45}
                  cy={45}
                  r={36}
                  stroke="#8B5CF6"
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36 * 0.5} ${2 * Math.PI * 36}`}
                  strokeLinecap="round"
                  rotation="-90"
                />
              </Svg>
              <Text style={styles.topProgressText}>50%</Text>
            </View>
          </View>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity>
            <Text style={styles.monthArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>January 2024</Text>
          <TouchableOpacity>
            <Text style={styles.monthArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          <View style={styles.weekDaysRow}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.calendarWeek}>
              {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                const status = day ? getDayStatus(day) : null;
                const isSelected = day && selectedDate === day.toString();
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={styles.calendarDay}
                    onPress={() => day && setSelectedDate(day.toString())}
                    disabled={!day}
                  >
                    {day ? (
                      <>
                        <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                          <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                        </View>
                        {status && (
                          <View
                            style={[
                              styles.dayDot,
                              status === "present" && styles.dayDotPresent,
                              status === "half-day" && styles.dayDotHalfDay,
                              status === "overtime" && styles.dayDotOvertime,
                            ]}
                          />
                        )}
                      </>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.summaryCards}>
          <View style={styles.summaryCardGreen}>
            <Text style={styles.summaryNumber}>{presentDays}</Text>
            <Text style={styles.summaryLabel}>Present Days</Text>
          </View>
          <View style={styles.summaryCardYellow}>
            <Text style={styles.summaryNumber}>{halfDays}</Text>
            <Text style={styles.summaryLabel}>Half Days</Text>
          </View>
        </View>

        <Modal
          visible={!!selectedDate && !!selectedDayData}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDate(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dayDetailsModal}>
              <View style={styles.dayDetailsHeader}>
                <View>
                  <Text style={styles.dayDetailsTitle}>January {selectedDate}</Text>
                  <Text style={styles.dayDetailsSubtitle}>Attendance Details</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {selectedDayData && (
                <>
                  <View style={styles.workHoursSection}>
                    <View style={styles.workHoursHeader}>
                      <Clock size={20} color="#8B5CF6" />
                      <Text style={styles.workHoursTitle}>Work Hours</Text>
                    </View>
                    <View style={styles.workHoursGrid}>
                      <View style={styles.workHoursCol}>
                        <Text style={styles.workHoursLabel}>Punch In</Text>
                        <Text style={styles.workHoursValue}>{selectedDayData.punchIn}</Text>
                      </View>
                      <View style={styles.workHoursCol}>
                        <Text style={styles.workHoursLabel}>Punch Out</Text>
                        <Text style={styles.workHoursValue}>{selectedDayData.punchOut}</Text>
                      </View>
                    </View>
                    <View style={styles.totalHoursBox}>
                      <Text style={styles.totalHoursLabel}>Total Hours</Text>
                      <Text style={styles.totalHoursValue}>{selectedDayData.totalHours} hrs</Text>
                    </View>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailsGridItem}>
                      <View style={styles.detailsIconBlue}>
                        <MapPin size={20} color="#3B82F6" />
                      </View>
                      <Text style={styles.detailsGridLabel}>Warehouse</Text>
                      <Text style={styles.detailsGridValue}>{selectedDayData.warehouse}</Text>
                    </View>
                    <View style={styles.detailsGridItem}>
                      <View style={styles.detailsIconGreen}>
                        <Package size={20} color="#10B981" />
                      </View>
                      <Text style={styles.detailsGridLabel}>Orders</Text>
                      <Text style={styles.detailsGridValue}>{selectedDayData.orders}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailsGridItem}>
                      <View style={styles.detailsIconGreenBg}>
                        <TrendingUp size={20} color="#10B981" />
                      </View>
                      <Text style={styles.detailsGridLabel}>Incentive</Text>
                      <Text style={styles.detailsGridValue}>₹{selectedDayData.incentive}</Text>
                    </View>
                    <View style={styles.detailsGridItem}>
                      <View style={styles.detailsIconGray}>
                        <Zap size={20} color="#9CA3AF" />
                      </View>
                      <Text style={styles.detailsGridLabel}>Overtime</Text>
                      <Text style={[styles.detailsGridValue, styles.detailsGridValueGray]}>
                        {selectedDayData.overtime ? `${selectedDayData.overtime} hrs` : "None"}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.headerSubtitle}>Track your work hours</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
          <Bell size={22} color="#111827" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {activeTab === "details" && renderDetailsTab()}
      {activeTab === "ot" && renderOTTab()}
      {activeTab === "history" && renderHistoryTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  combinedStatusCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  combinedStatusLeft: {
    flex: 1,
  },
  combinedStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  topStatusCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  topStatusLeft: {
    flex: 1,
  },
  topStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  topGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  topStatusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  topTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  topTimeText: {
    fontSize: 13,
    color: "#6B7280",
  },
  topCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  topCheckIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  topCheckMark: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  topCheckText: {
    fontSize: 13,
    color: "#10B981",
  },
  topHoursSection: {
    marginTop: 4,
  },
  topHoursLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  topHoursTime: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  topStatusRight: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  topProgressCircle: {
    position: "relative" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  topProgressText: {
    position: "absolute" as const,
    fontSize: 16,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 32,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  },
  notificationDot: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 0,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#5B4EFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#5B4EFF",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusLeft: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  checkText: {
    fontSize: 14,
    color: "#10B981",
  },
  statusRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircle: {
    position: "relative" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    position: "absolute" as const,
    fontSize: 18,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  hoursCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  hoursLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  hoursTime: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111827",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  activeStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  activeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  monthArrow: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  otSummaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EDE9FE",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  otSummaryLeft: {
    flex: 1,
  },
  otSummaryLabel: {
    fontSize: 14,
    color: "#7C3AED",
    marginBottom: 8,
  },
  otSummaryHours: {
    fontSize: 32,
    fontWeight: "700",
    color: "#5B21B6",
    marginBottom: 12,
  },
  otRateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#C4B5FD",
  },
  otRateLabel: {
    fontSize: 14,
    color: "#7C3AED",
  },
  otRateValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B21B6",
  },
  otIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#5B4EFF",
    alignItems: "center",
    justifyContent: "center",
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  weekCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  weekCardSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  weekLeft: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  weekRange: {
    fontSize: 12,
    color: "#6B7280",
  },
  weekRight: {
    alignItems: "flex-end",
  },
  weekHours: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B4EFF",
    marginBottom: 4,
  },
  weekHoursSelected: {
    color: "#F59E0B",
  },
  weekEarnings: {
    fontSize: 12,
    color: "#6B7280",
  },
  weekEarningsSelected: {
    color: "#92400E",
  },
  weekDetailsCard: {
    backgroundColor: "#5B4EFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: "relative" as const,
  },
  weekDetailsHeader: {
    marginBottom: 16,
  },
  weekDetailsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  weekDetailsSubtitle: {
    fontSize: 16,
    color: "#C7D2FE",
  },
  weekDetailsClose: {
    position: "absolute" as const,
    top: 20,
    right: 20,
  },
  weekDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  weekDetailBox: {
    width: (width - 92) / 2, // Account for card padding (40px), screen padding (40px), and gap (12px)
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  weekDetailBoxHighlight: {
    backgroundColor: "#FEF3C7",
  },
  weekDetailIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8B5CF6",
    marginBottom: 4,
  },
  weekDetailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 4,
  },
  weekDetailValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  calculationBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
  },
  calculationLabel: {
    fontSize: 12,
    color: "#C7D2FE",
    marginBottom: 4,
  },
  calculationText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  calculationHighlight: {
    fontWeight: "700",
    color: "#FDE047",
  },
  totalEarningsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  totalEarningsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  totalEarningsContent: {
    flex: 1,
  },
  totalEarningsLabel: {
    fontSize: 14,
    color: "#065F46",
    marginBottom: 4,
  },
  totalEarningsValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 2,
  },
  totalEarningsMonth: {
    fontSize: 12,
    color: "#059669",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  calendarGrid: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  weekDayText: {
    width: (width - 72) / 7,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  calendarDay: {
    width: (width - 72) / 7,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: {
    backgroundColor: "#5B4EFF",
  },
  dayText: {
    fontSize: 14,
    color: "#111827",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dayDot: {
    position: "absolute" as const,
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayDotPresent: {
    backgroundColor: "#10B981",
  },
  dayDotHalfDay: {
    backgroundColor: "#F59E0B",
  },
  dayDotOvertime: {
    backgroundColor: "#5B4EFF",
  },
  summaryCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCardGreen: {
    flex: 1,
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 20,
  },
  summaryCardYellow: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 20,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#065F46",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  dayDetailsModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  dayDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  dayDetailsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  dayDetailsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  workHoursSection: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  workHoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  workHoursTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  workHoursGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  workHoursCol: {
    flex: 1,
  },
  workHoursLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  workHoursValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  totalHoursBox: {
    backgroundColor: "#EDE9FE",
    borderRadius: 12,
    padding: 12,
  },
  totalHoursLabel: {
    fontSize: 12,
    color: "#7C3AED",
    marginBottom: 4,
  },
  totalHoursValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5B21B6",
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  detailsGridItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  detailsIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  detailsIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  detailsIconGreenBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  detailsIconGray: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  detailsGridLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailsGridValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  detailsGridValueGray: {
    color: "#6B7280",
  },
});
