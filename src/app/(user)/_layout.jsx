import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="AddReview" />
      <Stack.Screen name="ServicesDetails" />
      <Stack.Screen name="Notification" />
      <Stack.Screen name="ProfileDetails" />
      <Stack.Screen name="ProfileForm" />
      <Stack.Screen name="Help&Support" />
    </Stack>
  );
}
