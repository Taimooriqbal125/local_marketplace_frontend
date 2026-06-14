import { Redirect, Stack, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '@/redux/store';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, status, user } = useSelector((state: RootState) => state.auth);

  const userRoute: Href = '/(user)/(tabs)' as unknown as Href;
  const adminRoute: Href = '/(admin)/(tabs)' as unknown as Href;

  const isLoading = status === 'loading';
  const isAdmin = user?.isAdmin;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0F172A',
        }}
      >
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (isAuthenticated && isAdmin !== undefined) {
    if (isAdmin === true) {
      return <Redirect href={adminRoute} />;
    }

    return <Redirect href={userRoute} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="Signup" />
      <Stack.Screen name="ForgotPassword" />
      <Stack.Screen name="Welcome" />
      <Stack.Screen name="Otp" />
      <Stack.Screen name="NewPassword" />
    </Stack>
  );
};

export default AuthLayout;
