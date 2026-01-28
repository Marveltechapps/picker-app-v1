import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Clock, DollarSign, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';
import Header from '@/components/Header';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth, type Notification } from '@/state/authContext';

type NotificationType = 'payout' | 'order' | 'shift' | 'training' | 'milestone' | 'bonus' | 'update';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'payout',
    title: 'Daily Payout Processed',
    description: 'Your earnings of ₹850 for today have been credited to your account.',
    timestamp: '5 mins ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'order',
    title: 'Order Completed',
    description: 'Great job! Order #45892 has been successfully delivered.',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'shift',
    title: 'Shift Reminder',
    description: "Your evening shift starts in 30 minutes. Don't forget to punch in!",
    timestamp: '2 hours ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'training',
    title: 'New Training Module',
    description: 'A new safety training module is now available. Complete it to earn bonus points.',
    timestamp: '3 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'milestone',
    title: 'Performance Milestone',
    description: "Congratulations! You've reached the Top 10% performers this week.",
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: '6',
    type: 'bonus',
    title: 'Weekly Bonus',
    description: 'You earned a ₹500 bonus for completing 50+ orders this week!',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: '7',
    type: 'update',
    title: 'App Update Available',
    description: 'Version 2.1.0 is available with performance improvements and bug fixes.',
    timestamp: '3 days ago',
    isRead: true,
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'payout':
    case 'bonus':
      return { Icon: DollarSign, bgColor: '#FEF3C7', iconColor: '#F59E0B' };
    case 'order':
    case 'milestone':
      return { Icon: CheckCircle, bgColor: '#D1FAE5', iconColor: '#10B981' };
    case 'shift':
      return { Icon: AlertTriangle, bgColor: '#FED7AA', iconColor: '#F97316' };
    case 'training':
    case 'update':
      return { Icon: Info, bgColor: '#E0E7FF', iconColor: '#8B5CF6' };
    default:
      return { Icon: Info, bgColor: '#E0E7FF', iconColor: '#8B5CF6' };
  }
};

export default function NotificationsScreen() {
  const { notifications, setNotifications, markNotificationAsRead, markAllNotificationsAsRead, unreadCount } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Initialize notifications if empty
  useEffect(() => {
    if (notifications && notifications.length === 0) {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, [notifications, setNotifications]);

  const totalCount = notifications.length;

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Notifications" subtitle={`${unreadCount} unread`} />
      
      <View style={styles.filterContainer}>
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive
            ]}>
              All ({totalCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'unread' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[
              styles.filterText,
              filter === 'unread' && styles.filterTextActive
            ]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          onPress={handleMarkAllAsRead}
          style={styles.markAllButton}
        >
          <Text style={styles.markAllRead}>Mark all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.map((notification) => {
          const { Icon, bgColor, iconColor } = getNotificationIcon(notification.type);
          
          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.notificationCardUnread
              ]}
              onPress={() => handleMarkAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Icon size={24} color={iconColor} />
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationDescription}>
                  {notification.description}
                </Text>
                <View style={styles.timestampRow}>
                  <Clock size={12} color="#9CA3AF" />
                  <Text style={styles.timestamp}>{notification.timestamp}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    flex: 1,
  },
  markAllButton: {
    padding: Spacing.sm,
  },
  markAllRead: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  filterButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  filterText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  notificationCardUnread: {
    borderColor: Colors.primary[500],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginLeft: 8,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});