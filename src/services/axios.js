import axios from 'axios';
import { Platform } from 'react-native';
import { secureStore } from '@/storage';

// Base URL for API - handle different environments
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/';
  }

  return 'http://localhost:8000/';
};

const BASE_URL = getBaseUrl();

console.log('API Base URL:', BASE_URL);

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await secureStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStore.getRefreshToken();

        if (refreshToken) {
          // Note: Backend endpoint should match your FastAPI implementation
          const response = await axios.post(`${BASE_URL}auth/refresh`, {
            refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          await secureStore.saveAuthTokens({
            accessToken: access_token,
            refreshToken: refresh_token,
          });

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        await secureStore.clearAuthStorage();
        return Promise.reject(refreshError);
      }
    }

    // Standardize error response
    const errorResponse = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.detail || // FastAPI often uses 'detail'
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      errors: error.response?.data?.errors || null,
      originalError: error,
    };

    return Promise.reject(errorResponse);
  },
);

export default axiosInstance;
