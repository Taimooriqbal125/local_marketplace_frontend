import { Stack } from 'expo-router';

// This layout just wraps the index screen.
// All tab navigation (PagerView) is handled inside orders/index.jsx directly.
export default function OrdersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
