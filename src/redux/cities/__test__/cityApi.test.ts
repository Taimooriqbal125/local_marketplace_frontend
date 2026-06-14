import { configureStore } from '@reduxjs/toolkit';
import { cityApi } from '../cityApi';
import { baseApi } from '../../api/baseApi';

/**
 * Type-safe mock for the base query arguments
 * RTK Query can pass either an object or a string to the base query
 */
interface MockBaseQueryObject {
  url: string;
  method: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

type MockBaseQueryArgs = MockBaseQueryObject | string;

// Mock the base query with a flexible return type
const mockBaseQuery = jest.fn((_args: MockBaseQueryArgs): any => ({ data: [] }));

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: MockBaseQueryArgs) => mockBaseQuery(args),
}));

describe('cityApi', () => {
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
    expect(cityApi.endpoints.getAllCities).toBeDefined();
    expect(cityApi.endpoints.getCityById).toBeDefined();
    expect(cityApi.endpoints.getCityBySlug).toBeDefined();
    expect(cityApi.endpoints.createCity).toBeDefined();
    expect(cityApi.endpoints.updateCity).toBeDefined();
    expect(cityApi.endpoints.deleteCity).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('getAllCities should call baseQuery with correct parameters', async () => {
      const promise = store.dispatch(cityApi.endpoints.getAllCities.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/cities/');
      expect(firstCallArgs.method).toBe('GET');

      promise.unsubscribe();
    });

    it('getCityById should call baseQuery with correct cityId', async () => {
      const cityId = 'city_123';
      const promise = store.dispatch(cityApi.endpoints.getCityById.initiate(cityId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe(`/cities/${cityId}`);

      promise.unsubscribe();
    });

    it('getCityBySlug should call baseQuery with correct slug', async () => {
      const slug = 'london';
      const promise = store.dispatch(cityApi.endpoints.getCityBySlug.initiate(slug));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe(`/cities/slug/${slug}`);

      promise.unsubscribe();
    });

    it('createCity should call baseQuery with correct payload', async () => {
      const cityData = { name: 'Paris', country: 'France' };
      const promise = store.dispatch(cityApi.endpoints.createCity.initiate(cityData));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/cities/');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.data).toEqual(cityData);
    });

    it('updateCity should call baseQuery with correct ID and data', async () => {
      const cityId = '456';
      const cityData = { name: 'Updated Paris' };
      const promise = store.dispatch(cityApi.endpoints.updateCity.initiate({ cityId, cityData }));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/cities/${cityId}`);
      expect(firstCallArgs.method).toBe('PATCH');
      expect(firstCallArgs.data).toEqual(cityData);
    });

    it('deleteCity should call baseQuery with correct ID', async () => {
      const cityId = '789';
      const promise = store.dispatch(cityApi.endpoints.deleteCity.initiate(cityId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/cities/${cityId}`);
      expect(firstCallArgs.method).toBe('DELETE');
    });
  });
});
