import { selectAuth } from '@/redux/auth/authSlice';
import { RootState } from '@/redux/store'; // make sure ye export ho
import { secureStore } from '@/storage';
import { Redirect, type Href } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';

const userRoute = '/(user)/(tabs)' as unknown as Href;
const authRoute = '/(auth)/Welcome' as unknown as Href;
const Index = () => {
  const { isAuthenticated, isHydrated } = useSelector((state: RootState) => selectAuth(state));

  // Inside src/app/index.tsx
  useEffect(() => {
    const checkStorage = async () => {
      const token = await secureStore.getAccessToken();
      console.log('Token retrieved from SecureStore on startup:', token);
    };
    checkStorage();
  }, []);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return isAuthenticated ? <Redirect href={userRoute} /> : <Redirect href={authRoute} />;
};

export default Index;
