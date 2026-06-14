import { configureStore } from '@reduxjs/toolkit';
import { categoryApi } from '../categoryApi';
import { baseApi } from '../../api/baseApi';
import * as cacheUtils from '../../api/cacheUtils';

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

// Mock the base query with a more flexible type
const mockBaseQuery = jest.fn((_args: MockBaseQueryArgs): any => ({ data: [] }));

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: MockBaseQueryArgs) => mockBaseQuery(args),
}));

// Mock cache utility
jest.mock('../../api/cacheUtils', () => ({
  saveQueryToCache: jest.fn(() => Promise.resolve()),
}));

describe('categoryApi', () => {
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
    expect(categoryApi.endpoints.getAllCategories).toBeDefined();
    expect(categoryApi.endpoints.getParentCategories).toBeDefined();
    expect(categoryApi.endpoints.getCategoryTree).toBeDefined();
    expect(categoryApi.endpoints.getSubCategories).toBeDefined();
    expect(categoryApi.endpoints.getCategoryById).toBeDefined();
    expect(categoryApi.endpoints.getCategoryBySlug).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('getAllCategories should call baseQuery with correct parameters', async () => {
      const params = { limit: 10 };
      const promise = store.dispatch(categoryApi.endpoints.getAllCategories.initiate(params));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/categories/');
      expect(firstCallArgs.method).toBe('GET');
      expect(firstCallArgs.params).toEqual(params);

      promise.unsubscribe();
    });

    it('getParentCategories should call baseQuery and trigger cache save', async () => {
      const mockData = [{ id: '1', name: 'Electronics' }];
      // Use mockImplementation to avoid 'never' type issue with mockResolvedValue
      mockBaseQuery.mockImplementationOnce(() => Promise.resolve({ data: mockData }));

      const promise = store.dispatch(categoryApi.endpoints.getParentCategories.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe('/categories/parentcategories');

      // Verify cache utility was called (RTK Query lifecycle hook)
      expect(cacheUtils.saveQueryToCache).toHaveBeenCalledWith(
        expect.any(String),
        mockData,
        expect.any(Number),
      );

      promise.unsubscribe();
    });

    it('getCategoryTree should call baseQuery with correct parameters', async () => {
      const promise = store.dispatch(categoryApi.endpoints.getCategoryTree.initiate({}));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/categories/tree/');
      expect(firstCallArgs.method).toBe('GET');

      promise.unsubscribe();
    });

    it('getSubCategories should call baseQuery with correct parentId', async () => {
      const parentId = 'cat_123';
      const promise = store.dispatch(categoryApi.endpoints.getSubCategories.initiate(parentId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe(`/categories/parent/${parentId}/children`);

      promise.unsubscribe();
    });

    it('getCategoryById should call baseQuery with correct ID', async () => {
      const id = '123';
      const promise = store.dispatch(categoryApi.endpoints.getCategoryById.initiate(id));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe(`/categories/${id}`);

      promise.unsubscribe();
    });

    it('getCategoryBySlug should call baseQuery with correct slug', async () => {
      const slug = 'electronics-stuff';
      const promise = store.dispatch(categoryApi.endpoints.getCategoryBySlug.initiate(slug));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe(`/categories/slug/${slug}`);

      promise.unsubscribe();
    });
  });
});
