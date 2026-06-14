/**
 * ServicesDetails & RequestServiceModal — Integration Test
 *
 * Tests the complete booking flow:
 *   1. Screen loads service details & reviews.
 *   2. "Request Service" button opens the modal.
 *   3. Modal handles price/notes input and submits to orderApi.
 *   4. Success state (animation) is displayed.
 *
 * Real modules: Redux store + baseApi middleware + listing/review/order endpoints.
 * Mocked: network layer (axiosBaseQuery), router, toasts, and lottie animations.
 */
import React, { type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import ServicesDetails from '../ServicesDetails';

// Reference variables with 'mock' prefix to satisfy Jest's hoisting rules
const mockReact = React;
const mockView = View;

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
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  useLocalSearchParams: () => ({ id: 'service-123' }),
}));

const mockShowErrorToast = jest.fn();
const mockShowSuccessToast = jest.fn();
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (...args: any[]) => mockShowErrorToast(...args),
  showSuccessToast: (...args: any[]) => mockShowSuccessToast(...args),
}));

// Mock animations to avoid Lottie issues in Jest
jest.mock('@/components/animations/SuccessAnimation', () => {
  const Mock = (props: any) =>
    mockReact.createElement(mockView, { testID: 'success-animation', ...props });
  Mock.displayName = 'MockSuccessAnimation';
  return Mock;
});

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

/* ------------------------------------------------------------------ */
/* Store factory & render helper                                       */
/* ------------------------------------------------------------------ */
const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(baseApi.middleware),
  });

const Wrapper = ({
  children,
  store,
}: PropsWithChildren<{ store: ReturnType<typeof createTestStore> }>) =>
  React.createElement(Provider, { store } as any, children);

const renderScreen = (testStore: ReturnType<typeof createTestStore>) =>
  render(React.createElement(ServicesDetails), {
    wrapper: (props: PropsWithChildren) =>
      React.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('ServicesDetails & Booking Flow — Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  const mockServiceData = {
    id: 'service-123',
    title: 'Professional Home Cleaning',
    description: 'Deep cleaning service for your entire home with eco-friendly products.',
    priceAmount: 1500,
    priceType: 'fixed',
    categoryName: 'Cleaning',
    serviceLocation: 'Karachi, Pakistan',
    imageUrl: 'https://example.com/image.jpg',
    seller: {
      userId: 'seller-456',
      name: 'John Doe',
      photoUrl: 'https://example.com/avatar.jpg',
      sellerRatingAvg: '4.8',
      sellerRatingCount: 120,
    },
  };

  const mockReviews = [
    {
      id: 'rev-1',
      rating: 5,
      note: 'Excellent work, very thorough!',
      createdAt: '2023-10-01T12:00:00Z',
      reviewer: { name: 'Alice', photoUrl: '' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    store = createTestStore();

    // Default implementation for basic success
    mockBaseQuery.mockImplementation(async (args: any) => {
      const url = typeof args === 'string' ? args : args.url;
      const method = (typeof args === 'string' ? 'GET' : args.method) || 'GET';

      if (url.includes('/services/service-123')) {
        return { data: mockServiceData };
      }
      if (url.includes('/reviews/byuserid/seller-456')) {
        return { data: { results: mockReviews } };
      }
      if (url.includes('/orders/') && method === 'POST') {
        return { data: { id: 'order-789', status: 'requested' } };
      }
      return { data: null };
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      store.dispatch(baseApi.util.resetApiState());
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  /* ============================================================== */
  /* 1. Initial Load                                                 */
  /* ============================================================== */
  it('should load and display service details and reviews', async () => {
    const { getByText, findByText } = renderScreen(store);

    // Verify service details
    expect(await findByText('Professional Home Cleaning')).toBeTruthy();

    // Flexible matching for price
    expect(getByText(/RS.*1.*500/)).toBeTruthy();
    expect(
      getByText('Deep cleaning service for your entire home with eco-friendly products.'),
    ).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();

    // Verify reviews - use findByText to wait for async reviews query
    expect(await findByText('Excellent work, very thorough!')).toBeTruthy();
    expect(getByText('Alice')).toBeTruthy();
  }, 15000);

  /* ============================================================== */
  /* 2. Modal Flow & Successful Booking                              */
  /* ============================================================== */
  it('should open modal and successfully create an order', async () => {
    const { findByText, getByText, getByPlaceholderText, getByTestId } = renderScreen(store);

    // 1. Wait for screen to load and press "Request Service"
    const requestBtn = await findByText('Request Service');
    fireEvent.press(requestBtn);

    // 2. Verify modal is open
    await waitFor(() => {
      expect(getByText('Proposed Price')).toBeTruthy();
    });

    // 3. Fill proposed price and notes
    const priceInput = getByPlaceholderText('0.00');
    const notesInput = getByPlaceholderText(
      'Tell the seller more about your requirements, specific areas to focus on, or parking instructions...',
    );

    fireEvent.changeText(priceInput, '1400');
    fireEvent.changeText(notesInput, 'Please bring your own cleaning supplies.');

    // 4. Submit request
    const sendBtn = getByText('Send Request');
    fireEvent.press(sendBtn);

    // 5. Verify API call
    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/orders/',
          method: 'POST',
          data: {
            listingId: 'service-123',
            proposedPrice: 1400,
            notes: 'Please bring your own cleaning supplies.',
          },
        }),
      );
    });

    // 6. Verify success animation is shown
    await waitFor(() => {
      expect(getByTestId('success-animation')).toBeTruthy();
    });

    // 7. Fast-forward the 2.5s success timeout to allow the modal to "close" and cleanup
    act(() => {
      jest.advanceTimersByTime(2500);
    });
  }, 15000);

  /* ============================================================== */
  /* 3. Validation & Error States                                    */
  /* ============================================================== */
  it('should show error if proposed price is empty in modal', async () => {
    const { findByText, getByText, getByPlaceholderText } = renderScreen(store);

    const requestBtn = await findByText('Request Service');
    fireEvent.press(requestBtn);

    await waitFor(() => {
      expect(getByText('Send Request')).toBeTruthy();
    });

    // Clear price
    const priceInput = getByPlaceholderText('0.00');
    fireEvent.changeText(priceInput, '');

    fireEvent.press(getByText('Send Request'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please enter a proposed price.',
      'Input Required',
    );
  }, 10000);

  it('should show 404 state if service is not found', async () => {
    mockBaseQuery.mockImplementation(async (args: any) => {
      const url = typeof args === 'string' ? args : args.url;
      if (url.includes('/services/service-123')) {
        return { error: { status: 404, data: { detail: 'Not Found' } } };
      }
      return { data: null };
    });

    const { findByText, getByText } = renderScreen(store);

    expect(await findByText('404 Service not found')).toBeTruthy();

    fireEvent.press(getByText('Go Back'));
    expect(mockBack).toHaveBeenCalled();
  }, 10000);
});
