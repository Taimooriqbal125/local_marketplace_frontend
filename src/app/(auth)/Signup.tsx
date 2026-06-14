import React, { useCallback, useEffect, useState } from 'react';

import ScreenWrapper from '@/components/common/ScreenWrapper';

import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { showErrorToast } from '@/components/toast/CustomError';
import { useSelector } from 'react-redux';

import { useRegisterMutation } from '@/redux/auth/authApi';
import { selectIsAuthenticated } from '@/redux/auth/authSlice';
import type { RootState } from '@/redux/store';

type RegisterPayload = {
  email: string;
  password: string;
  phone?: string;
  isAdmin?: boolean;
};

const USER_TABS_ROUTE = '/(user)/(tabs)' as Href;
const LOGIN_ROUTE = '/(auth)/Login' as Href;

// Constants moved outside to prevent re-renders on stable prop changes
const GRADIENT_COLORS = ['#ECFDF5', '#FFFFFF'] as const;
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 0, y: 1 };

const Signup: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const [Phoneno, setPhonenoState] = useState<string>('');
  const [email, setEmailState] = useState<string>('');
  const [password, setPasswordState] = useState<string>('');
  const [confirmPassword, setConfirmPasswordState] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // Memoized state setters to ensure stability across renders
  const setEmail = useCallback((text: string) => setEmailState(text), []);
  const setPhoneno = useCallback((text: string) => setPhonenoState(text), []);
  const setPassword = useCallback((text: string) => setPasswordState(text), []);
  const setConfirmPassword = useCallback((text: string) => setConfirmPasswordState(text), []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(USER_TABS_ROUTE);
    }
  }, [isAuthenticated, router]);

  const validateForm = useCallback((): boolean => {
    if (!Phoneno.trim()) {
      showErrorToast('Please enter your phone number');
      return false;
    }

    if (!email.trim()) {
      showErrorToast('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorToast('Please enter a valid email address');
      return false;
    }

    if (!password) {
      showErrorToast('Please create a password');
      return false;
    }

    if (password.length < 8) {
      showErrorToast('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      showErrorToast('Passwords do not match');
      return false;
    }

    if (!isChecked) {
      showErrorToast('Please agree to the Terms & Privacy Policy');
      return false;
    }

    return true;
  }, [Phoneno, email, password, confirmPassword, isChecked]);

  const handleSignup = useCallback(async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      const payload: RegisterPayload = {
        email,
        password,
        phone: Phoneno,
      };

      await registerMutation(payload as any).unwrap();

      router.push({ pathname: '/(auth)/Otp', params: { email } } as any);
    } catch (error: any) {
      showErrorToast(error?.data?.detail || 'Signup failed. Please try again.');
      console.error('Signup failed:', error);
    }
  }, [validateForm, email, password, Phoneno, registerMutation, router]);

  const toggleShowPassword = useCallback(() => setShowPassword((prev) => !prev), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword((prev) => !prev), []);
  const toggleCheckbox = useCallback(() => setIsChecked((prev) => !prev), []);

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={GRADIENT_COLORS as any}
        style={styles.gradient}
        start={GRADIENT_START}
        end={GRADIENT_END}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="bag" size={32} color="#10B981" />
              </View>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the marketplace to start trading</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="name@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9CA3AF"
                    value={Phoneno}
                    onChangeText={setPhoneno}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={toggleShowPassword}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="Repeat your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={toggleShowConfirmPassword}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.termsContainer}
                onPress={toggleCheckbox}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>

                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>I agree to the </Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.termsLink}>Terms</Text>
                  </TouchableOpacity>
                  <Text style={styles.termsText}> & </Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <AppLoadingAnimation
                    visible={true}
                    fullscreen={false}
                    message=""
                    style={{ paddingVertical: 0 }}
                  />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Pressable onPress={() => router.push(LOGIN_ROUTE)}>
                  <Text style={styles.loginLink}>Log In</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  flexInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  termsTextContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  termsLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  signupButtonDisabled: {
    backgroundColor: '#6EE7B7',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: '600',
  },
});
