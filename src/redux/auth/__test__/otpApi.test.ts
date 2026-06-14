import { configureStore } from '@reduxjs/toolkit';
import { otpApi } from '../otpApi';
import { baseApi } from '../../api/baseApi';

/**
 * Type-safe mock for the base query arguments
 */
interface MockBaseQueryArgs {
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
}

// Mock the base query with proper typing
const mockBaseQuery = jest.fn((_args: MockBaseQueryArgs) => ({ data: { message: 'Success' } }));

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: MockBaseQueryArgs) => mockBaseQuery(args),
}));

describe('otpApi', () => {
  const createTestStore = () =>
    configureStore({
      reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }).concat(baseApi.middleware),
    });

  type TestStore = ReturnType<typeof createTestStore>;
  let store: TestStore;

  beforeEach(() => {
    jest.useFakeTimers();
    mockBaseQuery.mockClear();
    store = createTestStore();
  });

  afterEach(() => {
    store.dispatch(baseApi.util.resetApiState());
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should have all expected endpoints injected', () => {
    expect(otpApi.endpoints.verifyOtp).toBeDefined();
    expect(otpApi.endpoints.resendOtp).toBeDefined();
    expect(otpApi.endpoints.forgotPassword).toBeDefined();
    expect(otpApi.endpoints.resetPassword).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('verifyOtp should call baseQuery with correct parameters', async () => {
      const data = { email: 'test@example.com', otp: '123456', purpose: 'signup_verify' as const };

      await store.dispatch(otpApi.endpoints.verifyOtp.initiate(data));

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/auth/verify-otp');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.data).toEqual(data);
    });

    it('resendOtp should call baseQuery with correct parameters', async () => {
      const data = { email: 'test@example.com', purpose: 'reset_password' as const };

      await store.dispatch(otpApi.endpoints.resendOtp.initiate(data));

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/auth/resend-otp');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.data).toEqual(data);
    });

    it('forgotPassword should call baseQuery with correct parameters', async () => {
      const data = { email: 'test@example.com' };

      await store.dispatch(otpApi.endpoints.forgotPassword.initiate(data));

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/auth/forgot-password');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.data).toEqual(data);
    });

    it('resetPassword should call baseQuery with correct parameters', async () => {
      const data = { email: 'test@example.com', otp: '123456', newPassword: 'new-password' };

      await store.dispatch(otpApi.endpoints.resetPassword.initiate(data));

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/auth/reset-password');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.data).toEqual(data);
    });
  });
});
