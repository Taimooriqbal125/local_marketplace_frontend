/**
 * CancelledTab (Order History - Cancelled) — Integration Test
 *
 * Tests the cancelled orders view:
 *   1. Displays cancelled orders for both Buyer and Seller.
 *   2. Verifies role switching via ToggleButton.
 *   3. Verifies error handling when fetching fails.
 *
 * Mocked: axiosBaseQuery, expo-router, toasts, and animations.
 */
import React, { type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import CancelledTab from '../Cancelled';

// Reference variables with 'mock' prefix for Jest hoisting
const mockReact = React;
const mockView = View;

/* ------------------------------------------------------------------ */
/* Mock network layer                                                  */
/* ------------------------------------------------------------------ */
const mockBaseQuery = jest.fn();

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: { url: string; method?: string; params?: any }) =>
    mockBaseQuery(args),
}));

/* ------------------------------------------------------------------ */
/* Mock device/UI APIs                                                 */
/* ------------------------------------------------------------------ */
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

const mockShowErrorToast = jest.fn();
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (message: string, title?: string) => mockShowErrorToast(message, title),
}));

// Mock animations
jest.mock('@components/animations/AppLoadingAnimation', () => {
  const Mock = (props: any) =>
    mockReact.createElement(mockView, { testID: 'loading-animation', ...props });
  Mock.displayName = 'MockAppLoadingAnimation';
  return Mock;
});

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
  render(mockReact.createElement(CancelledTab), {
    wrapper: (props: PropsWithChildren) =>
      mockReact.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('CancelledTab — Integration', () => {
  let store: AppStore;

  const mockCancelledOrders = [
    {
      id: 'canc-1',
      status: 'cancelled',
      serviceName: 'Cancelled Plumbing',
      sellerName: 'John Seller',
      buyerName: 'Alice Buyer',
      agreedPrice: 50,
      createdAt: '2023-10-12T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    store = createTestStore();

    mockBaseQuery.mockImplementation(
      async (args: { url: string; method?: string; params?: any }) => {
        const { url } = args;

        if (url.includes('/orders/me/as-buyer')) {
          return { data: { results: mockCancelledOrders } };
        }
        if (url.includes('/orders/me/as-seller')) {
          return { data: { results: mockCancelledOrders } };
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

  it('should display cancelled orders for the buyer', async () => {
    const { findByText, getByText } = renderScreen(store);

    expect(await findByText('Cancelled Plumbing')).toBeTruthy();
    expect(getByText('Seller: John Seller')).toBeTruthy();
    expect(getByText('Cancelled')).toBeTruthy();
  });

  it('should switch to seller services and show cancelled incoming requests', async () => {
    const { findByText, getByText } = renderScreen(store);

    // Switch to seller tab
    fireEvent.press(getByText('My Services'));

    expect(await findByText('Cancelled Plumbing')).toBeTruthy();
    expect(getByText('Buyer: Alice Buyer')).toBeTruthy();
  });

  it('should show error toast when fetch fails', async () => {
    mockBaseQuery.mockResolvedValueOnce({
      error: { data: { detail: 'Server Error' } },
    });

    renderScreen(store);

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith('Server Error', 'Cancelled Orders Error');
    });
  });
});
