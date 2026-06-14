import { useGetNotificationByIdQuery } from '@/redux/notification/notificationApi';
import { getRelativeTime } from '@/utils/dateFormatter';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import Header from '@components/common/Header';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
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
  order_completed: {
    icon: 'checkmark-done-circle',
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

export default function NotificationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: notification,
    isLoading,
    isError,
    refetch,
  } = useGetNotificationByIdQuery(id || '', {
    skip: !id,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppLoadingAnimation visible={true} message="Loading details..." />
      </View>
    );
  }

  if (isError || !notification) {
    return (
      <ScreenWrapper backgroundColor={colors.light.background}>
        <Header title="Details" showBackButton onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.light.danger} />
          <Text style={styles.errorTitle}>Notification not found</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.8 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.default;

  return (
    <ScreenWrapper withTopInset={false} backgroundColor={colors.light.background}>
      <Header title="Notification Detail" showBackButton={true} onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.detailCard}>
          <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
            <Ionicons name={config.icon} size={32} color={config.iconColor} />
          </View>

          <Text style={styles.titleText}>{notification.title}</Text>
          <Text style={styles.dateText}>{getRelativeTime(notification.createdAt)}</Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>{notification.body}</Text>
        </View>

        {/* Action Section */}
        {(notification.orderId || notification.listingId) && (
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Related Action</Text>
            <Text style={styles.actionDesc}>
              {notification.orderId
                ? 'This notification is related to an active order.'
                : 'This notification is related to one of your listed services.'}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryActionBtn,
                Platform.OS === 'ios' && pressed && { opacity: 0.9 },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              onPress={() => {
                if (notification.orderId) {
                  router.replace('/(user)/(tabs)/orders');
                } else if (notification.listingId) {
                  router.replace({
                    pathname: '/(user)/ViewListing',
                    params: { id: notification.listingId },
                  });
                }
              }}
            >
              <Ionicons
                name={notification.orderId ? 'cart' : 'list'}
                size={20}
                color={colors.light.surface}
              />
              <Text style={styles.primaryActionText}>
                {notification.orderId ? 'View Order Details' : 'View Service'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailCard: {
    backgroundColor: colors.light.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: colors.light.subText,
    fontWeight: '500',
    marginBottom: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.light.altBorder,
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 16,
    color: colors.light.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: colors.light.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 8,
  },
  actionDesc: {
    fontSize: 14,
    color: colors.light.subText,
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.light.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: colors.light.surface,
    fontWeight: '700',
  },
});
