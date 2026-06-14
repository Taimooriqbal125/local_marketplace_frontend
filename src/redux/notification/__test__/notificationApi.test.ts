import { configureStore } from '@reduxjs/toolkit';
import { notificationApi } from '../notificationApi';
import { baseApi } from '../../api/baseApi';

/**
 * Type-safe mock for the base query arguments
 */
interface MockBaseQueryObject {
  url: string;
  method: string;
  data?: any;
  params?: any;
}

type MockBaseQueryArgs = MockBaseQueryObject | string;

// Mock the base query
const mockBaseQuery = jest.fn((_args: MockBaseQueryArgs): any => ({ data: [] }));

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: MockBaseQueryArgs) => mockBaseQuery(args),
}));

describe('notificationApi', () => {
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
    expect(notificationApi.endpoints.getNotifications).toBeDefined();
    expect(notificationApi.endpoints.markAsRead).toBeDefined();
    expect(notificationApi.endpoints.deleteNotification).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('getNotifications should call baseQuery with correct URL', async () => {
      const promise = store.dispatch(notificationApi.endpoints.getNotifications.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/notifications');
      expect(firstCallArgs.method).toBe('GET');

      promise.unsubscribe();
    });

    it('markAsRead should call baseQuery with correct PATCH configuration', async () => {
      const id = 'notif_123';
      const promise = store.dispatch(notificationApi.endpoints.markAsRead.initiate(id));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/notifications/${id}`);
      expect(firstCallArgs.method).toBe('PATCH');
    });

    it('deleteNotification should call baseQuery with correct DELETE configuration', async () => {
      const id = 'notif_456';
      const promise = store.dispatch(notificationApi.endpoints.deleteNotification.initiate(id));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/notifications/${id}`);
      expect(firstCallArgs.method).toBe('DELETE');
    });

    it('markAllAsRead should call baseQuery with correct PATCH configuration', async () => {
      const promise = store.dispatch(notificationApi.endpoints.markAllAsRead.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/notifications/mark-all-as-read/');
      expect(firstCallArgs.method).toBe('PATCH');
    });
  });

  describe('optimistic updates', () => {
    it('markAsRead should optimistically update the cache', async () => {
      const notificationId = '1';
      const initialData = [{ id: notificationId, isRead: false, title: 'Test' }];

      // 1. Initialize the cache entry by performing a fetch (mocked)
      mockBaseQuery.mockResolvedValueOnce({ data: initialData });
      await store.dispatch(notificationApi.endpoints.getNotifications.initiate());

      // 2. Trigger the mutation (optimistic)
      store.dispatch(notificationApi.endpoints.markAsRead.initiate(notificationId));

      // 3. Check the cache immediately
      const cacheSelector = notificationApi.endpoints.getNotifications.select();
      const cacheState = cacheSelector(store.getState());

      expect(cacheState.data?.[0].isRead).toBe(true);
    });

    it('deleteNotification should optimistically remove from cache', async () => {
      const notificationId = '1';
      const initialData = [{ id: notificationId, isRead: false, title: 'Test' }];

      // 1. Initialize the cache entry
      mockBaseQuery.mockResolvedValueOnce({ data: initialData });
      await store.dispatch(notificationApi.endpoints.getNotifications.initiate());

      // 2. Trigger the mutation
      store.dispatch(notificationApi.endpoints.deleteNotification.initiate(notificationId));

      // 3. Check the cache
      const cacheSelector = notificationApi.endpoints.getNotifications.select();
      const cacheState = cacheSelector(store.getState());

      expect(cacheState.data?.length).toBe(0);
    });
  });
});
