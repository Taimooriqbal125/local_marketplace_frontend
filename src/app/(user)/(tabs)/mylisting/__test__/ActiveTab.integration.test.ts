/**
 * ActiveTab (My Listings) — Integration Test
 *
 * Tests the "My Listings" active view:
 *   1. Displays the user's active listings.
 *   2. Verifies the "Pause" functionality (status -> draft).
 *   3. Verifies navigation to Edit and View screens.
 *   4. Verifies the "Empty State" display.
 *
 * Mocked: axiosBaseQuery, expo-router, react-native-toast-message, and animations.
 */
import React, { type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import ActiveTab from '../ActiveTab';

// Reference variables with 'mock' prefix for Jest hoisting
const mockReact = React;
const mockView = View;

/* ------------------------------------------------------------------ */
/* Mock network layer                                                  */
/* ------------------------------------------------------------------ */
const mockBaseQuery = jest.fn();

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: { url: string; method?: string; data?: any; params?: any }) =>
    mockBaseQuery(args),
}));

/* ------------------------------------------------------------------ */
/* Mock device/UI APIs                                                 */
/* ------------------------------------------------------------------ */
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockShowToast = jest.fn();
jest.mock('react-native-toast-message', () => ({
  show: (args: any) => mockShowToast(args),
  default: {
    show: (args: any) => mockShowToast(args),
  },
}));

// Mock animations
jest.mock('@components/animations/AppLoadingAnimation', () => {
  const Mock = (props: any) =>
    mockReact.createElement(mockView, { testID: 'loading-animation', ...props });
  Mock.displayName = 'MockAppLoadingAnimation';
  return Mock;
});

// Mock Icons to avoid native issues
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

/**
 * Store & Render Helpers
 */
const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(baseApi.middleware),
  });

type AppStore = ReturnType<typeof createTestStore>;

interface WrapperProps extends PropsWithChildren {
  store: AppStore;
}

const Wrapper = ({ children, store }: WrapperProps) =>
  mockReact.createElement(Provider, { store: store as any } as any, children);

const renderScreen = (testStore: AppStore) =>
  render(mockReact.createElement(ActiveTab), {
    wrapper: (props: PropsWithChildren) =>
      mockReact.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('MyListings ActiveTab — Integration', () => {
  let store: AppStore;

  const mockListings = [
    {
      id: 'listing-1',
      title: 'Professional Cleaning',
      categoryName: 'Cleaning',
      serviceLocation: 'London',
      priceAmount: 50,
      priceType: 'hourly',
      updatedAt: '2023-10-20T10:00:00Z',
      isNegotiable: true,
      imageUrl: 'https://example.com/img.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    store = createTestStore();

    mockBaseQuery.mockImplementation(
      async (args: { url: string; method?: string; data?: any; params?: any }) => {
        const { url, method = 'GET', params } = args;

        // Fetch Listings
        if (url.includes('/services/me') && method === 'GET' && params?.status === 'active') {
          return { data: { results: mockListings } };
        }

        // Update (Pause) Listing
        if (url.includes('/services/listing-1') && method === 'PATCH') {
          return { data: { ...mockListings[0], status: args.data.status } };
        }

        return { data: { results: [] } };
      },
    );
  });

  afterEach(() => {
    act(() => {
      store.dispatch(baseApi.util.resetApiState());
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should display active listings correctly', async () => {
    const { findByText, getByText } = renderScreen(store);

    expect(await findByText('Professional Cleaning')).toBeTruthy();
    expect(getByText('Cleaning')).toBeTruthy();
    expect(getByText('London')).toBeTruthy();
    // Using regex to match price as it might be part of a larger string
    expect(getByText(/\$50/)).toBeTruthy();
  });

  it('should navigate to Edit screen when Edit is pressed', async () => {
    const { findByTestId } = renderScreen(store);

    // Assuming ListingCard has testIDs for buttons or identifiable text
    // Based on RequestedOrders pattern, we use text or testIDs.
    // Let's find by text "Edit" if available, or use fireEvent on buttons.
    const editBtn = await findByTestId('edit-button');
    fireEvent.press(editBtn);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(user)/ListingBasicInfo',
      params: { id: 'listing-1' },
    });
  });

  it('should allow pausing a listing', async () => {
    const { findByTestId } = renderScreen(store);

    const pauseBtn = await findByTestId('pause-button');
    fireEvent.press(pauseBtn);

    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/services/listing-1'),
          method: 'PATCH',
          data: expect.objectContaining({ status: 'draft' }),
        }),
      );
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: 'Success',
        text2: expect.stringContaining('paused'),
      }),
    );
  });

  it('should navigate to View screen when clicking the card/view', async () => {
    const { findByTestId } = renderScreen(store);

    const viewBtn = await findByTestId('view-button');
    fireEvent.press(viewBtn);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(user)/ViewListing',
      params: { id: 'listing-1' },
    });
  });

  it('should display empty state when no active listings exist', async () => {
    // Mock empty response
    mockBaseQuery.mockResolvedValueOnce({ data: { results: [] } });

    const { findByText } = renderScreen(store);

    expect(await findByText('No Active Listings')).toBeTruthy();
    expect(await findByText(/You don't have any active listings/)).toBeTruthy();
  });
});
