import * as Notifications from 'expo-notifications';

/**
 * Global configuration to dictate how notifications should be handled
 * when the app is in the foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Type for the callback invoked when a notification is received while the app is in the foreground.
 */
export type NotificationReceivedHandler = (notification: Notifications.Notification) => void;

/**
 * Type for the callback invoked when a user interacts with a notification (e.g., taps it).
 */
export type NotificationResponseHandler = (response: Notifications.NotificationResponse) => void;

/**
 * Sets up listeners for notification events.
 *
 * @param onReceive - Callback for foreground notifications.
 * @param onClick - Callback for notification interactions.
 * @returns A cleanup function to remove the listeners.
 */
export function setupNotificationListeners(
  onReceive: NotificationReceivedHandler,
  onClick: NotificationResponseHandler,
) {
  // 🔹 when notification received (foreground)
  const receiveSub = Notifications.addNotificationReceivedListener((notification) => {
    onReceive(notification);
  });

  // 🔹 when user taps notification
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    onClick(response);
  });

  return () => {
    receiveSub.remove();
    responseSub.remove();
  };
}
