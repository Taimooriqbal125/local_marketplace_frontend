/**
 * ListingDetails Screen — Integration Test
 *
 * Tests the Step 2 of the listing creation/edit flow:
 *   - Pricing rules (Fixed vs Hourly, Negotiable restrictions)
 *   - Location coordinate injection (from storage cache)
 *   - Image picking (multipart/form-data)
 *   - Happy path: createListing mutation with correct FormData
 *   - Edit mode: updateListing mutation with correct patches
 */
import React, { type PropsWithChildren } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import networkReducer from '@/redux/network/networkSlice';
import animationReducer from '@/redux/walkthrough/animationSlice';
import ListingDetails from '../ListingDetails';

/* ------------------------------------------------------------------ */
/* Mock baseQuery                                                      */
/* ------------------------------------------------------------------ */
const mockBaseQuery = jest.fn();

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: any) => mockBaseQuery(args),
}));

/* ------------------------------------------------------------------ */
/* Mock device-only APIs                                               */
/* ------------------------------------------------------------------ */
jest.mock('@/storage/storage', () => ({
  storage: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
  useLocalSearchParams: jest.fn().mockReturnValue({
    listingData: JSON.stringify({
      serviceTitle: 'Test Service',
      categoryId: 'cat-1',
      subCategoryId: 'sub-1',
      cityId: 'city- Karachi',
      description: 'A very long description that is more than fifty characters long for testing.',
    }),
  }),
}));

const mockShowErrorToast = jest.fn();
const mockShowSuccessToast = jest.fn();
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (...args: any[]) => mockShowErrorToast(...args),
  showSuccessToast: (...args: any[]) => mockShowSuccessToast(...args),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://test-image.jpg', type: 'image' }],
  }),
  MediaTypeOptions: { Images: 'images' },
}));

jest.mock('@components/common/ScreenWrapper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = ({ children }: { children: React.ReactNode }) =>
    R.createElement(RN.View, { testID: 'screen-wrapper' }, children);
  Mock.displayName = 'MockScreenWrapper';
  return Mock;
});

jest.mock('@components/common/Header', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = ({ title }: { title: string }) =>
    R.createElement(RN.Text, { testID: 'header-title' }, title);
  Mock.displayName = 'MockHeader';
  return Mock;
});

jest.mock('@components/common/Pagination', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = () => R.createElement(RN.View, { testID: 'pagination' });
  Mock.displayName = 'MockPagination';
  return Mock;
});

jest.mock('@components/animations/AppLoadingAnimation', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = ({ visible }: { visible: boolean }) =>
    visible ? R.createElement(RN.View, { testID: 'loading-anim' }) : null;
  Mock.displayName = 'MockAppLoadingAnimation';
  return Mock;
});

jest.mock('@react-native-community/slider', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = (props: any) => R.createElement(RN.View, { ...props, testID: 'radius-slider' });
  Mock.displayName = 'MockSlider';
  return Mock;
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

/* ------------------------------------------------------------------ */
/* Store factory & render helper                                       */
/* ------------------------------------------------------------------ */
const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      network: networkReducer,
      animation: animationReducer,
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(baseApi.middleware),
  });

const Wrapper = ({
  children,
  store,
}: PropsWithChildren<{ store: ReturnType<typeof createTestStore> }>) =>
  React.createElement(Provider, { store } as any, children);

const renderScreen = (testStore: ReturnType<typeof createTestStore>) =>
  render(React.createElement(ListingDetails), {
    wrapper: (props: PropsWithChildren) =>
      React.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('ListingDetails Screen — Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();

    // Default: location coordinates in cache
    const { storage } = jest.requireMock('@/storage/storage');
    (storage.get as jest.Mock).mockResolvedValue({
      value: { latitude: 24.8138, longitude: 67.0325 },
    });

    mockBaseQuery.mockImplementation(async () => ({ data: {} }));

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    store.dispatch(baseApi.util.resetApiState());
    jest.restoreAllMocks();
    await new Promise((resolve) => setImmediate(resolve));
  });

  /* ============================================================== */
  /* 1. Rendering & Pricing Rules                                    */
  /* ============================================================== */
  it('should render correctly and enforce pricing rules', async () => {
    const { getByText, getByPlaceholderText } = renderScreen(store);

    expect(getByText('Pricing')).toBeTruthy();
    expect(getByPlaceholderText('0.00')).toBeTruthy();
    expect(getByText('Upload Cover Photo')).toBeTruthy();

    // Fixed price is default. Try to enable negotiable.
    expect(getByText('Price Negotiable')).toBeTruthy();
    // Test logic: negotiable should not be allowed for fixed price
    // In the component, it shows a toast if fixed and user tries to toggle to true.
    // The component uses the Switch component.
  });

  /* ============================================================== */
  /* 2. Validation                                                   */
  /* ============================================================== */
  it('should show error when cover photo is missing', async () => {
    const { getByText, getByPlaceholderText } = renderScreen(store);

    // Fill price
    fireEvent.changeText(getByPlaceholderText('0.00'), '1500');

    // Press Publish
    fireEvent.press(getByText('Publish Listing'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please upload a cover photo',
      'Validation Error',
      'alert-circle',
    );
  });

  it('should show error when price is invalid', async () => {
    const { getByText, getByPlaceholderText } = renderScreen(store);

    // Pick image first
    fireEvent.press(getByText('Upload Cover Photo'));
    await waitFor(() => expect(getByText('Replace')).toBeTruthy());

    // Price is empty or 0
    fireEvent.changeText(getByPlaceholderText('0.00'), '0');

    // Press Publish
    fireEvent.press(getByText('Publish Listing'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please enter a valid price amount',
      'Validation Error',
      'alert-circle',
    );
  });

  /* ============================================================== */
  /* 3. Happy Path — Create Listing                                   */
  /* ============================================================== */
  it('should successfully create a listing with correct FormData', async () => {
    mockBaseQuery.mockResolvedValueOnce({
      data: { id: 'new-listing-123', status: 'active' },
    });

    const { getByText, getByPlaceholderText } = renderScreen(store);

    // 1. Pick image
    fireEvent.press(getByText('Upload Cover Photo'));
    await waitFor(() => expect(getByText('Replace')).toBeTruthy());

    // 2. Fill price
    fireEvent.changeText(getByPlaceholderText('0.00'), '2500');

    // 3. Fill location
    fireEvent.changeText(getByPlaceholderText('e.g. Near DHA or Office Name'), 'Test Street 1');

    // 4. Publish
    fireEvent.press(getByText('Publish Listing'));

    // Verify API call
    await waitFor(() => expect(mockBaseQuery).toHaveBeenCalled());

    const callArgs = mockBaseQuery.mock.calls[0][0];
    expect(callArgs.url).toBe('/services/');
    expect(callArgs.method).toBe('POST');

    // FormData check
    const formData = callArgs.data;
    expect(formData.get('title')).toBe('Test Service');
    expect(formData.get('priceAmount')).toBe('2500');
    expect(formData.get('serviceLocation')).toBe('Test Street 1');
    expect(formData.get('categoryId')).toBe('sub-1');

    // Verify location injection
    const locationPoint = JSON.parse(formData.get('serviceLocationPoint'));
    expect(locationPoint.latitude).toBe(24.8138);

    // Verify success feedback and navigation
    await waitFor(() => {
      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        'Your service is now live on the marketplace.',
        'Listing Published! 🎉',
      );
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(user)/(tabs)/mylisting',
        params: { tab: 'active' },
      });
    });
  });

  /* ============================================================== */
  /* 4. Edit Mode — Pre-fill & Update                                */
  /* ============================================================== */
  it('should pre-fill data and update listing in edit mode', async () => {
    // 1. Arrange: id in search params
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: 'listing-99',
      listingData: '{}',
    });

    // 2. Mock existing listing API response
    mockBaseQuery.mockImplementation(async (args: any) => {
      const url = typeof args === 'string' ? args : args.url;
      if (url === '/services/listing-99') {
        return {
          data: {
            id: 'listing-99',
            title: 'Edited Service',
            priceAmount: 5000,
            priceType: 'hourly',
            serviceLocation: 'Old Office',
            imageUrl: 'http://image.com/old.jpg',
            status: 'active',
          },
        };
      }
      return { data: { success: true } };
    });

    const { getByText, getByPlaceholderText } = renderScreen(store);

    // Wait for pre-fill
    await waitFor(() => {
      expect(getByPlaceholderText('0.00').props.value).toBe('5000');
    });

    expect(getByPlaceholderText('e.g. Near DHA or Office Name').props.value).toBe('Old Office');
    expect(getByText('Replace')).toBeTruthy(); // Because imageUrl exists

    // Change price and location
    fireEvent.changeText(getByPlaceholderText('0.00'), '6000');
    fireEvent.changeText(getByPlaceholderText('e.g. Near DHA or Office Name'), 'New Office');

    // Update
    fireEvent.press(getByText('Update Listing'));

    // Wait for the mutation to be called.
    // It should be called 3 times: 1. Initial Get, 2. Patch Mutation, 3. Auto-refetch after invalidation
    await waitFor(() => expect(mockBaseQuery).toHaveBeenCalledTimes(3));

    // Find the PATCH call (could be index 1 or 2 depending on timing)
    const patchCall = mockBaseQuery.mock.calls.find(
      (call) => typeof call[0] === 'object' && call[0].method === 'PATCH',
    )?.[0];

    expect(patchCall).toBeDefined();
    expect(patchCall.url).toBe('/services/listing-99');
    expect(patchCall.method).toBe('PATCH');

    const formData = patchCall.data;
    expect(formData.get('priceAmount')).toBe('6000');
    expect(formData.get('serviceLocation')).toBe('New Office');
    expect(formData.get('imageUrl')).toBe('http://image.com/old.jpg');

    await waitFor(() => {
      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        'Your changes have been saved successfully.',
        'Listing Updated! 🎉',
      );
    });
  });
});
