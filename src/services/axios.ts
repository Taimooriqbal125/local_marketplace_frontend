import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import secureStore from '../storage/securestore';
import Constants from 'expo-constants';

// Extend InternalAxiosRequestConfig to include _retry
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ErrorResponse {
  status: number;
  message: string;
  errors: any[] | null;
  originalError: AxiosError;
}

// Base URL for API - handle different environments
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const localhost = debuggerHost.split(':')[0];
    return `http://${localhost}:8000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

const BASE_URL: string = getBaseUrl();

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await secureStore.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[Axios] No token for: ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;

    // Handle 401 Unauthorized - Attempt token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStore.getRefreshToken();

        if (refreshToken) {
          // Fixed URL formatting - ensure leading slash
          const response = await axios.post(`${BASE_URL}/users/refresh`, {
            refresh_token: refreshToken, // backend usually expects snake_case
          });

          const { access_token, refresh_token } = response.data;

          await secureStore.saveAuthTokens({
            accessToken: access_token,
            refreshToken: refresh_token,
          });

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Axios] Refresh failed, clearing storage');
        await secureStore.clearAuthStorage();
        return Promise.reject(refreshError);
      }
    }

    // Standardize error response
    const errorResponse: ErrorResponse = {
      status: error.response?.status || 500,
      message:
        (error.response?.data as any)?.detail ||
        (error.response?.data as any)?.message ||
        error.message ||
        'An unexpected error occurred',
      errors: (error.response?.data as any)?.errors || null,
      originalError: error,
    };

    return Promise.reject(errorResponse);
  },
);

export default axiosInstance;
