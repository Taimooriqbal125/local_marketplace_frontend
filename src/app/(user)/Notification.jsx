import Header from '@components/common/Header';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const initialNotifications = [
  {
    id: '1',
    group: 'Today',
    type: 'order',
    icon: 'cart',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
    title: 'New Order Request',
    description: 'John Doe requested your cleaning service.',
    time: '10 min ago',
    read: false,
  },
  {
    id: '2',
    group: 'Today',
    type: 'message',
    icon: 'chatbubble-ellipses',
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF',
    title: 'New Message',
    description: 'Sarah Jenkins sent you a message.',
    time: '45 min ago',
    read: false,
  },
  {
    id: '3',
    group: 'Earlier',
    type: 'review',
    icon: 'star',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
    title: 'New Review',
    description: 'David Chen left a 5-star review on your service.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '4',
    group: 'Earlier',
    type: 'order',
    icon: 'cart',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
    title: 'Order Completed',
    description: 'Your order #1042 has been marked as completed.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '5',
    group: 'Earlier',
    type: 'system',
    icon: 'shield-checkmark',
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
    title: 'Account Verified',
    description: 'Your seller account has been successfully verified.',
    time: '3 days ago',
    read: true,
  },
];

export default function Notification() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const groups = ['Today', 'Earlier'];

  return (
    <ScreenWrapper withTopInset={false} backgroundColor="#F7F9FA">
      <Header
        title="Notifications"
        showBackButton={true}
        onBackPress={() => router.back()}
        isRightIconVisible={unreadCount > 0}
        rightIcon="checkmark-done"
        rightIconSize={20}
        rightIconColor="#16A34A"
        onRightIconPress={markAllRead}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {unreadCount > 0 && (
          <View style={styles.summaryBanner}>
            <Ionicons name="notifications" size={14} color="#16A34A" />
            <Text style={styles.summaryText}>
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {groups.map((group) => {
          const items = notifications.filter((n) => n.group === group);
          if (items.length === 0) return null;

          return (
            <View key={group}>
              <Text style={styles.groupLabel}>{group}</Text>

              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.card, !item.read && styles.cardUnread]}
                  onPress={() => markRead(item.id)}
                >
                  {/* Icon */}
                  <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text style={styles.cardTime}>{item.time}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}

        {unreadCount === 0 && (
          <View style={styles.allReadBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text style={styles.allReadText}>All caught up!</Text>
          </View>
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
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
  },

  // Group label
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  cardUnread: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
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
    color: '#374151',
    flex: 1,
  },
  cardTitleUnread: {
    color: '#111827',
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginLeft: 8,
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 11,
    color: '#9CA3AF',
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
    color: '#16A34A',
    fontWeight: '600',
  },
});
