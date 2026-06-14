/**
 * PausedTab (My Listings) — Integration Test
 *
 * Tests the "My Listings" paused/draft view:
 *   1. Displays the user's paused listings.
 *   2. Verifies the "Activate" functionality (status -> active).
 *   3. Verifies the "Empty State" display.
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
import PausedTab from '../PausedTab';

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
  render(mockReact.createElement(PausedTab), {
    wrapper: (props: PropsWithChildren) =>
      mockReact.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('MyListings PausedTab — Integration', () => {
  let store: AppStore;

  const mockPausedListings = [
    {
      id: 'listing-paused-1',
      title: 'Old Painting Service',
      categoryName: 'Art',
      serviceLocation: 'New York',
      priceAmount: 100,
      priceType: 'fixed',
      updatedAt: '2023-09-10T10:00:00Z',
      isNegotiable: false,
      imageUrl: 'https://example.com/art.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    store = createTestStore();

    mockBaseQuery.mockImplementation(
      async (args: { url: string; method?: string; data?: any; params?: any }) => {
        const { url, method = 'GET', params } = args;

        // Fetch Paused Listings (status: draft)
        if (url.includes('/services/me') && method === 'GET' && params?.status === 'draft') {
          return { data: { results: mockPausedListings } };
        }

        // Update (Activate) Listing
        if (url.includes('/services/listing-paused-1') && method === 'PATCH') {
          return { data: { ...mockPausedListings[0], status: args.data.status } };
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

  it('should display paused listings correctly', async () => {
    const { findByText, getByText } = renderScreen(store);

    expect(await findByText('Old Painting Service')).toBeTruthy();
    expect(getByText('Art')).toBeTruthy();
    expect(getByText('New York')).toBeTruthy();
    expect(getByText(/\$100/)).toBeTruthy();
  });

  it('should allow activating a paused listing', async () => {
    const { findByTestId, findByText } = renderScreen(store);

    // In PausedTab, ListingCard uses pauseLabel="Activate"
    // Our updated ListingCard has testID="pause-button" for the action button
    const activateBtn = await findByTestId('pause-button');
    expect(await findByText('Activate')).toBeTruthy();

    fireEvent.press(activateBtn);

    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/services/listing-paused-1'),
          method: 'PATCH',
          data: expect.objectContaining({ status: 'active' }),
        }),
      );
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: 'Success',
        text2: expect.stringContaining('Active'),
      }),
    );
  });

  it('should display empty state when no paused listings exist', async () => {
    mockBaseQuery.mockResolvedValueOnce({ data: { results: [] } });

    const { findByText } = renderScreen(store);

    expect(await findByText('No Paused Listings')).toBeTruthy();
    expect(await findByText(/You don't have any drafted or paused listings/)).toBeTruthy();
  });
});
