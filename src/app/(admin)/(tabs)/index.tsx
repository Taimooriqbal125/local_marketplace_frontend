import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGetNotificationsQuery } from '@/redux/notification/notificationApi';
import { useNavigation } from 'expo-router';

import ScreenWrapper from '@/components/common/ScreenWrapper';
import HomeHeader from '@/components/listings/HomeHeader';

type Notification = {
  isRead: boolean;
  [key: string]: any;
};

const AdminDashboard = () => {
  const navigation = useNavigation();

  const { data: notifications = [] } = useGetNotificationsQuery();

  const unreadCount = (notifications as Notification[]).filter((n) => !n.isRead).length;

  return (
    <ScreenWrapper style={styles.container}>
      <HomeHeader
        title="Admin Panel"
        notificationCount={unreadCount}
        onNotificationPress={() => {
          navigation.navigate('Notification' as never);
        }}
        onSearch={() => {}}
        profileInitials="A"
      />

      <View style={styles.content}>
        <Text style={styles.text}>Admin Dashboard</Text>
      </View>
    </ScreenWrapper>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
  },
});
