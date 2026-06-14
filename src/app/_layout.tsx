import React, { PropsWithChildren, useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/toast/toastConfig';

import { StatusBar } from 'expo-status-bar';
import { store } from '@store/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { hydrateAuth } from '@/redux/auth/authSlice';
import { setNetworkStatus } from '@/redux/network/networkSlice';
import { injectStore } from './axios/axiosBaseQuery';
import NoInternetBanner from '@/components/common/noInternetBanner';
import { performInitialHydration } from '@/redux/api/hydration';
import Overlay from './walkthrough/Overlay';

import notificationSocket from '@/services/sockets/notificationSocket';

const AppInitializer: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    // 1. Initial hydration from disk (Scalable system)
    performInitialHydration(dispatch);

    // 2. Auth hydration
    dispatch(hydrateAuth() as any);

    // 3. Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(
        setNetworkStatus({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        }),
      );
    });

    return () => unsubscribe();
  }, [dispatch]);

  // 4. WebSocket Auth sync
  useEffect(() => {
    if (isAuthenticated) {
      notificationSocket
        .connect()
        .catch((err) => console.warn('Failed to connect notification socket:', err));
    } else {
      notificationSocket.disconnect();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default function RootLayout(): React.JSX.Element {
  // Inject store into axiosBaseQuery to avoid circular dependencies
  injectStore(store);

  return (
    <Provider store={store}>
      <AppInitializer>
        <SafeAreaProvider>
          <StatusBar translucent style="dark" />
          <NoInternetBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(user)" />
          </Stack>
          <Toast config={toastConfig} />
          <Overlay />
        </SafeAreaProvider>
      </AppInitializer>
    </Provider>
  );
}
