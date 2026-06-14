import { configureStore } from '@reduxjs/toolkit';
import { listingApi } from '../listingApi';
import { baseApi } from '../../api/baseApi';
import * as cacheUtils from '../../api/cacheUtils';

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

// Mock cache utility
jest.mock('../../api/cacheUtils', () => ({
  saveQueryToCache: jest.fn(() => Promise.resolve()),
}));

describe('listingApi', () => {
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
    (cacheUtils.saveQueryToCache as jest.Mock).mockClear();
    store = createTestStore();
  });

  afterEach(() => {
    store.dispatch(baseApi.util.resetApiState());
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should have all expected endpoints injected', () => {
    expect(listingApi.endpoints.getAllListings).toBeDefined();
    expect(listingApi.endpoints.getNearbyListingsFromProfile).toBeDefined();
    expect(listingApi.endpoints.getListingById).toBeDefined();
    expect(listingApi.endpoints.getMyListings).toBeDefined();
    expect(listingApi.endpoints.createListing).toBeDefined();
    expect(listingApi.endpoints.updateListing).toBeDefined();
    expect(listingApi.endpoints.deleteListing).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('getAllListings should call baseQuery and trigger cache save', async () => {
      const mockData = [{ id: '1', title: 'Test Listing' }];
      mockBaseQuery.mockImplementationOnce(() => Promise.resolve({ data: mockData }));

      const params = { limit: 20, search: 'test' };
      const promise = store.dispatch(listingApi.endpoints.getAllListings.initiate(params));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/services/');
      expect(firstCallArgs.method).toBe('GET');
      expect(firstCallArgs.params).toEqual(params);

      // Verify cache utility was called
      expect(cacheUtils.saveQueryToCache).toHaveBeenCalled();

      promise.unsubscribe();
    });

    it('getListingById should call baseQuery with correct URL', async () => {
      const id = 'listing_123';
      const promise = store.dispatch(listingApi.endpoints.getListingById.initiate(id));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe(`/services/${id}`);

      promise.unsubscribe();
    });

    it('createListing should call baseQuery with multipart headers', async () => {
      const formData = new FormData();
      formData.append('title', 'New Listing');

      const promise = store.dispatch(listingApi.endpoints.createListing.initiate(formData));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/services/');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
      expect(firstCallArgs.data).toBe(formData);
    });

    it('updateListing should call baseQuery with correct ID and data', async () => {
      const id = '456';
      const updateData = { title: 'Updated Title' };

      const promise = store.dispatch(
        listingApi.endpoints.updateListing.initiate({ id, data: updateData }),
      );
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/services/${id}`);
      expect(firstCallArgs.method).toBe('PATCH');
      expect(firstCallArgs.data).toEqual(updateData);
      expect(firstCallArgs.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
    });

    it('deleteListing should call baseQuery with correct ID', async () => {
      const id = '789';
      const promise = store.dispatch(listingApi.endpoints.deleteListing.initiate(id));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/services/${id}`);
      expect(firstCallArgs.method).toBe('DELETE');
    });
  });
});
