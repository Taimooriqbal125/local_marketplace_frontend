/**
 * RequestedTab (Order Requests) — Integration Test
 *
 * Tests the initial order interaction flow:
 *   1. Buyer sees "Waiting for seller response" and can "Cancel Request".
 *   2. Seller sees "Incoming Requests" and can "Accept" or "Reject".
 *   3. Accepting opens a modal to finalize the agreed price.
 *
 * Mocked: axiosBaseQuery, expo-router, toasts, and animations.
 */
import React, { type PropsWithChildren } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import RequestedTab from '../RequestedTab';

// Reference variables with 'mock' prefix to satisfy Jest's hoisting rules
const mockReact = React;
const mockView = View;
const mockText = Text;
const mockTouchableOpacity = TouchableOpacity;

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

// Mock modals to simplify interaction or avoid Lottie/Context issues
jest.mock('@/components/modals/ShowRequestedModel', () => {
  return ({ visible, onAccept, onClose }: any) => {
    if (!visible) return null;
    return mockReact.createElement(mockView, { testID: 'accept-modal' }, [
      mockReact.createElement(mockText, { key: 't' }, 'Requested Details'),
      mockReact.createElement(
        mockTouchableOpacity,
        {
          key: 'b',
          testID: 'accept-btn',
          onPress: () => onAccept(100),
        },
        mockReact.createElement(mockText, {}, 'Accept Order'),
      ),
      mockReact.createElement(
        mockTouchableOpacity,
        {
          key: 'c',
          testID: 'close-btn',
          onPress: onClose,
        },
        mockReact.createElement(mockText, {}, 'Close'),
      ),
    ]);
  };
});

jest.mock('@/components/toast/CustomAlert', () => {
  return ({ visible, onConfirm, onCancel, message }: any) => {
    if (!visible) return null;
    return mockReact.createElement(mockView, { testID: 'custom-alert' }, [
      mockReact.createElement(mockText, { key: 'm' }, message),
      mockReact.createElement(
        mockTouchableOpacity,
        {
          key: 'y',
          testID: 'confirm-cancel-btn',
          onPress: onConfirm,
        },
        mockReact.createElement(mockText, {}, 'Yes, Cancel'),
      ),
      mockReact.createElement(
        mockTouchableOpacity,
        {
          key: 'n',
          testID: 'keep-it-btn',
          onPress: onCancel,
        },
        mockReact.createElement(mockText, {}, 'No, Keep it'),
      ),
    ]);
  };
});

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
 * Renders the RequestedTab component within the test Redux environment.
 * @param testStore - The store instance to use for rendering.
 */
const renderScreen = (testStore: AppStore) =>
  render(mockReact.createElement(RequestedTab), {
    wrapper: (props: PropsWithChildren) =>
      mockReact.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('RequestedTab — Order Requests Integration', () => {
  let store: AppStore;

  const mockOrders = [
    {
      id: 'order-1',
      status: 'requested',
      serviceName: 'Plumbing Service',
      sellerName: 'John Seller',
      buyerName: 'Alice Buyer',
      proposedPrice: 50,
      createdAt: '2023-10-20T10:00:00Z',
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
        return { data: { results: mockOrders } };
      }
      if (url.includes('/orders/me/as-seller')) {
        return { data: { results: mockOrders } };
      }
      if (url.includes('/orders/') && method === 'PATCH') {
        const status = args.data?.status || 'accepted';
        return { data: { ...mockOrders[0], status } };
      }
      if (url.includes('/cancel-request') && method === 'DELETE') {
        return { data: { success: true } };
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

  it('should display requested orders for the buyer', async () => {
    const { findByText, getByText } = renderScreen(store);

    // Verify "My Orders" tab content
    expect(await findByText('Plumbing Service')).toBeTruthy();
    expect(getByText('Seller: John Seller')).toBeTruthy();
    expect(getByText('Waiting for seller response')).toBeTruthy();
    expect(getByText('Cancel Request')).toBeTruthy();
  });

  it('should switch to "My Services" and show incoming requests for seller', async () => {
    const { findByText, getByText } = renderScreen(store);

    // 1. Switch to seller tab (My Services)
    const sellerTab = getByText('My Services');
    fireEvent.press(sellerTab);

    // 2. Verify incoming request
    expect(await findByText('Plumbing Service')).toBeTruthy();
    expect(getByText('Buyer: Alice Buyer')).toBeTruthy();
    expect(getByText('Accept')).toBeTruthy();
    expect(getByText('Reject')).toBeTruthy();
  });

  it('should allow buyer to cancel a request', async () => {
    const { findByText, getByText } = renderScreen(store);

    // 1. Find and press Cancel Request
    const cancelBtn = await findByText('Cancel Request');
    fireEvent.press(cancelBtn);

    // 2. Verify confirmation alert (CustomAlert)
    expect(getByText(/Are you sure you want to cancel/)).toBeTruthy();

    // 3. Confirm cancellation
    const confirmBtn = getByText('Yes, Cancel');
    fireEvent.press(confirmBtn);

    // 4. Verify API call
    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/orders/order-1'),
          method: 'DELETE',
        }),
      );
    });

    expect(mockShowSuccessToast).toHaveBeenCalledWith(
      'Order request cancelled successfully',
      'Success',
    );
  });

  it('should allow seller to accept a request via modal', async () => {
    const { findByText, getByText } = renderScreen(store);

    // 1. Go to Seller tab
    fireEvent.press(getByText('My Services'));

    // 2. Press Accept
    const acceptBtn = await findByText('Accept');
    fireEvent.press(acceptBtn);

    // 3. Verify modal (ShowRequestedModel)
    await waitFor(() => {
      expect(getByText('Requested Details')).toBeTruthy();
    });

    // 4. Confirm acceptance (In ShowRequestedModel)
    const confirmAcceptBtn = getByText('Accept Order');
    fireEvent.press(confirmAcceptBtn);

    // 5. Verify API call (PATCH with status: accepted)
    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/orders/order-1'),
          method: 'PATCH',
          data: expect.objectContaining({ status: 'accepted' }),
        }),
      );
    });

    expect(mockShowSuccessToast).toHaveBeenCalledWith(
      expect.stringContaining('Order accepted'),
      'Success',
    );
  });
});
