// pushTokenService.ts

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function getPushToken() {
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error('Project ID not found');
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenResponse.data;
}
