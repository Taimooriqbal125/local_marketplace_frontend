import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
  const { isAuthenticated, status, user } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';
  const isAdmin = user?.isAdmin;

  // Show loading spinner while checking auth state
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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // If user is already logged in, redirect based on role
  if (isAuthenticated && isAdmin) {
    if (isAdmin === true) {
      return <Redirect href="/(admin)/(tabs)" />;
    } else {
      return <Redirect href="/(user)/(tabs)" />;
    }
  }

  // Show auth screens if not authenticated
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgotpassword" />
    </Stack>
  );
}
