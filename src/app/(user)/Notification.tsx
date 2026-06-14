import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '@/redux/notification/notificationApi';
import { Notification as NotificationItem } from '@/types';
import { getRelativeTime } from '@/utils/dateFormatter';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import Header from '@components/common/Header';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { colors } from '@theme/index';

interface ConfigItem {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

const NOTIFICATION_CONFIG: Record<string, ConfigItem> = {
  review_received: {
    icon: 'star',
    iconColor: colors.light.warning,
    iconBg: colors.light.warningBackground,
  },
  buyer_marked_completed: {
    icon: 'checkmark-circle',
    iconColor: colors.light.success,
    iconBg: colors.light.successBackground,
  },
  order_requested: {
    icon: 'cart',
    iconColor: colors.light.success,
    iconBg: colors.light.infoBackground,
  },
  default: {
    icon: 'notifications',
    iconColor: colors.light.subText,
    iconBg: colors.light.altBorder,
  },
};

interface GroupedNotifications {
  Today: NotificationItem[];
  Earlier: NotificationItem[];
}

const groupNotifications = (items: NotificationItem[]): GroupedNotifications => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups: GroupedNotifications = {
    Today: [],
    Earlier: [],
  };

  items.forEach((item) => {
    const itemDate = new Date(item.createdAt);
    if (itemDate >= today) {
      groups.Today.push(item);
    } else {
      groups.Earlier.push(item);
    }
  });

  return groups;
};

export default function Notification() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: notifications = [], isLoading, isError, refetch } = useGetNotificationsQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // ─── Refetch every time the screen comes into focus ───────────────────────
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // ─── Pull-to-refresh handler ──────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [markAllAsRead]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        // Navigate instantly for better UX
        router.push({
          pathname: '/(user)/NotificationDetail',
          params: { id },
        });

        // Perform mark as read in background (optimistic update handles UI color)
        await markAsRead(id).unwrap();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [router, markAsRead],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id).unwrap();
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    [deleteNotification],
  );

  const groupedNotifications = useMemo(() => groupNotifications(notifications), [notifications]);
  const groupNames = ['Today', 'Earlier'];

  return (
    <ScreenWrapper withTopInset={false} backgroundColor={colors.light.background}>
      <Header
        title="Notifications"
        showBackButton={true}
        onBackPress={() => router.back()}
        isRightIconVisible={unreadCount > 0}
        rightIcon="checkmark-done"
        rightIconSize={20}
        rightIconColor={colors.light.primary}
        onRightIconPress={handleMarkAllRead}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.light.primary]}
            tintColor={colors.light.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <AppLoadingAnimation visible={true} message="Syncing notifications..." />
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.light.danger} />
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.8 },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Tap to Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {unreadCount > 0 && (
              <View style={styles.summaryBanner}>
                <Ionicons name="notifications" size={14} color={colors.light.primary} />
                <Text style={styles.summaryText}>
                  You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {groupNames.map((group) => {
              const items = groupedNotifications[group as keyof GroupedNotifications];
              if (!items || items.length === 0) return null;

              return (
                <View key={group}>
                  <Text style={styles.groupLabel}>{group}</Text>

                  {items.map((item) => {
                    const config = NOTIFICATION_CONFIG[item.type] || NOTIFICATION_CONFIG.default;
                    return (
                      <Pressable
                        key={item.id}
                        style={({ pressed }) => [
                          styles.card,
                          !item.isRead && styles.cardUnread,
                          Platform.OS === 'ios' && pressed && { opacity: 0.95 },
                        ]}
                        android_ripple={{ color: colors.light.border }}
                        onPress={() => handleMarkRead(item.id)}
                      >
                        <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
                          <Ionicons name={config.icon} size={20} color={config.iconColor} />
                        </View>

                        <View style={styles.cardContent}>
                          <View style={styles.cardTitleRow}>
                            <Text
                              style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                            <View style={styles.cardActions}>
                              {!item.isRead && <View style={styles.unreadDot} />}
                              <Pressable
                                style={({ pressed }) => [
                                  styles.deleteBtn,
                                  Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                                ]}
                                onPress={() => handleDelete(item.id)}
                                hitSlop={8}
                                android_ripple={{
                                  color: colors.light.border,
                                  borderless: true,
                                  radius: 20,
                                }}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={15}
                                  color={colors.light.mutedText}
                                />
                              </Pressable>
                            </View>
                          </View>
                          <Text style={styles.cardDescription} numberOfLines={2}>
                            {item.body}
                          </Text>
                          <Text style={styles.cardTime}>{getRelativeTime(item.createdAt)}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}

            {notifications.length === 0 && (
              <View style={styles.emptyContent}>
                <Ionicons name="notifications-off-outline" size={64} color={colors.light.border} />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySubtitle}>
                  {"You'll be notified here about updates to your services and orders."}
                </Text>
              </View>
            )}

            {notifications.length > 0 && unreadCount === 0 && (
              <View style={styles.allReadBanner}>
                <Ionicons name="checkmark-circle" size={16} color={colors.light.primary} />
                <Text style={styles.allReadText}>All caught up!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Summary banner
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.light.successBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  summaryText: {
    fontSize: 13,
    color: colors.light.primary,
    fontWeight: '600',
  },

  // Group label
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.subText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 2,
  },

  // Notification card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.light.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 12,
  },
  cardUnread: {
    borderColor: colors.light.success + '40', // Semi-transparent success
    backgroundColor: colors.light.successBackground,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  deleteBtn: {
    padding: 2,
  },
  cardTitleUnread: {
    color: colors.light.text,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.primary,
    marginLeft: 8,
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.light.subText,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 11,
    color: colors.light.mutedText,
    fontWeight: '500',
  },

  // All read
  allReadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
    opacity: 0.6,
  },
  allReadText: {
    fontSize: 14,
    color: colors.light.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  errorContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.light.success,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.light.surface,
    fontWeight: '600',
  },
  emptyContent: {
    paddingTop: 120,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.light.subText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
