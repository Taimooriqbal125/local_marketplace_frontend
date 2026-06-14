// notificationHelpers.ts

export function extractNotificationData(notification: any) {
  try {
    return notification?.request?.content?.data || {};
  } catch (error) {
    return error;
  }
}
