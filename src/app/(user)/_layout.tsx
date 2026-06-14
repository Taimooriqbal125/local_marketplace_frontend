import { NotificationGuard } from '@/components/common/NotificationGuard';
import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <NotificationGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="AddReview" />
        <Stack.Screen name="ServicesDetails" />
        <Stack.Screen name="Notification" />
        <Stack.Screen name="ProfileDetails" />
        <Stack.Screen name="ProfileForm" />
        <Stack.Screen name="Help&Support" />
        <Stack.Screen name="ListingBasicInfo" />
        <Stack.Screen name="ListingDetails" />
        <Stack.Screen name="MyRequestedServices" />
        <Stack.Screen name="ViewListing" />
        <Stack.Screen name="NotificationDetail" />
      </Stack>
    </NotificationGuard>
  );
}
