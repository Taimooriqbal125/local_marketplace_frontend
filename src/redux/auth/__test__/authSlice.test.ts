import authReducer, { setCredentials, logout, clearCredentials, hydrateAuth } from '../authSlice';
import { User } from '@/types';

describe('authSlice', () => {
  const initialState = {
    isAuthenticated: false,
    isHydrated: false,
    user: null,
    status: 'idle' as const,
  };

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    phone: '123456789',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('reducers', () => {
    it('should handle setCredentials', () => {
      const payload = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      const state = authReducer(initialState, setCredentials(payload));
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isHydrated).toBe(true);
      expect(state.status).toBe('succeeded');
    });

    it('should handle logout', () => {
      const loggedInState = {
        isAuthenticated: true,
        isHydrated: true,
        user: mockUser,
        status: 'succeeded' as const,
      };
      const state = authReducer(loggedInState, logout());
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.status).toBe('idle');
    });

    it('should handle clearCredentials', () => {
      const loggedInState = {
        isAuthenticated: true,
        isHydrated: true,
        user: mockUser,
        status: 'succeeded' as const,
      };
      const state = authReducer(loggedInState, clearCredentials());
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.status).toBe('idle');
    });
  });

  describe('extraReducers (hydrateAuth)', () => {
    it('should handle hydrateAuth.pending', () => {
      const action = { type: hydrateAuth.pending.type };
      const state = authReducer(initialState, action);
      expect(state.status).toBe('loading');
    });

    it('should handle hydrateAuth.fulfilled when token exists', () => {
      const payload = { isAuthenticated: true, user: mockUser };
      const action = { type: hydrateAuth.fulfilled.type, payload };
      const state = authReducer(initialState, action);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isHydrated).toBe(true);
      expect(state.status).toBe('succeeded');
    });

    it('should handle hydrateAuth.fulfilled when no token exists', () => {
      const payload = { isAuthenticated: false, user: null };
      const action = { type: hydrateAuth.fulfilled.type, payload };
      const state = authReducer(initialState, action);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isHydrated).toBe(true);
      expect(state.status).toBe('succeeded');
    });

    it('should handle hydrateAuth.rejected', () => {
      const action = { type: hydrateAuth.rejected.type };
      const state = authReducer(initialState, action);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isHydrated).toBe(true);
      expect(state.status).toBe('failed');
    });
  });
});
