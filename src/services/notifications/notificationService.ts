import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from './notificationPermissions';
import { getPushToken } from './pushTokenService';
import {
  setupNotificationListeners,
  NotificationReceivedHandler,
  NotificationResponseHandler,
} from './notificationHandlers';
import { deviceTokenApi } from '@/redux/user_device_token/user_device_tokenApi';

interface InitializeNotificationsProps {
  onReceive: NotificationReceivedHandler;
  onClick: NotificationResponseHandler;
  /**
   * Callback to register the token with the backend.
   * This is typically a Redux mutation trigger.
   */
  registerToken: (token: string) => Promise<any>;
}

/**
 * Orchestrates the notification initialization flow.
 * Returns the status and a cleanup function for listeners.
 */
export async function initializeNotifications({
  onReceive,
  onClick,
  registerToken,
}: InitializeNotificationsProps) {
  try {
    // 1. Ask permission
    const status = await requestNotificationPermission();

    // If permission not granted, we can't proceed with token fetching or listeners
    if (status !== 'granted') {
      return { status, cleanup: () => {} };
    }

    // 2. Get token
    const token = await getPushToken();

    if (__DEV__) {
      console.log('Expo Push Token:', token);
    }

    // 3. Send token to backend
    await registerToken(token);

    // 4. Setup listeners
    const cleanup = setupNotificationListeners(onReceive, onClick);

    return { status, cleanup };
  } catch (error) {
    console.error('Notification initialization failed:', error);
    // Fallback to undetermined/denied if something crashed
    return { status: 'denied' as Notifications.PermissionStatus, cleanup: () => {} };
  }
}

/**
 * Deactivates the current device's push token on the backend.
 * This is an industrial-level action called during user logout
 * to ensure notifications stop routing to this specific device.
 */
export async function deactivatePushNotification(dispatch: any) {
  try {
    // Check if we even have permissions before trying to get the token
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const token = await getPushToken();
    if (token) {
      if (__DEV__) {
        console.log('[NotificationService] Deactivating Expo Push Token:', token);
      }

      // Dispatch the RTK Query mutation directly using the store/dispatch
      await dispatch(deviceTokenApi.endpoints.deactivateDeviceToken.initiate(token)).unwrap();
    }
  } catch (error) {
    console.error('Failed to deactivate push token during logout:', error);
    // We intentionally swallow this error so it doesn't block the actual logout process
  }
}
