import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { secureStore, storage } from '@/storage';
import { SECURE_KEYS } from '@/storage/keys';
import { RootState } from '../store';

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  status: 'idle',
};

/**
 * Hydrate auth state from secure storage
 */
export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  try {
    const token = await secureStore.getAccessToken();
    const userData = await secureStore.getObject<User>(SECURE_KEYS.USER_DATA);

    console.log('[hydrateAuth] Token exists:', !!token);
    if (token) {
      console.log('[hydrateAuth] Access Token:', token);
    }
    console.log('[hydrateAuth] User data exists:', !!userData);

    if (token) {
      return { isAuthenticated: true, user: userData };
    }

    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('[hydrateAuth] Failed:', error);
    return { isAuthenticated: false, user: null };
  }
});

/**
 * Logout user: clears storage then state
 */
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  try {
    await secureStore.clearAuthStorage();
    // Targeted cleanup: Clear ONLY session-based personal stats
    // Walkthrough status is device-based and persists across logins
    await storage.multiRemove([]);
  } catch (error) {
    console.warn('Failed to clear storage during logout', error);
  } finally {
    dispatch(authSlice.actions.logout());
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User | null;
        accessToken: string;
        refreshToken?: string | null;
      }>,
    ) => {
      const { user, accessToken } = action.payload;

      // Log access token for debugging (remove in production)
      console.log('[AuthSlice] New Access Token:', accessToken);

      if (user !== undefined) {
        state.user = user;
      }
      state.isAuthenticated = !!accessToken;
      state.isHydrated = true;
      state.status = 'succeeded';
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
      state.status = 'idle';
    },

    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
      state.status = 'idle';
    },
  },

  extraReducers: (builder) => {
    builder.addCase(hydrateAuth.pending, (state) => {
      state.status = 'loading';
    });

    builder.addCase(hydrateAuth.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
      state.isHydrated = true;
      state.status = 'succeeded';
    });

    builder.addCase(hydrateAuth.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isHydrated = true;
      state.status = 'failed';
    });
  },
});

export const { setCredentials, logout, clearCredentials } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsHydrated = (state: RootState) => state.auth.isHydrated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAdmin = (state: RootState) => !!state.auth.user?.isAdmin;

export default authSlice.reducer;
