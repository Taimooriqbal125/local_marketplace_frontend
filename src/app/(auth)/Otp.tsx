import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { showErrorToast, showSuccessToast } from '@components/toast/CustomError';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { Href, useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyOtpMutation, useResendOtpMutation } from '@/redux/auth/otpApi';

const Otp: React.FC = () => {
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const email = (params?.email as string) || 'hello@example.com';
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(0);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    showSuccessToast('OTP sent successfully. Please check your email.');
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && text) {
      const completeOtp = [...newOtp];
      completeOtp[5] = text;
      if (completeOtp.every((digit) => digit !== '')) {
        handleVerify(completeOtp.join(''));
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');

    if (otpCode.length !== 6) {
      showErrorToast('Please enter all 6 digits');
      return;
    }

    try {
      await verifyOtp({
        email,
        otp: otpCode,
        purpose: 'signup_verify',
      }).unwrap();

      showSuccessToast('Email verified successfully! You may login now.');
      navigation.replace('/(auth)/Login' as Href);
    } catch (err: any) {
      showErrorToast(err?.data?.detail || 'Invalid code. Please try again.');
      console.error('OTP verification error:', err);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      await resendOtp({
        email,
        purpose: 'signup_verify',
      }).unwrap();

      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      showSuccessToast('New verification code sent to your email');
    } catch (err: any) {
      showErrorToast(err?.data?.detail || 'Failed to resend code. Please try again.');
      console.error('Resend OTP error:', err);
    }
  };

  const handleBackPress = () => {
    navigation.back();
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your email{' '}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit !== '' && styles.otpInputFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!isLoading}
                selectTextOnFocus
                contextMenuHidden
              />
            ))}
          </View>

          {/* Resend Code Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>Resend in {countdown}s</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : (
                  <Text style={styles.resendButton}>Resend code</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isOtpComplete || isLoading) && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={!isOtpComplete || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.verifyButtonText}>Verify</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  emailText: {
    color: '#10B981',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  otpInputFilled: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 16,
    color: '#6B7280',
  },
  resendButton: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
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
  },
  verifyButtonDisabled: {
    backgroundColor: '#6EE7B7',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default Otp;
