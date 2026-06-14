import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { secureStore } from '@/storage';
import { setCredentials, logout } from '@/redux/auth/authSlice';

// Base URL
export const getBaseUrl = () => {
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

const BASE_URL = getBaseUrl();

// -----------------------------------------------------------------------------
// Industrial Refresh Flow Context
// -----------------------------------------------------------------------------
let storeInstance: any = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Injected from _layout.tsx to avoid circular dependencies.
 */
export const injectStore = (instance: any) => {
  storeInstance = instance;
};

let refreshApiRef: any = null;

/**
 * Injected from refreshApi.ts to avoid circular dependencies.
 */
export const injectRefreshApi = (api: any) => {
  refreshApiRef = api;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await secureStore.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[Axios] No token for: ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 1. If not 401, propagation error
    if (error.response?.status !== 401) {
      return Promise.reject({
        status: error.response?.status || 500,
        data: error.response?.data,
      });
    }

    // 2. IMPORTANT: Skip rotation for Auth endpoints
    // If we get a 401 on login/signup, it means invalid credentials, not an expired token
    const isAuthPath =
      originalRequest.url?.includes('/users/login') ||
      originalRequest.url?.includes('/users/signup');

    if (isAuthPath || originalRequest?._retry) {
      return Promise.reject({
        status: error.response?.status || 500,
        data: error.response?.data,
      });
    }

    // 3. Mark as retrying
    originalRequest._retry = true;

    // 4. Handle concurrent refresh calls
    if (isRefreshing) {
      try {
        const newToken = await refreshPromise;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshErr) {
        console.error('[Axios] Queued request failed after refresh:', refreshErr);
        return Promise.reject(error);
      }
    }

    // 5. Start the refresh process
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('[Axios] Attempting token rotation...');

        const refreshToken = await secureStore.getRefreshToken();
        console.log('refresh token', refreshToken);

        if (!refreshToken) {
          console.warn('[Axios] Rotation aborted: No refresh token found in storage');
          throw new Error('No refresh token available');
        }

        // Use the centralized endpoint from refreshApi if available
        if (!refreshApiRef) {
          throw new Error('Refresh API not initialized');
        }

        const result = await storeInstance.dispatch(
          refreshApiRef.endpoints.refreshToken.initiate({ refresh_token: refreshToken }),
        );

        if (result.error) {
          throw result.error;
        }

        const responseData = result.data;

        // Backend can be inconsistent: handle both snake_case and camelCase
        const {
          access_token,
          accessToken: camelAccessToken,
          refresh_token,
          refreshToken: camelRefreshToken,
          user,
        } = responseData;

        const newAccessToken = access_token || camelAccessToken;
        const newRefreshToken = refresh_token || camelRefreshToken;

        if (!newAccessToken) {
          throw new Error('Token rotation response missing access token');
        }

        console.log('[Axios] Token rotation successful');

        // Save to SecureStore (Persistence)
        await secureStore.saveAuthTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken, // Fallback to current if not rotated
        });

        // Update Redux state
        if (storeInstance) {
          storeInstance.dispatch(
            setCredentials({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken || refreshToken,
              user: user || undefined,
            }),
          );
        }

        return newAccessToken;
      } catch (rotationError: any) {
        const status = rotationError.response?.status;
        const detail = rotationError.response?.data?.detail || rotationError.message;

        console.error(`[Axios] Token rotation failed (Status: ${status}):`, detail);

        // Clear Storage
        await secureStore.clearAuthStorage();

        // Clear Redux
        if (storeInstance) {
          storeInstance.dispatch(logout());
        }

        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    const newToken = await refreshPromise;
    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  },
);

type AxiosBaseQueryArgs =
  | string
  | {
      url: string;
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      data?: unknown;
      params?: Record<string, unknown>;
      headers?: Record<string, string>;
    };
// RTK Query baseQuery wrapper
export const axiosBaseQuery = () => async (args: AxiosBaseQueryArgs) => {
  try {
    const url = typeof args === 'string' ? args : args.url;
    const method = (typeof args === 'string' ? 'GET' : args.method) || 'GET';
    const data = typeof args === 'string' ? undefined : args.data;
    const params = typeof args === 'string' ? undefined : args.params;
    const headers = typeof args === 'string' ? undefined : args.headers;

    const result = await axiosInstance({
      url,
      method,
      data,
      params,
      headers,
    });

    // Defensive check: if backend returns 200/201 but with an error 'detail'
    if (result.data?.detail && result.status < 400) {
      return {
        error: {
          status: 400,
          data: result.data,
        },
      };
    }

    return { data: result.data };
  } catch (error: any) {
    // If the interceptor handled and rejected it as a custom object:
    if (error && error.status && error.data) {
      console.log('[Axios] Backend returned error:', error.status, JSON.stringify(error.data));
      return {
        error: {
          status: error.status,
          data: error.data,
        },
      };
    }

    // Fallback for raw AxiosErrors or network failures
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
    const isNetworkError = !axiosError.response && axiosError.message;
    if (isNetworkError) {
      console.warn('[Axios] NETWORK ERROR - cannot reach server:', axiosError.message);
    }
    return {
      error: {
        status: axiosError.response?.status ?? 500,
        data: axiosError.response?.data ?? {
          detail: axiosError.message ?? 'An unexpected error occurred',
        },
      },
    };
  }
};

export default axiosBaseQuery;
