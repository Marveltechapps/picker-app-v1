import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, Image } from "react-native";
import { MapPin, Bell, Calendar, Zap, Package, DollarSign, Target, Info, User } from "lucide-react-native";
import { router } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius, Shadows, IconSizes } from "@/constants/theme";
import LocationVerifySheet from "@/components/LocationVerifySheet";
import IdentityVerifySheet from "@/components/IdentityVerifySheet";
import FaceVerifySheet from "@/components/FaceVerifySheet";
import FingerprintVerifySheet from "@/components/FingerprintVerifySheet";
import ShiftSuccessSheet from "@/components/ShiftSuccessSheet";
import { useAuth } from "@/state/authContext";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { selectedShifts, shiftActive, shiftStartTime, startShift, endShift, userProfile, phoneNumber } = useAuth();
  const [showLocationVerify, setShowLocationVerify] = useState(false);
  const [showIdentityVerify, setShowIdentityVerify] = useState(false);
  const [showFaceVerify, setShowFaceVerify] = useState(false);
  const [showFingerprintVerify, setShowFingerprintVerify] = useState(false);
  const [showShiftSuccess, setShowShiftSuccess] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"face" | "fingerprint">("face");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (shiftActive && shiftStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - shiftStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [shiftActive, shiftStartTime]);

  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartShiftNew = () => {
    setShowLocationVerify(true);
  };

  const handleLocationVerifySuccess = () => {
    setShowLocationVerify(false);
    setTimeout(() => {
      setShowIdentityVerify(true);
    }, 300);
  };

  const handleIdentityMethodSelect = (method: "face" | "fingerprint") => {
    setVerificationMethod(method);
    setShowIdentityVerify(false);
    setTimeout(() => {
      if (method === "face") {
        setShowFaceVerify(true);
      } else {
        setShowFingerprintVerify(true);
      }
    }, 300);
  };

  const handleVerificationSuccess = () => {
    setShowFaceVerify(false);
    setShowFingerprintVerify(false);
    setTimeout(() => {
      setShowShiftSuccess(true);
    }, 300);
  };

  const handleStartWork = () => {
    startShift();
    setShowShiftSuccess(false);
  };

  const handleCheckOut = () => {
    endShift();
    setElapsedTime(0);
  };

  const handleCloseSheet = () => {
    setShowLocationVerify(false);
    setShowIdentityVerify(false);
    setShowFaceVerify(false);
    setShowFingerprintVerify(false);
    setShowShiftSuccess(false);
  };

  const shiftTime = selectedShifts.length >= 2 
    ? `${selectedShifts[0].time.split(" - ")[0]} - ${selectedShifts[1].time.split(" - ")[1]}`
    : "9:00 AM - 6:00 PM";

  const weeklyData = [
    { day: "Mon", value: 520 },
    { day: "Tue", value: 650 },
    { day: "Wed", value: 580 },
    { day: "Thu", value: 720 },
    { day: "Fri", value: 680 },
    { day: "Sat", value: 850 },
  ];

  const maxValue = Math.max(...weeklyData.map(d => d.value));
  const chartHeight = 200;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {userProfile?.photoUri ? (
            <Image source={{ uri: userProfile.photoUri }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileIcon}>
              <User color={Colors.primary[600]} size={IconSizes.md} strokeWidth={2.5} />
            </View>
          )}
          <View>
            <Text style={styles.headerTitle}>{userProfile?.name?.trim() || "User"}</Text>
            <Text style={styles.headerSubtitle}>ID: {phoneNumber ? phoneNumber.slice(-6) : "------"}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Zap color={Colors.secondary[400]} size={IconSizes.md} strokeWidth={2} fill={Colors.secondary[400]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon} 
            onPress={() => {
              console.log('Notification icon pressed - navigating to /notifications');
              try {
                router.push('/notifications');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
            activeOpacity={0.7}
          >
            <Bell color={Colors.text.secondary} size={IconSizes.md} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.hubHeader}>
            <View style={styles.hubTitleRow}>
              <Text style={styles.hubTitle}>Downtown Hub</Text>
              {shiftActive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.locationIconButton}>
              <MapPin color="#9CA3AF" size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.addressText}>MG Road, Bangalore - 560001</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Target color="#10B981" size={18} strokeWidth={2} />
              <View>
                <Text style={styles.statusLabel}>Accuracy</Text>
                <Text style={styles.statusValue}>±8m</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <MapPin color="#6366F1" size={18} strokeWidth={2} />
              <View>
                <Text style={styles.statusLabel}>Status</Text>
                <Text style={styles.statusValueGreen}>At Hub</Text>
              </View>
            </View>
          </View>

          {shiftActive && (
            <>
              <View style={styles.divider} />
              <View style={styles.shiftActiveRow}>
                <View style={styles.shiftActiveLeft}>
                  <View style={styles.shiftActiveDot} />
                  <Text style={styles.shiftActiveLabel}>Shift Active</Text>
                </View>
                <View style={styles.timerContainer}>
                  <Text style={styles.clockEmoji}>⏱️</Text>
                  <Text style={styles.timerText}>{formatElapsedTime(elapsedTime)}</Text>
                </View>
              </View>
            </>
          )}

          {!shiftActive && (
            <>
              <View style={styles.divider} />
              <View style={styles.shiftRow}>
                <View style={styles.shiftLeft}>
                  <View style={styles.clockIcon}>
                    <Text style={styles.clockEmoji}>🕐</Text>
                  </View>
                  <Text style={styles.shiftLabel}>Today&apos;s Shift</Text>
                </View>
                <Text style={styles.shiftTime}>{shiftTime}</Text>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.startButton, shiftActive && styles.checkOutButton]} 
            onPress={shiftActive ? handleCheckOut : handleStartShiftNew}
          >
            <Text style={styles.startButtonText}>{shiftActive ? "CHECK OUT" : "START MY SHIFT"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ordersCard}>
          <View style={styles.ordersHeader}>
            <View style={styles.packageIconContainer}>
              <Package color="#3B82F6" size={28} strokeWidth={2} />
            </View>
            <View style={styles.ordersContent}>
              <View style={styles.ordersTop}>
                <Text style={styles.ordersMainNumber}>87</Text>
                <Text style={styles.ordersTotal}> / 100 orders</Text>
                <Text style={styles.ordersToGo}>13 orders to go</Text>
              </View>
              <Text style={styles.ordersLabel}>Orders Picked Today</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: "87%" }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.earningsCard}>
            <View style={styles.earningsIcon}>
              <DollarSign color="#FFFFFF" size={28} strokeWidth={2.5} />
            </View>
            <Text style={styles.earningsValue}>₹850</Text>
            <Text style={styles.earningsLabel}>Today&apos;s Earnings</Text>
          </View>
          <View style={styles.incentivesCard}>
            <View style={styles.incentivesIcon}>
              <Zap color="#FFFFFF" size={28} strokeWidth={2.5} fill="#FFFFFF" />
            </View>
            <Text style={styles.incentivesValue}>₹120</Text>
            <Text style={styles.incentivesLabel}>Incentives of the Day</Text>
          </View>
        </View>

        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>Performance Metrics</Text>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>Top 10%</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.performanceLabel}>Accuracy</Text>
              <Info color="#D1D5DB" size={16} strokeWidth={2} />
            </View>
            <Text style={styles.performanceValue}>98.5%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "98.5%", backgroundColor: "#10B981" }]} />
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.performanceLabel}>Speed</Text>
              <Info color="#D1D5DB" size={16} strokeWidth={2} />
            </View>
            <Text style={styles.performanceValue}>120 items/hr</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "85%", backgroundColor: "#6366F1" }]} />
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Earnings</Text>
          <Text style={styles.chartSubtitle}>Your performance this week</Text>
          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              <Text style={styles.yAxisLabel}>₹800</Text>
              <Text style={styles.yAxisLabel}>₹600</Text>
              <Text style={styles.yAxisLabel}>₹400</Text>
              <Text style={styles.yAxisLabel}>₹200</Text>
              <Text style={styles.yAxisLabel}>₹0</Text>
            </View>
            <View style={styles.chartContent}>
              <Svg width="100%" height={chartHeight} viewBox={`0 0 ${width - 120} ${chartHeight}`}>
                <Defs>
                  <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
                  </LinearGradient>
                </Defs>
                <Path
                  d={`M 0 ${chartHeight - (weeklyData[0].value / maxValue) * (chartHeight - 20)} 
                     L ${(width - 120) / 5} ${chartHeight - (weeklyData[1].value / maxValue) * (chartHeight - 20)} 
                     L ${((width - 120) / 5) * 2} ${chartHeight - (weeklyData[2].value / maxValue) * (chartHeight - 20)} 
                     L ${((width - 120) / 5) * 3} ${chartHeight - (weeklyData[3].value / maxValue) * (chartHeight - 20)} 
                     L ${((width - 120) / 5) * 4} ${chartHeight - (weeklyData[4].value / maxValue) * (chartHeight - 20)} 
                     L ${(width - 120)} ${chartHeight - (weeklyData[5].value / maxValue) * (chartHeight - 20)} 
                     L ${(width - 120)} ${chartHeight} 
                     L 0 ${chartHeight} Z`}
                  fill="url(#gradient)"
                />
                <Path
                  d={`M 0 ${chartHeight - (weeklyData[0].value / maxValue) * (chartHeight - 20)} 
                     L ${(width - 120) / 5} ${chartHeight - (weeklyData[1].value / maxValue) * (chartHeight - 20)} 
                     L ${((width - 120) / 5) * 2} ${chartHeight - (weeklyData[2].value / maxValue) * (chartHeight - 20)} 
                     L ${((width - 120) / 5) * 3} ${chartHeight - (weeklyData[3].value / maxValue) * (chartHeight - 20)} 
                     L ${((width - 120) / 5) * 4} ${chartHeight - (weeklyData[4].value / maxValue) * (chartHeight - 20)} 
                     L ${(width - 120)} ${chartHeight - (weeklyData[5].value / maxValue) * (chartHeight - 20)}`}
                  stroke="#6366F1"
                  strokeWidth="3"
                  fill="none"
                />
              </Svg>
              <View style={styles.xAxisLabels}>
                {weeklyData.map((item, index) => (
                  <Text key={index} style={styles.xAxisLabel}>{item.day}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LocationVerifySheet
        visible={showLocationVerify}
        onSuccess={handleLocationVerifySuccess}
        onClose={handleCloseSheet}
      />

      <IdentityVerifySheet
        visible={showIdentityVerify}
        onSelectMethod={handleIdentityMethodSelect}
        onClose={handleCloseSheet}
        onBack={() => {
          setShowIdentityVerify(false);
          setTimeout(() => {
            setShowLocationVerify(true);
          }, 300);
        }}
      />

      <FaceVerifySheet
        visible={showFaceVerify}
        onSuccess={handleVerificationSuccess}
        onClose={handleCloseSheet}
        onBack={() => {
          setShowFaceVerify(false);
          setTimeout(() => {
            setShowIdentityVerify(true);
          }, 300);
        }}
      />

      <FingerprintVerifySheet
        visible={showFingerprintVerify}
        onSuccess={handleVerificationSuccess}
        onClose={handleCloseSheet}
        onBack={() => {
          setShowFingerprintVerify(false);
          setTimeout(() => {
            setShowIdentityVerify(true);
          }, 300);
        }}
      />

      <ShiftSuccessSheet
        visible={showShiftSuccess}
        verificationMethod={verificationMethod}
        onStartWork={handleStartWork}
        onClose={handleCloseSheet}
        onBack={() => {
          setShowShiftSuccess(false);
          setTimeout(() => {
            if (verificationMethod === "face") {
              setShowFaceVerify(true);
            } else {
              setShowFingerprintVerify(true);
            }
          }, 300);
        }}
      />
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
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginTop: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  profileIcon: {
    width: Spacing['4xl'],
    height: Spacing['4xl'],
    borderRadius: Spacing.xl,
    backgroundColor: Colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: Spacing['4xl'],
    height: Spacing['4xl'],
    borderRadius: Spacing.xl,
    backgroundColor: Colors.primary[100],
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginTop: Spacing.xs / 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  hubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  hubTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  hubTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius['xs-sm'],
    gap: Spacing.xs,
  },
  liveDot: {
    width: Spacing['xs-sm'],
    height: Spacing['xs-sm'],
    borderRadius: Spacing['xs-sm'] / 2,
    backgroundColor: Colors.success[400],
  },
  liveText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success[400],
  },
  locationIconButton: {
    width: Spacing['4xl'],
    height: Spacing['4xl'],
    borderRadius: Spacing.xl,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
  },
  statusValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  statusValueGreen: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success[400],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginBottom: Spacing.lg,
  },
  shiftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  shiftLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  clockIcon: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Spacing.lg,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  clockEmoji: {
    fontSize: Typography.fontSize.lg,
  },
  shiftLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  shiftTime: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  checkOutButton: {
    backgroundColor: Colors.error[400],
  },
  shiftActiveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.success[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  shiftActiveLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  shiftActiveDot: {
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: BorderRadius['xs-sm'],
    backgroundColor: Colors.success[400],
  },
  shiftActiveLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success[400],
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  timerText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
    fontVariant: ["tabular-nums"],
  },
  startButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    letterSpacing: Typography.letterSpacing.wider,
  },
  ordersCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  ordersHeader: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  packageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.info[50],
    alignItems: "center",
    justifyContent: "center",
  },
  ordersContent: {
    flex: 1,
  },
  ordersTop: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.xs,
  },
  ordersMainNumber: {
    fontSize: Typography.fontSize['5xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  ordersTotal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  ordersToGo: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
    marginLeft: "auto",
  },
  ordersLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  progressBarContainer: {
    height: Spacing.sm,
    backgroundColor: Colors.border.light,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.xs,
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  earningsIcon: {
    width: Spacing['5xl'],
    height: Spacing['5xl'],
    borderRadius: Spacing['2xl'],
    backgroundColor: Colors.secondary[200],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  earningsValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  earningsLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  incentivesCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  incentivesIcon: {
    width: Spacing['5xl'],
    height: Spacing['5xl'],
    borderRadius: Spacing['2xl'],
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  incentivesValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  incentivesLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  performanceCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  performanceTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  topBadge: {
    backgroundColor: Colors.success[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  topBadgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success[400],
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing['xs-sm'],
  },
  performanceLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  performanceValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  progressBar: {
    height: Spacing.sm,
    backgroundColor: Colors.border.light,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.xs,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  chartTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  chartSubtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    flexDirection: "row",
    height: 240,
  },
  yAxisLabels: {
    justifyContent: "space-between",
    paddingRight: Spacing.sm,
    paddingVertical: Spacing['sm-md'],
  },
  yAxisLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
  },
  chartContent: {
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginTop: Spacing.sm,
  },
  xAxisLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
  },
  autoOtpOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  autoOtpContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['4xl'],
    alignItems: "center",
    width: width - Spacing['6xl'],
  },
  autoOtpIcon: {
    width: 80,
    height: 80,
    borderRadius: Spacing['4xl'],
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  autoOtpIconText: {
    fontSize: Spacing['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  autoOtpTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  autoOtpCountdown: {
    fontSize: Typography.fontSize['7xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
    marginBottom: Spacing.md,
  },
  autoOtpGenerated: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  bottomSpacer: {
    height: 100,
  },
});
