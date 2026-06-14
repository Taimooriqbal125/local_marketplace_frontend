/**
 * ListingBasicInfo Screen — Integration Test
 *
 * Tests the Step 1 of the listing creation/edit flow:
 *   - Rendering form fields (title, category, subcategory, city, description)
 *   - Location gate (blocks form until location is granted)
 *   - Client-side validation (6 rules)
 *   - Happy path: valid form → navigates to ListingDetails with serialized data
 *   - Edit mode: pre-fills form from existing listing data
 *
 * Real modules: Redux store + baseApi middleware + category/city/listing queries.
 * Mocked: network (axiosBaseQuery), device APIs (router, toast, storage, location).
 */
import React, { type PropsWithChildren } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import networkReducer from '@/redux/network/networkSlice';
import animationReducer from '@/redux/walkthrough/animationSlice';
import ListingBasicInfo from '../ListingBasicInfo';

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
jest.mock('@/storage', () => ({
  secureStore: {
    saveAuthTokens: jest.fn().mockResolvedValue(true),
    getAccessToken: jest.fn().mockResolvedValue(null),
    getRefreshToken: jest.fn().mockResolvedValue(null),
    clearAuthStorage: jest.fn().mockResolvedValue(true),
  },
  storage: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the storage module used directly by the component
jest.mock('@/storage/storage', () => ({
  storage: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: mockBack }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  Href: {},
}));

const mockShowErrorToast = jest.fn();
const mockShowSuccessToast = jest.fn();
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (...args: any[]) => mockShowErrorToast(...args),
  showSuccessToast: (...args: any[]) => mockShowSuccessToast(...args),
}));

jest.mock('@/hooks/useLocation', () => ({
  useLocation: () => ({
    requestAndSyncLocation: jest.fn().mockResolvedValue({ success: true }),
    loading: false,
  }),
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

jest.mock('@components/common/DropDown', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  /**
   * Mock CustomDropdown: renders a Pressable with the label text.
   * When pressed, it calls onChange with the first option's value
   * to simulate selection in integration tests.
   */
  const Mock = ({ label, onChange, options }: any) => {
    return R.createElement(
      RN.Pressable,
      {
        testID: `dropdown-${label}`,
        onPress: () => {
          if (options && options.length > 0) {
            onChange(options[0].value);
          }
        },
      },
      R.createElement(RN.Text, null, label),
      // Hidden text to help verify options count in tests if needed
      R.createElement(
        RN.Text,
        { testID: `dropdown-options-count-${label}` },
        options?.length?.toString() || '0',
      ),
    );
  };
  Mock.displayName = 'MockCustomDropdown';
  return Mock;
});

jest.mock('@/components/common/EnableLocationUI', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = ({ onEnable }: { onEnable: () => void }) =>
    R.createElement(
      RN.View,
      { testID: 'location-permission-ui' },
      R.createElement(RN.Text, null, 'Location Required'),
      R.createElement(
        RN.Pressable,
        { testID: 'enable-location-btn', onPress: onEnable },
        R.createElement(RN.Text, null, 'Enable Location'),
      ),
    );
  Mock.displayName = 'MockLocationPermissionUI';
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
  render(React.createElement(ListingBasicInfo), {
    wrapper: (props: PropsWithChildren) =>
      React.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('ListingBasicInfo Screen — Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();

    // Default: location is granted (storage returns valid cached coords)
    const { storage } = jest.requireMock('@/storage/storage');
    (storage.get as jest.Mock).mockResolvedValue({
      value: { latitude: 24.8, longitude: 67.0 },
      isStale: false,
    });

    // Simple but robust mockBaseQuery implementation
    mockBaseQuery.mockImplementation(async (args: any) => {
      const url = typeof args === 'string' ? args : args.url;
      const method = args.method || 'GET';

      console.log(`[Test Mock] Request: ${method} ${url}`);

      if (url === '/categories/parentcategories' && method === 'GET') {
        return { data: [] };
      }
      if (url?.includes('/children') && method === 'GET') {
        return { data: [] };
      }
      if (url === '/cities/' && method === 'GET') {
        return { data: [] };
      }
      if (url?.startsWith('/services/')) {
        return { data: {} };
      }
      return { data: {} };
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
    // jest.spyOn(console, 'log').mockImplementation(() => {}); // Keep logs for debugging failing tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    store.dispatch(baseApi.util.resetApiState());
    jest.restoreAllMocks();
    // Flush any pending promises/timers
    await new Promise((resolve) => setImmediate(resolve));
  });

  /* ============================================================== */
  /* 1. Rendering                                                    */
  /* ============================================================== */
  it('should render the create listing form when location is granted', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderScreen(store);

    // Wait for location check to resolve
    await waitFor(() => {
      expect(getByText('Basic Info')).toBeTruthy();
    });

    expect(getByPlaceholderText('e.g. Professional House Cleaning')).toBeTruthy();
    expect(getByPlaceholderText('Describe your service in detail...')).toBeTruthy();
    expect(getByTestId('dropdown-Category')).toBeTruthy();
    expect(getByTestId('dropdown-Subcategory')).toBeTruthy();
    expect(getByTestId('dropdown-City')).toBeTruthy();
    expect(getByText('Next Step')).toBeTruthy();
  });

  it('should show header with "Create Listing" when no id param', async () => {
    const { getByTestId } = renderScreen(store);

    await waitFor(() => {
      expect(getByTestId('header-title')).toBeTruthy();
    });

    expect(getByTestId('header-title').props.children).toBe('Create Listing');
  });

  /* ============================================================== */
  /* 2. Location gate                                                */
  /* ============================================================== */
  it('should show location permission UI when location is not granted', async () => {
    // Override: no cached location
    const { storage } = jest.requireMock('@/storage/storage');
    (storage.get as jest.Mock).mockResolvedValue(null);

    const { getByTestId, queryByText } = renderScreen(store);

    await waitFor(() => {
      expect(getByTestId('location-permission-ui')).toBeTruthy();
    });

    // Form should NOT be visible
    expect(queryByText('Basic Info')).toBeNull();
  });

  /* ============================================================== */
  /* 3. Client-side validation (6 rules)                             */
  /* ============================================================== */
  it('should show error when service title is empty', async () => {
    const { getByText } = renderScreen(store);

    await waitFor(() => {
      expect(getByText('Next Step')).toBeTruthy();
    });

    fireEvent.press(getByText('Next Step'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please enter a service title',
      'Validation Error',
      'alert-circle',
    );
  });

  it('should show error when category is not selected', async () => {
    const { getByText, getByPlaceholderText } = renderScreen(store);

    await waitFor(() => {
      expect(getByText('Next Step')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('e.g. Professional House Cleaning'), 'My Service');
    fireEvent.press(getByText('Next Step'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please select a category',
      'Validation Error',
      'alert-circle',
    );
  });

  it('should show error when description is empty', async () => {
    // Provide categories/subcategories/cities
    mockBaseQuery.mockImplementation(async (args: any) => {
      const url = typeof args === 'string' ? args : args.url;
      if (url === '/categories/parentcategories') {
        return { data: [{ id: 'cat-1', name: 'Cleaning', slug: 'cleaning' }] };
      }
      if (url === '/categories/parent/cat-1/children') {
        return { data: [{ id: 'sub-1', name: 'Deep Clean', slug: 'deep-clean' }] };
      }
      if (url === '/cities/') {
        return { data: [{ id: 'city-1', name: 'Karachi', slug: 'karachi' }] };
      }
      return { data: {} };
    });

    const { getByText, getByPlaceholderText, getByTestId } = renderScreen(store);

    await waitFor(() => {
      expect(getByText('Next Step')).toBeTruthy();
    });

    // Fill title
    fireEvent.changeText(getByPlaceholderText('e.g. Professional House Cleaning'), 'My Service');

    // Select category - Wait for options to be available
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-Category').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-Category'));

    // Wait for subcategories to load after category selection
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-Subcategory').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-Subcategory'));

    // Wait for cities to load
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-City').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-City'));

    // Press Next without filling description
    fireEvent.press(getByText('Next Step'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please enter a description',
      'Validation Error',
      'alert-circle',
    );
  });

  it('should show error when description is too short', async () => {
    mockBaseQuery.mockImplementation(async (args: any) => {
      const url = typeof args === 'string' ? args : args.url;
      if (url === '/categories/parentcategories') {
        return { data: [{ id: 'cat-1', name: 'Cleaning', slug: 'cleaning' }] };
      }
      if (url === '/categories/parent/cat-1/children') {
        return { data: [{ id: 'sub-1', name: 'Deep Clean', slug: 'deep-clean' }] };
      }
      if (url === '/cities/') {
        return { data: [{ id: 'city-1', name: 'Karachi', slug: 'karachi' }] };
      }
      return { data: {} };
    });

    const { getByText, getByPlaceholderText, getByTestId } = renderScreen(store);

    await waitFor(() => {
      expect(getByText('Next Step')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('e.g. Professional House Cleaning'), 'My Service');

    // Wait for categories
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-Category').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-Category'));

    // Wait for subcategories
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-Subcategory').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-Subcategory'));

    // Wait for cities
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-City').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-City'));

    // Short description (less than 50 chars)
    fireEvent.changeText(getByPlaceholderText('Describe your service in detail...'), 'Too short');

    fireEvent.press(getByText('Next Step'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Description must be at least 50 characters',
      'Validation Error',
      'alert-circle',
    );
  });

  /* ============================================================== */
  /* 4. Happy path — navigate to step 2                              */
  /* ============================================================== */
  it('should navigate to ListingDetails with serialized data on valid form', async () => {
    mockBaseQuery.mockImplementation(async (args: any) => {
      const url = typeof args === 'string' ? args : args.url;
      if (url === '/categories/parentcategories') {
        return { data: [{ id: 'cat-1', name: 'Cleaning', slug: 'cleaning' }] };
      }
      if (url === '/categories/parent/cat-1/children') {
        return { data: [{ id: 'sub-1', name: 'Deep Clean', slug: 'deep-clean' }] };
      }
      if (url === '/cities/') {
        return { data: [{ id: 'city-1', name: 'Karachi', slug: 'karachi' }] };
      }
      return { data: {} };
    });

    const { getByText, getByPlaceholderText, getByTestId } = renderScreen(store);

    await waitFor(() => {
      expect(getByText('Next Step')).toBeTruthy();
    });

    // Fill all fields
    fireEvent.changeText(
      getByPlaceholderText('e.g. Professional House Cleaning'),
      'Professional House Cleaning',
    );

    // Wait for categories
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-Category').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-Category'));

    // Wait for subcategories
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-Subcategory').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-Subcategory'));

    // Wait for cities
    await waitFor(() => {
      const count = getByTestId('dropdown-options-count-City').props.children;
      expect(parseInt(count)).toBeGreaterThan(0);
    });
    fireEvent.press(getByTestId('dropdown-City'));

    // Valid description (50+ chars)
    const longDescription =
      'This is a professional cleaning service that covers all areas of your home thoroughly.';
    fireEvent.changeText(
      getByPlaceholderText('Describe your service in detail...'),
      longDescription,
    );

    fireEvent.press(getByText('Next Step'));

    // Should navigate to ListingDetails with serialized data
    expect(mockPush).toHaveBeenCalled();
    const pushArgs = mockPush.mock.calls[0][0];
    expect(pushArgs.pathname).toBe('/(user)/ListingDetails');

    // Verify the serialized data
    const passedData = JSON.parse(pushArgs.params.listingData);
    expect(passedData.serviceTitle).toBe('Professional House Cleaning');
    expect(passedData.categoryId).toBe('cat-1');
    expect(passedData.subCategoryId).toBe('sub-1');
    expect(passedData.cityId).toBe('city-1');
    expect(passedData.description).toBe(longDescription);
  });

  /* ============================================================== */
  /* 5. Edit mode — pre-fills from existing listing                  */
  /* ============================================================== */
  it('should show "Edit Listing" header and pre-fill fields in edit mode', async () => {
    // Simulate edit mode by providing an `id` search param
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'listing-42' });

    // Mock listing data returned by getListingById
    mockBaseQuery.mockImplementation((args: any) => {
      if (args === '/services/listing-42') {
        return Promise.resolve({
          data: {
            id: 'listing-42',
            title: 'Existing Service',
            categoryId: 'cat-1',
            cityId: 'city-1',
            description:
              'An existing service description that is long enough to pass validation easily here.',
          },
        });
      }
      if (args.url === '/categories/' && args.method === 'GET') {
        return Promise.resolve({ data: [] });
      }
      if (args.url === '/cities/' && args.method === 'GET') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    const { getByTestId, getByPlaceholderText } = renderScreen(store);

    // Header should say "Edit Listing"
    await waitFor(() => {
      expect(getByTestId('header-title').props.children).toBe('Edit Listing');
    });

    // Title input should be pre-filled
    await waitFor(() => {
      expect(getByPlaceholderText('e.g. Professional House Cleaning').props.value).toBe(
        'Existing Service',
      );
    });
  });
});
