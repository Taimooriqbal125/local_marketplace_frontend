/**
 * AddReview Screen — Integration Test
 * 
 * Tests the full review submission flow:
 *   - Rating selection (stars 1-5)
 *   - Review text input (min 20 chars)
 *   - RTK Query createReview mutation
 *   - Navigation back on success
 *   - Error handling (missing orderId, API failure)
 * 
 * Real modules: Redux store + reviewApi middleware.
 * Mocked: network layer (axiosBaseQuery), device APIs (router, toast).
 */
import React, { type PropsWithChildren } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import AddReview from '../AddReview';

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
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);
let mockOrderId: string | null = 'order-123';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    canGoBack: mockCanGoBack,
  }),
  useLocalSearchParams: () => ({ orderId: mockOrderId }),
}));

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

const renderScreen = (testStore: ReturnType<typeof createTestStore>) =>
  render(React.createElement(AddReview), {
    wrapper: (props: PropsWithChildren) =>
      React.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('AddReview Screen — Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    mockOrderId = 'order-123';
    mockCanGoBack.mockReturnValue(true);
    
    mockBaseQuery.mockImplementation(async () => {
      return { data: { id: 'rev-456', rating: 5, comment: 'Great!' } };
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    store.dispatch(baseApi.util.resetApiState());
  });

  /* ============================================================== */
  /* 1. Rendering & Validation                                       */
  /* ============================================================== */
  it('should render all UI elements', () => {
    const { getByText, getByPlaceholderText } = renderScreen(store);

    expect(getByText('HOW WAS YOUR EXPERIENCE?')).toBeTruthy();
    expect(getByPlaceholderText('Tell us what you liked or what could be improved...')).toBeTruthy();
    expect(getByText('Submit Review')).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    const { getByTestId } = renderScreen(store);
    const submitBtn = getByTestId('submit-review-btn');

    // Initially invalid (0 rating, empty text)
    expect(submitBtn.props.accessibilityState.disabled).toBe(true);
  });

  it('should show validation messages as user types', () => {
    const { getByText, getByPlaceholderText } = renderScreen(store);
    
    const input = getByPlaceholderText('Tell us what you liked or what could be improved...');
    
    // Default state
    expect(getByText('20 more characters needed')).toBeTruthy();

    fireEvent.changeText(input, 'Short review');
    expect(getByText('8 more characters needed')).toBeTruthy();

    fireEvent.changeText(input, 'This is a long enough review for testing purposes.');
    expect(getByText('Looks good')).toBeTruthy();
  });

  /* ============================================================== */
  /* 2. Happy Path                                                   */
  /* ============================================================== */
  it('should submit review and navigate back on success', async () => {
    const { getByText, getByPlaceholderText, getAllByText } = renderScreen(store);
    
    // 1. Select rating (4 stars)
    // Stars are 1-5, index 3 is 4 stars
    const star4 = getAllByText('4')[0];
    fireEvent.press(star4);

    // 2. Enter review text
    const input = getByPlaceholderText('Tell us what you liked or what could be improved...');
    fireEvent.changeText(input, 'Excellent service, would definitely recommend to others!');

    // 3. Submit
    const submitBtn = getByText('Submit Review');
    fireEvent.press(submitBtn);

    // 4. Verify API call
    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalledWith({
        url: '/reviews/',
        method: 'POST',
        data: {
          orderId: 'order-123',
          rating: 4,
          comment: 'Excellent service, would definitely recommend to others!',
        },
      });
    });

    // 5. Verify feedback and navigation
    expect(mockShowSuccessToast).toHaveBeenCalledWith(
      'Your review has been submitted.',
      'Success',
    );
    expect(mockBack).toHaveBeenCalled();
  });

  /* ============================================================== */
  /* 3. Error States                                                 */
  /* ============================================================== */
  it('should show error toast if orderId is missing', async () => {
    mockOrderId = null; // Simulate missing param
    const { getByText, getByPlaceholderText, getAllByText } = renderScreen(store);

    fireEvent.press(getAllByText('5')[0]);
    fireEvent.changeText(
      getByPlaceholderText('Tell us what you liked or what could be improved...'),
      'Valid review text that is long enough.',
    );

    fireEvent.press(getByText('Submit Review'));

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        'Order information is missing.',
        'Error',
      );
    });
    expect(mockBaseQuery).not.toHaveBeenCalled();
  });

  it('should handle API failure gracefully', async () => {
    mockBaseQuery.mockImplementation(async () => ({
      error: { data: { message: 'Already reviewed' } },
    }));

    const { getByText, getByPlaceholderText, getAllByText } = renderScreen(store);

    fireEvent.press(getAllByText('5')[0]);
    fireEvent.changeText(
      getByPlaceholderText('Tell us what you liked or what could be improved...'),
      'Valid review text that is long enough.',
    );

    fireEvent.press(getByText('Submit Review'));

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        'Already reviewed',
        'Submission Failed',
      );
    });
  });
});
