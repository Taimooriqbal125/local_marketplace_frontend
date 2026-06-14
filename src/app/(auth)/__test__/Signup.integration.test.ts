/**
 * Signup Screen — Integration Test
 *
 * Tests the full registration flow: form validation (6 rules) →
 * RTK Query register mutation → navigation to OTP screen.
 * Real modules: Redux store + authSlice + baseApi middleware + Signup component.
 * Mocked: network layer (axiosBaseQuery), device APIs (router, toast, icons).
 */
import React, { type PropsWithChildren } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/auth/authSlice';
import networkReducer from '@/redux/network/networkSlice';
import animationReducer from '@/redux/walkthrough/animationSlice';
import Signup from '../Signup';

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
jest.mock('@/storage', () => ({
  secureStore: {
    saveAuthTokens: jest.fn().mockResolvedValue(true),
    setObject: jest.fn().mockResolvedValue(undefined),
    getAccessToken: jest.fn().mockResolvedValue(null),
    getRefreshToken: jest.fn().mockResolvedValue(null),
    clearAuthStorage: jest.fn().mockResolvedValue(true),
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

jest.mock('@/components/common/ScreenWrapper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = ({ children }: { children: React.ReactNode }) =>
    R.createElement(RN.View, { testID: 'screen-wrapper' }, children);
  Mock.displayName = 'MockScreenWrapper';
  return Mock;
});

jest.mock('expo-linear-gradient', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = ({ children, ...rest }: any) =>
    R.createElement(RN.View, { ...rest, testID: 'linear-gradient' }, children);
  Mock.displayName = 'MockLinearGradient';
  return { LinearGradient: Mock };
});

jest.mock('@components/animations/AppLoadingAnimation', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Mock = () => R.createElement(RN.View, { testID: 'loading-animation' });
  Mock.displayName = 'MockAppLoadingAnimation';
  return Mock;
});

const mockShowErrorToast = jest.fn();
jest.mock('@/components/toast/CustomError', () => ({
  showErrorToast: (...args: any[]) => mockShowErrorToast(...args),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
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

const renderSignup = (testStore: ReturnType<typeof createTestStore>) =>
  render(React.createElement(Signup), {
    wrapper: (props: PropsWithChildren) =>
      React.createElement(Wrapper, { ...props, store: testStore }),
  });

/** Fill all form fields with valid data and check the terms checkbox */
const fillValidForm = (
  getByPlaceholderText: ReturnType<typeof render>['getByPlaceholderText'],
  getByText: ReturnType<typeof render>['getByText'],
) => {
  fireEvent.changeText(getByPlaceholderText('name@example.com'), 'john@mail.com');
  fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '03001234567');
  fireEvent.changeText(getByPlaceholderText('Create a password'), 'StrongPass1');
  fireEvent.changeText(getByPlaceholderText('Repeat your password'), 'StrongPass1');
  fireEvent.press(getByText('I agree to the'));
};

/** Press the Create Account button (not the heading with the same text) */
const pressCreateAccountButton = (getAllByText: ReturnType<typeof render>['getAllByText']) => {
  const matches = getAllByText('Create Account');
  fireEvent.press(matches[matches.length - 1]);
};

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */
describe('Signup Screen — Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    store.dispatch(baseApi.util.resetApiState());
    jest.restoreAllMocks();
  });

  /* ============================================================== */
  /* 1. Rendering                                                    */
  /* ============================================================== */
  it('should render the signup form correctly', () => {
    const { getByText, getByPlaceholderText, getAllByText } = renderSignup(store);

    expect(getAllByText('Create Account').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Join the marketplace to start trading')).toBeTruthy();
    expect(getByPlaceholderText('name@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();
    expect(getByPlaceholderText('Create a password')).toBeTruthy();
    expect(getByPlaceholderText('Repeat your password')).toBeTruthy();
  });

  /* ============================================================== */
  /* 2. Client-side validation (6 rules)                             */
  /* ============================================================== */
  it('should show error when phone number is empty', () => {
    const { getAllByText, getByPlaceholderText } = renderSignup(store);

    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'a@b.com');
    pressCreateAccountButton(getAllByText);

    expect(mockShowErrorToast).toHaveBeenCalledWith('Please enter your phone number');
  });

  it('should show error when email is empty', () => {
    const { getAllByText, getByPlaceholderText } = renderSignup(store);

    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '03001234567');
    pressCreateAccountButton(getAllByText);

    expect(mockShowErrorToast).toHaveBeenCalledWith('Please enter your email');
  });

  it('should show error for invalid email format', () => {
    const { getAllByText, getByPlaceholderText } = renderSignup(store);

    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '03001234567');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'not-valid');
    pressCreateAccountButton(getAllByText);

    expect(mockShowErrorToast).toHaveBeenCalledWith('Please enter a valid email address');
  });

  it('should show error when password is empty', () => {
    const { getAllByText, getByPlaceholderText } = renderSignup(store);

    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '03001234567');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'a@b.com');
    pressCreateAccountButton(getAllByText);

    expect(mockShowErrorToast).toHaveBeenCalledWith('Please create a password');
  });

  it('should show error when password is too short', () => {
    const { getAllByText, getByPlaceholderText } = renderSignup(store);

    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '03001234567');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'short');
    pressCreateAccountButton(getAllByText);

    expect(mockShowErrorToast).toHaveBeenCalledWith('Password must be at least 8 characters long');
  });

  it('should show error when passwords do not match', () => {
    const { getAllByText, getByPlaceholderText } = renderSignup(store);

    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '03001234567');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'StrongPass1');
    fireEvent.changeText(getByPlaceholderText('Repeat your password'), 'Mismatch99');
    pressCreateAccountButton(getAllByText);

    expect(mockShowErrorToast).toHaveBeenCalledWith('Passwords do not match');
  });

  it('should show error when terms checkbox is not checked', () => {
    const { getAllByText, getByPlaceholderText } = renderSignup(store);

    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '03001234567');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'StrongPass1');
    fireEvent.changeText(getByPlaceholderText('Repeat your password'), 'StrongPass1');
    pressCreateAccountButton(getAllByText);

    expect(mockShowErrorToast).toHaveBeenCalledWith('Please agree to the Terms & Privacy Policy');
  });

  /* ============================================================== */
  /* 3. Happy path — full registration flow                          */
  /* ============================================================== */
  it('should complete signup flow: form → API → navigate to OTP', async () => {
    // Arrange: backend returns success
    mockBaseQuery.mockResolvedValueOnce({
      data: { id: 1, email: 'john@mail.com', phone: '03001234567' },
    });

    const { getAllByText, getByPlaceholderText, getByText } = renderSignup(store);

    // Act: fill all fields + agree to terms + press Create Account
    fillValidForm(getByPlaceholderText, getByText);
    pressCreateAccountButton(getAllByText);

    // Step 1: API was called
    await waitFor(() => {
      expect(mockBaseQuery).toHaveBeenCalled();
    });

    const callArgs = mockBaseQuery.mock.calls[0][0];
    expect(callArgs.url).toBe('/users/signup');
    expect(callArgs.method).toBe('POST');
    expect(callArgs.data).toEqual({
      email: 'john@mail.com',
      password: 'StrongPass1',
      phone: '03001234567',
    });

    // Step 2: Wait for async chain to settle (either push or error toast)
    await waitFor(
      () => {
        const pushed = mockPush.mock.calls.length > 0;
        const errored = mockShowErrorToast.mock.calls.length > 0;
        expect(pushed || errored).toBe(true);
      },
      { timeout: 3000 },
    );

    // Step 3: Verify it was the SUCCESS path
    expect(mockShowErrorToast).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(auth)/Otp',
      params: { email: 'john@mail.com' },
    });
  });

  /* ============================================================== */
  /* 4. API failure path                                             */
  /* ============================================================== */
  it('should show error toast on API failure', async () => {
    // Arrange: backend returns error
    mockBaseQuery.mockResolvedValueOnce({
      error: {
        status: 409,
        data: { detail: 'Email already registered' },
      },
    });

    const { getAllByText, getByPlaceholderText, getByText } = renderSignup(store);

    // Act
    fillValidForm(getByPlaceholderText, getByText);
    pressCreateAccountButton(getAllByText);

    // Assert
    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith('Email already registered');
    });

    // Should NOT have navigated
    expect(mockPush).not.toHaveBeenCalled();
  });

  /* ============================================================== */
  /* 5. Navigation links                                             */
  /* ============================================================== */
  it('should navigate to Login when "Log In" link is pressed', () => {
    const { getByText } = renderSignup(store);
    fireEvent.press(getByText('Log In'));

    expect(mockPush).toHaveBeenCalledWith('/(auth)/Login');
  });
});
