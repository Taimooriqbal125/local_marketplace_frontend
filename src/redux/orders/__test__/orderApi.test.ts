import { configureStore } from '@reduxjs/toolkit';
import { orderApi } from '../orderApi';
import { baseApi } from '../../api/baseApi';

/**
 * Type-safe mock for the base query arguments
 */
interface MockBaseQueryObject {
  url: string;
  method: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

type MockBaseQueryArgs = MockBaseQueryObject | string;

// Mock the base query
const mockBaseQuery = jest.fn((_args: MockBaseQueryArgs): any => ({ data: [] }));

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: MockBaseQueryArgs) => mockBaseQuery(args),
}));

describe('orderApi', () => {
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
    expect(orderApi.endpoints.getMyOrdersAsBuyer).toBeDefined();
    expect(orderApi.endpoints.getMyOrdersAsSeller).toBeDefined();
    expect(orderApi.endpoints.getRequestedOrdersAsBuyer).toBeDefined();
    expect(orderApi.endpoints.getRequestedOrdersAsSeller).toBeDefined();
    expect(orderApi.endpoints.getActiveOrdersAsBuyer).toBeDefined();
    expect(orderApi.endpoints.getActiveOrdersAsSeller).toBeDefined();
    expect(orderApi.endpoints.getCompletedOrdersAsBuyer).toBeDefined();
    expect(orderApi.endpoints.getCompletedOrdersAsSeller).toBeDefined();
    expect(orderApi.endpoints.getCancelledOrdersAsBuyer).toBeDefined();
    expect(orderApi.endpoints.getCancelledOrdersAsSeller).toBeDefined();
    expect(orderApi.endpoints.getOrderById).toBeDefined();
    expect(orderApi.endpoints.createOrder).toBeDefined();
    expect(orderApi.endpoints.updateOrder).toBeDefined();
    expect(orderApi.endpoints.cancelOrderRequest).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('getMyOrdersAsBuyer should call baseQuery with GET and correct URL/params', async () => {
      const params = { page: 1 };
      const promise = store.dispatch(orderApi.endpoints.getMyOrdersAsBuyer.initiate(params));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/me/as-buyer');
      expect(firstCallArgs.method).toBe('GET');
      expect(firstCallArgs.params).toEqual(params);

      promise.unsubscribe();
    });

    it('getMyOrdersAsSeller should call baseQuery with GET and correct URL', async () => {
      const promise = store.dispatch(orderApi.endpoints.getMyOrdersAsSeller.initiate({}));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/me/as-seller');
      expect(firstCallArgs.method).toBe('GET');

      promise.unsubscribe();
    });

    it('getRequestedOrdersAsBuyer should include status=requested param', async () => {
      const promise = store.dispatch(orderApi.endpoints.getRequestedOrdersAsBuyer.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/me/as-buyer');
      expect(firstCallArgs.params).toEqual({ status: 'requested' });

      promise.unsubscribe();
    });

    it('getActiveOrdersAsSeller should include status=accepted param', async () => {
      const promise = store.dispatch(orderApi.endpoints.getActiveOrdersAsSeller.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/me/as-seller');
      expect(firstCallArgs.params).toEqual({ status: 'accepted' });

      promise.unsubscribe();
    });

    it('getCompletedOrdersAsBuyer should include status=completed param', async () => {
      const promise = store.dispatch(orderApi.endpoints.getCompletedOrdersAsBuyer.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/me/as-buyer');
      expect(firstCallArgs.params).toEqual({ status: 'completed' });

      promise.unsubscribe();
    });

    it('getCancelledOrdersAsSeller should include status=cancelled param', async () => {
      const promise = store.dispatch(orderApi.endpoints.getCancelledOrdersAsSeller.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/me/as-seller');
      expect(firstCallArgs.params).toEqual({ status: 'cancelled' });

      promise.unsubscribe();
    });

    it('getOrderById should call baseQuery with correct URL', async () => {
      const orderId = 'order_123';
      const promise = store.dispatch(orderApi.endpoints.getOrderById.initiate(orderId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/orders/${orderId}`);
      expect(firstCallArgs.method).toBe('GET');

      promise.unsubscribe();
    });

    it('createOrder should call baseQuery with POST and correct data', async () => {
      const newOrder = { listingId: 'list_123', requirements: 'Fix bug' };
      const promise = store.dispatch(orderApi.endpoints.createOrder.initiate(newOrder as any));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.data).toEqual(newOrder);
    });

    it('updateOrder should call baseQuery with PATCH configuration', async () => {
      const updateData = { status: 'accepted' };
      const promise = store.dispatch(
        orderApi.endpoints.updateOrder.initiate({ id: 'order_456', data: updateData as any }),
      );
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/orders/order_456');
      expect(firstCallArgs.method).toBe('PATCH');
      expect(firstCallArgs.data).toEqual(updateData);
    });

    it('cancelOrderRequest should call baseQuery with DELETE configuration', async () => {
      const orderId = 'order_789';
      const promise = store.dispatch(orderApi.endpoints.cancelOrderRequest.initiate(orderId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/orders/${orderId}/cancel-request`);
      expect(firstCallArgs.method).toBe('DELETE');
    });
  });
});
