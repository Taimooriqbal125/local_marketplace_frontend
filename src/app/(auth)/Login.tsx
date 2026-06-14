import React, { useEffect, useState } from 'react';

import ScreenWrapper from '@components/common/ScreenWrapper';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '@/redux/auth/authApi';
import { setCredentials } from '@/redux/auth/authSlice';
import { secureStore } from '@/storage';
import { SECURE_KEYS } from '@/storage/keys';
import ErrorHandler from '@/utils/ErrorHandler';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/components/toast/CustomError';
import type { RootState, AppDispatch } from '@/redux/store';

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [loginMutation, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(user)/(tabs)' as any);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorToast('Please fill in all fields', 'Validation Error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showErrorToast('Please enter a valid email', 'Validation Error');
      return;
    }

    try {
      const response = await loginMutation({ email, password }).unwrap();

      const { accessToken, access_token, refreshToken, refresh_token, user } = response;

      const finalAccessToken = accessToken || access_token;
      const finalRefreshToken = refreshToken || refresh_token;

      if (finalAccessToken) {
        // PERSISTENCE: Save tokens to SecureStore so they survive app restarts
        await secureStore.saveAuthTokens({
          accessToken: finalAccessToken,
          refreshToken: finalRefreshToken || null,
        });

        if (user) {
          await secureStore.setObject(SECURE_KEYS.USER_DATA, user);
        }

        dispatch(
          setCredentials({
            accessToken: finalAccessToken,
            refreshToken: finalRefreshToken,
            user: user || null,
          }),
        );

        showSuccessToast('Logged in successfully');
        router.replace('/(user)/(tabs)' as any);
      } else {
        throw new Error('Authentication failed: No access token received');
      }
    } catch (error) {
      console.error('Login failed:', error);
      showErrorToast(ErrorHandler.getErrorMessage(error), 'Login failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      showInfoToast('Google Sign In - Configure this later');
    } catch {
      showErrorToast('Google Sign In failed');
    }
  };
  const handleForgotPassword = () => {
    router.push('/(auth)/ForgotPassword' as Href);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="storefront" size={32} color="#10B981" />
              </View>
              <Text style={styles.marketplaceText}>Artisan Marketplace</Text>
            </View>

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>Login to continue</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.label}>Password</Text>
                  <Pressable onPress={handleForgotPassword}>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </Pressable>
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />

                  <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
              </Pressable>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <Pressable style={styles.socialButton} onPress={handleGoogleSignIn}>
                <FontAwesome5 name="google" size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/Signup' as any)}>
                <Text style={styles.signUpText}>SignUp</Text>
              </Pressable>
            </View>

            <View style={styles.bottomLinks}>
              <Pressable>
                <Text style={styles.bottomLinkText}>TERMS</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.bottomLinkText}>PRIVACY</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.bottomLinkText}>HELP</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketplaceText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#6EE7B7',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
    marginBottom: 12,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  appleButton: {
    width: '100%',
    height: 52,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signUpText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 24,
  },
  bottomLinkText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default Login;
