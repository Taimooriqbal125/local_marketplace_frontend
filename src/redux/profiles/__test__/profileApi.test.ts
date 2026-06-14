import { configureStore } from '@reduxjs/toolkit';
import { profileApi } from '../profileApi';
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

describe('profileApi', () => {
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
    expect(profileApi.endpoints.getMyProfile).toBeDefined();
    expect(profileApi.endpoints.createMyProfile).toBeDefined();
    expect(profileApi.endpoints.getMyLocation).toBeDefined();
    expect(profileApi.endpoints.updateMyLocation).toBeDefined();
    expect(profileApi.endpoints.getAllProfiles).toBeDefined();
    expect(profileApi.endpoints.getProfileByUserId).toBeDefined();
    expect(profileApi.endpoints.updateProfileByUserId).toBeDefined();
    expect(profileApi.endpoints.deleteProfileByUserId).toBeDefined();
  });

  describe('endpoint execution', () => {
    it('getMyProfile should call baseQuery with correct URL', async () => {
      const promise = store.dispatch(profileApi.endpoints.getMyProfile.initiate());
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe('/profiles/me');

      promise.unsubscribe();
    });

    it('createMyProfile should call baseQuery with multipart headers and FormData', async () => {
      const profileData = { bio: 'Developer' };
      const photoFile = { uri: 'test-uri', name: 'photo.jpg' };

      const promise = store.dispatch(
        profileApi.endpoints.createMyProfile.initiate({ profileData, photoFile }),
      );
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/profiles/');
      expect(firstCallArgs.method).toBe('POST');
      expect(firstCallArgs.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
      expect(firstCallArgs.data).toBeInstanceOf(FormData);
    });

    it('updateMyLocation should call baseQuery with PATCH configuration', async () => {
      const locationData = { latitude: 12.3, longitude: 45.6 };
      const promise = store.dispatch(profileApi.endpoints.updateMyLocation.initiate(locationData));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe('/profiles/me/location');
      expect(firstCallArgs.method).toBe('PATCH');
      expect(firstCallArgs.data).toEqual(locationData);
    });

    it('getProfileByUserId should call baseQuery with correct URL', async () => {
      const userId = 'user_999';
      const promise = store.dispatch(profileApi.endpoints.getProfileByUserId.initiate(userId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(firstCallArgs).toBe(`/profiles/${userId}`);
    });

    it('updateProfileByUserId should call baseQuery with PATCH and FormData', async () => {
      const userId = 'user_123';
      const profileData = { name: 'Updated Name' };

      const promise = store.dispatch(
        profileApi.endpoints.updateProfileByUserId.initiate({ userId, profileData }),
      );
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/profiles/${userId}`);
      expect(firstCallArgs.method).toBe('PATCH');
      expect(firstCallArgs.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
    });

    it('deleteProfileByUserId should call baseQuery with DELETE configuration', async () => {
      const userId = 'user_456';
      const promise = store.dispatch(profileApi.endpoints.deleteProfileByUserId.initiate(userId));
      await promise;

      const firstCallArgs = mockBaseQuery.mock.calls[0][0] as MockBaseQueryObject;
      expect(firstCallArgs.url).toBe(`/profiles/${userId}`);
      expect(firstCallArgs.method).toBe('DELETE');
    });
  });
});
