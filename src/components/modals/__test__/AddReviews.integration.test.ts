/**
 * AddReviews Modal — Integration Test
 *
 * Tests the modal-based review submission:
 *   - Visibility control
 *   - Rating selection
 *   - Comment input (optional in modal version)
 *   - RTK Query createReview mutation
 *   - Closing modal on success/cancel
 *
 * Real modules: Redux store + reviewApi middleware.
 * Mocked: network layer (axiosBaseQuery), toast components.
 */
import React, { type PropsWithChildren } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import AddReviews from '../AddReviews';

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
const mockShowErrorToast = jest.fn();
const mockShowSuccessToast = jest.fn();
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (...args: any[]) => mockShowErrorToast(...args),
  showSuccessToast: (...args: any[]) => mockShowSuccessToast(...args),
}));

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
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(baseApi.middleware),
  });

const Wrapper = ({
  children,
  store,
}: PropsWithChildren<{ store: ReturnType<typeof createTestStore> }>) =>
  React.createElement(Provider, { store } as any, children);

const renderModal = (
  testStore: ReturnType<typeof createTestStore>,
  props: { visible: boolean; onClose: () => void; orderId: string | null },
) =>
  render(React.createElement(AddReviews, props), {
    wrapper: (pwProps: PropsWithChildren) =>
      React.createElement(Wrapper, { ...pwProps, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('AddReviews Modal — Integration', () => {
  let store: ReturnType<typeof createTestStore>;
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();

    mockBaseQuery.mockImplementation(async () => {
      return { data: { id: 'rev-456', rating: 5, comment: 'Great!' } };
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    store.dispatch(baseApi.util.resetApiState());
  });

  it('should render when visible is true', () => {
    const { getByText } = renderModal(store, {
      visible: true,
      onClose: mockOnClose,
      orderId: 'order-123',
    });

    expect(getByText('Leave a Review')).toBeTruthy();
    expect(getByText('Rate your experience')).toBeTruthy();
  });

  it('should call onClose when cancel is pressed', () => {
    const { getByText } = renderModal(store, {
      visible: true,
      onClose: mockOnClose,
      orderId: 'order-123',
    });

    fireEvent.press(getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit review and close on success', async () => {
    const { getByText, getByPlaceholderText } = renderModal(store, {
      visible: true,
      onClose: mockOnClose,
      orderId: 'order-123',
    });

    // 1. Enter comment
    const input = getByPlaceholderText('Tell us about your experience...');
    fireEvent.changeText(input, 'Excellent modal experience!');

    // 2. Submit (Default rating is 5 in modal)
    fireEvent.press(getByText('Submit Review'));

    // 3. Verify API
    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith({
        url: '/reviews/',
        method: 'POST',
        data: {
          orderId: 'order-123',
          rating: 5,
          comment: 'Excellent modal experience!',
        },
      });
    });

    // 4. Verify feedback and closure
    expect(mockShowSuccessToast).toHaveBeenCalledWith('Review submitted successfully!', 'Success');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show error if orderId is missing in props', async () => {
    const { getByText } = renderModal(store, {
      visible: true,
      onClose: mockOnClose,
      orderId: null,
    });

    fireEvent.press(getByText('Submit Review'));

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith('Order ID is missing', 'Error');
    });
    expect(mockBaseQuery).not.toHaveBeenCalled();
  });

  it('should disable buttons during loading', async () => {
    // Make API hang
    let resolveApi: any;
    mockBaseQuery.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveApi = resolve;
        }),
    );

    const { getByText } = renderModal(store, {
      visible: true,
      onClose: mockOnClose,
      orderId: 'order-123',
    });

    fireEvent.press(getByText('Submit Review'));

    // Check loading text
    expect(getByText('Submitting Review...')).toBeTruthy();

    // Try to cancel while loading
    fireEvent.press(getByText('Cancel'));
    expect(mockOnClose).not.toHaveBeenCalled();

    // Resolve API
    resolveApi({ data: { id: 'rev-456' } });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
