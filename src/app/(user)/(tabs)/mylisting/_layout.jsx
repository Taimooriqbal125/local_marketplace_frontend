import { Stack } from 'expo-router';

// All tab navigation (PagerView) is handled inside mylisting/index.jsx directly.
export default function MyListingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
