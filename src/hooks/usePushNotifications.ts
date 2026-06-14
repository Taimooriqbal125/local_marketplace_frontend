// d:\Frontend\marketplace\src\hooks\usePushNotifications.ts

import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { initializeNotifications } from '../services/notifications/notificationService';
import {
  useRegisterDeviceTokenMutation,
  DeviceType,
} from '../redux/user_device_token/user_device_tokenApi';
import { useAppSelector } from '@/redux/hooks';
import { selectIsAuthenticated } from '@/redux/auth/authSlice';

// Global flag to prevent redundant API calls on component remounts
let hasInitialized = false;

export const usePushNotifications = () => {
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(
    null,
  );
  const [registerDeviceToken] = useRegisterDeviceTokenMutation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Unified function to handle permission + registration + listeners
  const handleInitialization = useCallback(async () => {
    const { status } = await initializeNotifications({
      onReceive: (notif) => console.log('Received:', notif),
      onClick: (res) => console.log('Clicked:', res),
      registerToken: async (token) => {
        const deviceType =
          Platform.OS === 'android' || Platform.OS === 'ios' || Platform.OS === 'web'
            ? Platform.OS
            : 'web';

        await registerDeviceToken({
          expo_push_token: token,
          device_type: deviceType as DeviceType,
          device_name: Device.deviceName || 'Unknown',
        }).unwrap();
      },
    });
    setPermissionStatus(status);
    hasInitialized = true;
  }, [registerDeviceToken, isAuthenticated]);

  useEffect(() => {
    if (!Device.isDevice) return;

    // 1. On mount: Just check if we ALREADY have permission
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status);

      // 2. Only run init if authenticated AND permission granted
      if (status === 'granted' && !hasInitialized && isAuthenticated) {
        handleInitialization();
      }
    });
  }, [handleInitialization, isAuthenticated]);

  return {
    permissionStatus,
    isPermissionGranted: permissionStatus === 'granted',
    reInitialize: handleInitialization, // This will trigger the system popup when called from your UI
  };
};
