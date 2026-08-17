/* ------------------------------------------------------------------ */
/* Mock factories (hoisted before imports)                            */
/* ------------------------------------------------------------------ */

import axios from 'axios';
import { axiosBaseQuery, injectStore, injectRefreshApi } from '../axiosBaseQuery';
import { secureStore } from '@/storage';
import { setCredentials, logout } from '@/redux/auth/authSlice';

jest.mock('axios', () => {
  const instance: any = jest.fn();
  instance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  return { create: jest.fn(() => instance) };
});

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: null } },
}));

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

jest.mock('@/storage', () => ({
  secureStore: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    saveAuthTokens: jest.fn(),
    clearAuthStorage: jest.fn(),
  },
}));

jest.mock('@/redux/auth/authSlice', () => ({
  setCredentials: jest.fn((p: any) => ({ type: 'auth/setCredentials', payload: p })),
  logout: jest.fn(() => ({ type: 'auth/logout' })),
}));

/* ------------------------------------------------------------------ */
/* Imports (resolved AFTER mocks are hoisted)                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Extract mock references from initialized module                    */
/* ------------------------------------------------------------------ */
const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
const [requestFulfilled, requestRejected] =
  mockAxiosInstance.interceptors.request.use.mock.calls[0];
const [responseFulfilled, responseRejected] =
  mockAxiosInstance.interceptors.response.use.mock.calls[0];

describe('axiosBaseQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /* ================================================================ */
  /* 1. axiosBaseQuery() wrapper                                      */
  /* ================================================================ */
  describe('axiosBaseQuery wrapper', () => {
    const query = axiosBaseQuery();

    it('should treat string args as a GET request', async () => {
      mockAxiosInstance.mockResolvedValueOnce({ data: { items: [] }, status: 200 });
      const result = await query('/orders');

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        url: '/orders',
        method: 'GET',
        data: undefined,
        params: undefined,
        headers: undefined,
      });
      expect(result).toEqual({ data: { items: [] } });
    });

    it('should pass method, data, params, and headers from object args', async () => {
      mockAxiosInstance.mockResolvedValueOnce({ data: { id: 1 }, status: 201 });

      const result = await query({
        url: '/orders',
        method: 'POST',
        data: { item: 'test' },
        params: { page: 1 },
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        url: '/orders',
        method: 'POST',
        data: { item: 'test' },
        params: { page: 1 },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toEqual({ data: { id: 1 } });
    });

    it('should handle FormData without Content-Type header in request', async () => {
      const mockFormData = new FormData();
      mockAxiosInstance.mockResolvedValueOnce({ data: { token: 'abc' }, status: 200 });

      const result = await query({
        url: '/users/login',
        method: 'POST',
        data: mockFormData,
      });

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        url: '/users/login',
        method: 'POST',
        data: mockFormData,
        params: undefined,
        headers: undefined,
      });
      expect(result).toEqual({ data: { token: 'abc' } });
    });

    it('should not modify instance defaults when data is not FormData', async () => {
      mockAxiosInstance.mockResolvedValueOnce({ data: { token: 'abc' }, status: 200 });

      await query({
        url: '/users/login',
        method: 'POST',
        data: { email: 'test@example.com', password: 'password' },
      });

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        url: '/users/login',
        method: 'POST',
        data: { email: 'test@example.com', password: 'password' },
        params: undefined,
        headers: undefined,
      });
    });

    it('should return error when 200 response contains a detail field', async () => {
      mockAxiosInstance.mockResolvedValueOnce({
        data: { detail: 'Something went wrong' },
        status: 200,
      });

      const result = await query('/test');
      expect(result).toEqual({
        error: { status: 400, data: { detail: 'Something went wrong' } },
      });
    });

    it('should handle custom error objects from interceptor', async () => {
      mockAxiosInstance.mockRejectedValueOnce({ status: 403, data: { detail: 'Forbidden' } });
      const result = await query('/protected');

      expect(result).toEqual({ error: { status: 403, data: { detail: 'Forbidden' } } });
    });

    it('should handle raw AxiosError with response', async () => {
      mockAxiosInstance.mockRejectedValueOnce({
        response: { status: 500, data: { detail: 'Server error' } },
        message: 'Request failed',
      });

      const result = await query('/failing');
      expect(result).toEqual({ error: { status: 500, data: { detail: 'Server error' } } });
    });

    it('should handle network failure with no response', async () => {
      mockAxiosInstance.mockRejectedValueOnce({ message: 'Network Error' });
      const result = await query('/offline');

      expect(result).toEqual({
        error: { status: 500, data: { detail: 'Network Error' } },
      });
    });

    it('should fallback to generic message when error has nothing', async () => {
      mockAxiosInstance.mockRejectedValueOnce({});
      const result = await query('/unknown');

      expect(result).toEqual({
        error: { status: 500, data: { detail: 'An unexpected error occurred' } },
      });
    });
  });

  /* ================================================================ */
  /* 2. Request interceptor                                           */
  /* ================================================================ */
  describe('Request interceptor', () => {
    it('should attach Bearer token when available', async () => {
      (secureStore.getAccessToken as jest.Mock).mockResolvedValueOnce('my-token');
      const config = { headers: {} as any, url: '/orders' };
      const result = await requestFulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer my-token');
    });

    it('should warn and skip token when none available', async () => {
      (secureStore.getAccessToken as jest.Mock).mockResolvedValueOnce(null);
      const config = { headers: {} as any, url: '/orders' };
      const result = await requestFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('No token'));
    });

    it('should reject on request setup error', async () => {
      const error = new Error('Setup failed');
      await expect(requestRejected(error)).rejects.toThrow('Setup failed');
    });
  });

  /* ================================================================ */
  /* 3. Response interceptor                                          */
  /* ================================================================ */
  describe('Response interceptor', () => {
    it('should pass through successful responses', () => {
      const response = { data: { ok: true }, status: 200 };
      expect(responseFulfilled(response)).toEqual(response);
    });

    it('should reject non-401 errors with status and data', async () => {
      const error = {
        response: { status: 403, data: { detail: 'Forbidden' } },
        config: { url: '/test' },
      };
      await expect(responseRejected(error)).rejects.toEqual({
        status: 403,
        data: { detail: 'Forbidden' },
      });
    });

    it('should reject 401 on /users/login without rotation', async () => {
      const error = {
        response: { status: 401, data: { detail: 'Invalid credentials' } },
        config: { url: '/users/login', _retry: false },
      };
      await expect(responseRejected(error)).rejects.toEqual({
        status: 401,
        data: { detail: 'Invalid credentials' },
      });
      expect(secureStore.getRefreshToken).not.toHaveBeenCalled();
    });

    it('should reject 401 on /users/signup without rotation', async () => {
      const error = {
        response: { status: 401, data: { detail: 'Email exists' } },
        config: { url: '/users/signup', _retry: false },
      };
      await expect(responseRejected(error)).rejects.toEqual({
        status: 401,
        data: { detail: 'Email exists' },
      });
    });

    it('should reject if already retried (_retry=true)', async () => {
      const error = {
        response: { status: 401, data: { detail: 'Still unauthorized' } },
        config: { url: '/orders', _retry: true },
      };
      await expect(responseRejected(error)).rejects.toEqual({
        status: 401,
        data: { detail: 'Still unauthorized' },
      });
    });
  });

  /* ================================================================ */
  /* 4. Dependency injection                                          */
  /* ================================================================ */
  describe('Dependency injection', () => {
    it('injectStore should accept a store instance', () => {
      expect(() => injectStore({ dispatch: jest.fn() })).not.toThrow();
    });

    it('injectRefreshApi should accept a refresh API reference', () => {
      const api = { endpoints: { refreshToken: { initiate: jest.fn() } } };
      expect(() => injectRefreshApi(api)).not.toThrow();
    });
  });

  /* ================================================================ */
  /* 5. Token rotation flow                                           */
  /* ================================================================ */
  describe('Token rotation flow', () => {
    const mockStore = { dispatch: jest.fn() };
    const mockRefreshApi = {
      endpoints: { refreshToken: { initiate: jest.fn(() => 'refresh-action') } },
    };

    beforeEach(() => {
      injectStore(mockStore);
      injectRefreshApi(mockRefreshApi);
      mockStore.dispatch.mockReset();
    });

    it('should rotate tokens and retry on success (snake_case)', async () => {
      (secureStore.getRefreshToken as jest.Mock).mockResolvedValueOnce('old-refresh');
      mockStore.dispatch.mockResolvedValueOnce({
        data: { access_token: 'new-access', refresh_token: 'new-refresh', user: { id: 1 } },
      });
      mockAxiosInstance.mockResolvedValueOnce({ data: { orders: [] } });

      const error = {
        response: { status: 401, data: { detail: 'Expired' } },
        config: { url: '/orders', headers: {} as any },
      };

      const result = await responseRejected(error);

      expect(secureStore.saveAuthTokens).toHaveBeenCalledWith({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      expect(setCredentials).toHaveBeenCalledWith({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        user: { id: 1 },
      });
      expect(error.config.headers.Authorization).toBe('Bearer new-access');
      expect(result).toEqual({ data: { orders: [] } });
    });

    it('should handle camelCase token response', async () => {
      (secureStore.getRefreshToken as jest.Mock).mockResolvedValueOnce('old');
      mockStore.dispatch.mockResolvedValueOnce({
        data: { accessToken: 'camel-access', refreshToken: 'camel-refresh' },
      });
      mockAxiosInstance.mockResolvedValueOnce({ data: { ok: true } });

      const error = {
        response: { status: 401, data: { detail: 'Expired' } },
        config: { url: '/profile', headers: {} as any },
      };

      await responseRejected(error);

      expect(secureStore.saveAuthTokens).toHaveBeenCalledWith({
        accessToken: 'camel-access',
        refreshToken: 'camel-refresh',
      });
    });

    it('should logout when refresh result has error', async () => {
      (secureStore.getRefreshToken as jest.Mock).mockResolvedValueOnce('old');
      mockStore.dispatch.mockResolvedValueOnce({ error: { status: 401 } });

      const error = {
        response: { status: 401, data: { detail: 'Expired' } },
        config: { url: '/orders', headers: {} as any },
      };

      await expect(responseRejected(error)).rejects.toBeDefined();
      expect(secureStore.clearAuthStorage).toHaveBeenCalled();
      expect(logout).toHaveBeenCalled();
    });

    it('should logout when no refresh token exists', async () => {
      (secureStore.getRefreshToken as jest.Mock).mockResolvedValueOnce(null);

      const error = {
        response: { status: 401, data: { detail: 'Expired' } },
        config: { url: '/listings', headers: {} as any },
      };

      await expect(responseRejected(error)).rejects.toBeDefined();
      expect(secureStore.clearAuthStorage).toHaveBeenCalled();
      expect(logout).toHaveBeenCalled();
    });

    it('should logout when refreshApi is not injected', async () => {
      injectRefreshApi(null);
      (secureStore.getRefreshToken as jest.Mock).mockResolvedValueOnce('token');

      const error = {
        response: { status: 401, data: { detail: 'Expired' } },
        config: { url: '/orders', headers: {} as any },
      };

      await expect(responseRejected(error)).rejects.toBeDefined();
      expect(secureStore.clearAuthStorage).toHaveBeenCalled();
      expect(logout).toHaveBeenCalled();

      injectRefreshApi(mockRefreshApi); // restore for next tests
    });
  });
});
