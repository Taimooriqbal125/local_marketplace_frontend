import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../authApi';
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
const mockBaseQuery = jest.fn((_args: MockBaseQueryArgs) => ({ data: {} }));

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: MockBaseQueryArgs) => mockBaseQuery(args),
}));

describe('authApi', () => {
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
    expect(authApi.endpoints.login).toBeDefined();
    expect(authApi.endpoints.register).toBeDefined();
    expect(authApi.endpoints.getUserById).toBeDefined();
    expect(authApi.endpoints.updateUser).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('login should call baseQuery with correct parameters', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };

      const promise = store.dispatch(authApi.endpoints.login.initiate(credentials));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/users/login');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
      expect(firstCallArgs.data).toBeInstanceOf(FormData);
    });

    it('register should call baseQuery with correct parameters', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '123',
      };

      const promise = store.dispatch(authApi.endpoints.register.initiate(userData));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/users/signup');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.data).toEqual(userData);
    });

    it('getUserById should call baseQuery with correct parameters', async () => {
      const userId = '123';

      const promise = store.dispatch(authApi.endpoints.getUserById.initiate(userId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/users/123');
      expect(firstCallArgs.method).toBe('GET');

      // Unsubscribe to clear internal timers for queries
      promise.unsubscribe();
    });

    it('updateUser should call baseQuery with correct parameters', async () => {
      const updateData = { userId: '123', name: 'Updated Name' };

      const promise = store.dispatch(authApi.endpoints.updateUser.initiate(updateData));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryArgs;
      expect(firstCallArgs.url).toBe('/users/123');
      expect(firstCallArgs.method).toBe('PATCH');
      expect(firstCallArgs.data).toEqual({ name: 'Updated Name' });
    });
  });
});
