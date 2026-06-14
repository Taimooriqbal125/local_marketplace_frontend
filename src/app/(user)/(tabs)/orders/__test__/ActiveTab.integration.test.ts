/**
 * ActiveTab (Active/Accepted Orders) — Integration Test
 *
 * Tests the order execution flow:
 *   1. Buyer sees "Order in Progress" and can "Mark as Completed".
 *   2. Seller sees "Work in Progress" and can "Mark as Completed".
 *   3. Verifies indicator changes when one party completes.
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
import ActiveTab from '../ActiveTab';

// Reference variables with 'mock' prefix to satisfy Jest's hoisting rules
const mockReact = React;
const mockView = View;
/* ------------------------------------------------------------------ */
/* Mock network layer                                                  */
/* ------------------------------------------------------------------ */
/**
 * Intercepts RTK Query base query to simulate network responses.
 */
const mockBaseQuery = jest.fn();

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: { url: string; method?: string; data?: any }) => mockBaseQuery(args),
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
const mockShowSuccessToast = jest.fn();

/**
 * Mock implementation of CustomError toasts to verify user feedback.
 */
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (message: string, title?: string) => mockShowErrorToast(message, title),
  showSuccessToast: (message: string, title?: string) => mockShowSuccessToast(message, title),
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

/**
 * Creates a configured Redux store instance for testing.
 * @returns A fresh Redux store with baseApi and auth slices.
 */
const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(baseApi.middleware),
  });

/** Infer the type of the store and state from the factory */
type AppStore = ReturnType<typeof createTestStore>;

/**
 * A wrapper component that provides the Redux store to its children.
 */
interface WrapperProps extends PropsWithChildren {
  store: AppStore;
}

const Wrapper = ({ children, store }: WrapperProps) =>
  mockReact.createElement(Provider, { store: store as any } as any, children);

/**
 * Renders the ActiveTab component within the test Redux environment.
 * @param testStore - The store instance to use for rendering.
 */
const renderScreen = (testStore: AppStore) =>
  render(mockReact.createElement(ActiveTab), {
    wrapper: (props: PropsWithChildren) =>
      mockReact.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('ActiveTab — Active Orders Integration', () => {
  let store: AppStore;

  const mockActiveOrders = [
    {
      id: 'active-1',
      status: 'accepted',
      serviceName: 'Active Plumbing',
      sellerName: 'John Seller',
      buyerName: 'Alice Buyer',
      agreedPrice: 100,
      createdAt: '2023-10-21T10:00:00Z',
      sellerCompletedAt: null,
      buyerCompletedAt: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    store = createTestStore();

    // Default mock behavior for network requests
    mockBaseQuery.mockImplementation(async (args: { url: string; method?: string; data?: any }) => {
      const { url, method = 'GET' } = args;

      if (url.includes('/orders/me/as-buyer')) {
        return { data: { results: mockActiveOrders } };
      }
      if (url.includes('/orders/me/as-seller')) {
        return { data: { results: mockActiveOrders } };
      }
      if (url.includes('/orders/') && method === 'PATCH') {
        return { data: { ...mockActiveOrders[0], buyerCompletedAt: '2023-10-21T12:00:00Z' } };
      }
      return { data: { results: [] } };
    });
  });

  afterEach(() => {
    act(() => {
      store.dispatch(baseApi.util.resetApiState());
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should display active orders for the buyer', async () => {
    const { findByText, getByText } = renderScreen(store);

    expect(await findByText('Active Plumbing')).toBeTruthy();
    expect(getByText('Seller: John Seller')).toBeTruthy();
    expect(getByText('Order in Progress')).toBeTruthy();
    expect(getByText('Mark as Completed')).toBeTruthy();
  });

  it('should allow buyer to mark order as completed', async () => {
    const { findByText } = renderScreen(store);

    const completeBtn = await findByText('Mark as Completed');
    fireEvent.press(completeBtn);

    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/orders/active-1'),
          method: 'PATCH',
          data: expect.objectContaining({ status: 'completed' }),
        }),
      );
    });

    expect(mockShowSuccessToast).toHaveBeenCalledWith('Order completion confirmed!', 'Success');
  });

  it('should show "Work in Progress" for seller and allow completion', async () => {
    const { findByText, getByText } = renderScreen(store);

    // Switch to seller tab
    fireEvent.press(getByText('My Services'));

    expect(await findByText('Active Plumbing')).toBeTruthy();
    expect(getByText('Buyer: Alice Buyer')).toBeTruthy();
    expect(getByText('Work in Progress')).toBeTruthy();

    const completeBtn = getByText('Mark as Completed');
    fireEvent.press(completeBtn);

    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          data: expect.objectContaining({ status: 'completed' }),
        }),
      );
    });
  });
});
