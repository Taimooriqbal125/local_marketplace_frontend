import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(user)" />
        </Stack>
      </SafeAreaProvider>
    </Provider>
  );
}
