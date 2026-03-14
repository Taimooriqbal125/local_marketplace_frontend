import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '@services/auth/authService';
import { secureStore } from '@/storage';

/**
 * Initial State
 */
const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,
};

/**
 * Async Thunks
 */

// Login Thunk
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.loginUser(credentials);
    return data; // Expected: { access_token, refresh_token, user }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Login failed';
    return rejectWithValue(message);
  }
});

// Signup/Register Thunk
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await authService.createUser(userData);
    return data; // Expected: { ...user_data }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Registration failed';
    return rejectWithValue(message);
  }
});

// Logout Thunk
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return true;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Initialize Auth Thunk (Load user from storage on app start)
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const user = await secureStore.getObject('user_data');
      const token = await secureStore.getAccessToken();

      if (user && token) {
        return { user, isAuthenticated: true };
      }
      return { user: null, isAuthenticated: false };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous action to clear errors
    clearError: (state) => {
      state.error = null;
    },
    // Manual state update helper
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Depending on backend, you might auto-login or just return user
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      // Initialize Auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
