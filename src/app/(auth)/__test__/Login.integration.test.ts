/**
 * Login Screen — Integration Test
 */
import React, { type PropsWithChildren } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import networkReducer from '@/redux/network/networkSlice';
import animationReducer from '@/redux/walkthrough/animationSlice';
import Login from '../Login';
import { secureStore } from '@/storage';

/* ------------------------------------------------------------------ */
/* Mock baseQuery to simulate backend responses                       */
/* ------------------------------------------------------------------ */
const mockBaseQuery = jest.fn();

jest.mock('@/app/axios/axiosBaseQuery', () => ({
  axiosBaseQuery: () => (args: any) => mockBaseQuery(args),
}));
/* ------------------------------------------------------------------ */
/* Mock device-only APIs (no real device in Jest)                      */
/* ------------------------------------------------------------------ */
jest.mock('@/storage', () => ({
  secureStore: {
    saveAuthTokens: jest.fn().mockResolvedValue(undefined),
    setObject: jest.fn().mockResolvedValue(undefined),
    getAccessToken: jest.fn().mockResolvedValue(null),
    getRefreshToken: jest.fn().mockResolvedValue(null),
    clearAuthStorage: jest.fn().mockResolvedValue(undefined),
  },
  storage: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  Href: {},
}));

jest.mock('@components/common/ScreenWrapper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const MockScreenWrapper = ({ children }: { children: React.ReactNode }) =>
    ReactMock.createElement(RN.View, { testID: 'screen-wrapper' }, children);
  MockScreenWrapper.displayName = 'MockScreenWrapper';
  return MockScreenWrapper;
});

const mockShowErrorToast = jest.fn();
const mockShowSuccessToast = jest.fn();
const mockShowInfoToast = jest.fn();
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (...args: any[]) => mockShowErrorToast(...args),
  showSuccessToast: (...args: any[]) => mockShowSuccessToast(...args),
  showInfoToast: (...args: any[]) => mockShowInfoToast(...args),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  FontAwesome5: 'FontAwesome5',
}));

/* ------------------------------------------------------------------ */
/* Test helpers                                                        */
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

const renderLogin = (testStore: ReturnType<typeof createTestStore>) =>
  render(React.createElement(Login), {
    wrapper: (props: PropsWithChildren) =>
      React.createElement(Wrapper, { ...props, store: testStore }),
  });

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('Login Screen — Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  const mockStore = secureStore as jest.Mocked<typeof secureStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();

    // Re-apply default resolved values after clearAllMocks
    mockStore.saveAuthTokens.mockResolvedValue(true);
    (mockStore.setObject as jest.Mock).mockResolvedValue(undefined);
    mockStore.getAccessToken.mockResolvedValue(null);
    mockStore.getRefreshToken.mockResolvedValue(null);
    mockStore.clearAuthStorage.mockResolvedValue(true);

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    store.dispatch(baseApi.util.resetApiState());
    jest.restoreAllMocks();
  });

  it('should render the login form correctly', () => {
    const { getByText, getByPlaceholderText } = renderLogin(store);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Login to continue')).toBeTruthy();
    expect(getByPlaceholderText('example@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('should show validation error when fields are empty', () => {
    const { getByText } = renderLogin(store);

    fireEvent.press(getByText('Login'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please fill in all fields',
      'Validation Error',
    );
  });

  it('should show validation error for invalid email format', () => {
    const { getByText, getByPlaceholderText } = renderLogin(store);

    fireEvent.changeText(getByPlaceholderText('example@email.com'), 'not-an-email');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Login'));

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'Please enter a valid email',
      'Validation Error',
    );
  });

  it('should complete full login flow: API → SecureStore → Redux → Navigation', async () => {
    // Arrange: Mock a successful backend response
    mockBaseQuery.mockResolvedValueOnce({
      data: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user: { id: 1, email: 'test@mail.com', username: 'testuser' },
      },
    });

    const { getByText, getByPlaceholderText } = renderLogin(store);

    // Act: Fill form and submit
    fireEvent.changeText(getByPlaceholderText('example@email.com'), 'test@mail.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Login'));

    // Step 1: API was called
    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalled();
    });

    const callArgs = mockBaseQuery.mock.calls[0][0];
    expect(callArgs.url).toBe('/users/login');
    expect(callArgs.method).toBe('POST');

    // Step 2: Wait for the full async chain to settle
    await waitFor(
      () => {
        // Either success toast or error toast must have fired
        const successCalled = mockShowSuccessToast.mock.calls.length > 0;
        const errorCalled = mockShowErrorToast.mock.calls.length > 0;
        expect(successCalled || errorCalled).toBe(true);
      },
      { timeout: 3000 },
    );

    // Step 3: Verify it was the SUCCESS path, not the error path
    expect(mockShowErrorToast).not.toHaveBeenCalled();
    expect(mockShowSuccessToast).toHaveBeenCalledWith('Logged in successfully');

    // Step 4: Tokens saved to SecureStore
    expect(mockStore.saveAuthTokens).toHaveBeenCalledWith({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    });

    // Step 5: Redux state updated
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);

    // Step 6: Router navigated to home
    expect(mockReplace).toHaveBeenCalledWith('/(user)/(tabs)');
  });

  it('should show error toast on API failure', async () => {
    // Arrange: Simulate a 401 from backend
    mockBaseQuery.mockResolvedValueOnce({
      error: {
        status: 401,
        data: { detail: 'Invalid email or password' },
      },
    });

    const { getByText, getByPlaceholderText } = renderLogin(store);

    // Act
    fireEvent.changeText(getByPlaceholderText('example@email.com'), 'wrong@mail.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    // Assert
    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(expect.any(String), 'Login failed');

      // Redux state should NOT be authenticated
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
    });
  });

  it('should navigate to Signup when SignUp link is pressed', () => {
    const { getByText } = renderLogin(store);
    fireEvent.press(getByText('SignUp'));

    expect(mockPush).toHaveBeenCalledWith('/(auth)/Signup');
  });

  it('should navigate to ForgotPassword when link is pressed', () => {
    const { getByText } = renderLogin(store);
    fireEvent.press(getByText('Forgot password?'));

    expect(mockPush).toHaveBeenCalledWith('/(auth)/ForgotPassword');
  });
});
