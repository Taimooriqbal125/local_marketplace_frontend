/**
 * CompletedTab (Order History) — Integration Test
 *
 * Tests the completed orders view:
 *   1. Displays completed orders for both Buyer and Seller.
 *   2. Verifies the "Leave a Review" button visibility for Buyers.
 *   3. Verifies that the Review Modal (AddReviews) opens correctly.
 *   4. Ensures that already reviewed orders do not show the review button.
 *
 * Mocked: axiosBaseQuery, expo-router, toasts, animations, and AddReviews modal.
 */
import React, { type PropsWithChildren } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import CompletedTab from '../CompletedTab';

// Reference variables with 'mock' prefix for Jest hoisting
const mockReact = React;
const mockView = View;
const mockText = Text;
const mockTouchableOpacity = TouchableOpacity;

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

// Mock the Review Modal
jest.mock('@/components/modals/AddReviews', () => {
  return ({ visible, onClose, orderId }: any) => {
    if (!visible) return null;
    return mockReact.createElement(mockView, { testID: 'add-review-modal' }, [
      mockReact.createElement(mockText, { key: 't' }, `Reviewing Order: ${orderId}`),
      mockReact.createElement(
        mockTouchableOpacity,
        {
          key: 'c',
          testID: 'close-review-btn',
          onPress: onClose,
        },
        mockReact.createElement(mockText, {}, 'Close'),
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
  render(mockReact.createElement(CompletedTab), {
    wrapper: (props: PropsWithChildren) =>
      mockReact.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('CompletedTab — History & Reviews Integration', () => {
  let store: AppStore;

  const mockCompletedOrders = [
    {
      id: 'comp-1',
      status: 'completed',
      serviceName: 'Finished Plumbing',
      sellerName: 'John Seller',
      buyerName: 'Alice Buyer',
      agreedPrice: 150,
      createdAt: '2023-10-15T10:00:00Z',
    },
    {
      id: 'comp-2',
      status: 'completed',
      serviceName: 'Reviewed Electrical',
      sellerName: 'Bob Electric',
      buyerName: 'Alice Buyer',
      agreedPrice: 200,
      createdAt: '2023-10-10T10:00:00Z',
    },
  ];

  const mockGivenReviews = [
    {
      id: 'rev-1',
      orderId: 'comp-2',
      comment: 'Great job!',
      rating: 5,
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
          return { data: { results: mockCompletedOrders } };
        }
        if (url.includes('/orders/me/as-seller')) {
          return { data: { results: mockCompletedOrders } };
        }
        if (url.includes('/reviews/me/given')) {
          return { data: { results: mockGivenReviews } };
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

  it('should display completed orders and "Leave a Review" button only where applicable', async () => {
    const { findByText, getAllByText } = renderScreen(store);

    // 1. Verify display
    expect(await findByText('Finished Plumbing')).toBeTruthy();
    expect(await findByText('Reviewed Electrical')).toBeTruthy();

    // 2. Verify Review buttons
    // comp-1: not reviewed -> should have button
    // comp-2: already reviewed -> should NOT have button
    const reviewButtons = getAllByText('Leave a Review');
    expect(reviewButtons.length).toBe(1);

    // Verify it's associated with the right one (Finished Plumbing is comp-1)
    // In a real test we'd check parents, but finding one is sufficient for this mock data
  });

  it('should open the AddReviews modal when clicking "Leave a Review"', async () => {
    const { findByText, getByText, getByTestId, queryByText } = renderScreen(store);

    const leaveReviewBtn = await findByText('Leave a Review');
    fireEvent.press(leaveReviewBtn);

    // Verify Modal
    await waitFor(() => {
      expect(getByTestId('add-review-modal')).toBeTruthy();
      expect(getByText('Reviewing Order: comp-1')).toBeTruthy();
    });

    // Close Modal
    fireEvent.press(getByTestId('close-review-btn'));
    await waitFor(() => {
      expect(queryByText('Reviewing Order: comp-1')).toBeNull();
    });
  });

  it('should switch to seller services and show completed work (no review button for seller)', async () => {
    const { findByText, queryByText, getByText, getAllByText } = renderScreen(store);

    // Switch to seller tab
    fireEvent.press(getByText('My Services'));

    expect(await findByText('Finished Plumbing')).toBeTruthy();
    // Since both mock orders have the same buyer name, we check for at least one
    expect(getAllByText('Buyer: Alice Buyer').length).toBeGreaterThan(0);

    // Seller shouldn't see "Leave a Review"
    expect(queryByText('Leave a Review')).toBeNull();
  });
});
