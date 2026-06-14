import { baseApi } from '../api/baseApi';

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: 'signup_verify' | 'reset_password';
}

export interface ResendOtpRequest {
  email: string;
  purpose: 'signup_verify' | 'reset_password';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface BasicAuthResponse {
  message: string;
}

export const otpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyOtp: builder.mutation<BasicAuthResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        data,
      }),
    }),
    resendOtp: builder.mutation<BasicAuthResponse, ResendOtpRequest>({
      query: (data) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        data,
      }),
    }),
    forgotPassword: builder.mutation<BasicAuthResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        data,
      }),
    }),
    resetPassword: builder.mutation<BasicAuthResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = otpApi;
