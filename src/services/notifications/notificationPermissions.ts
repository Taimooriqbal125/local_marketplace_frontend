// notificationPermissions.ts

import * as Notifications from 'expo-notifications';

export async function requestNotificationPermission() {
  // check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  // ask if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus;
}
