import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';

/**
 * Redux Store Configuration
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here as you build them
  },
  // Middleware is automatically set up by configureStore (includes thunk)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Often useful in RN for complex data, tweak if needed
    }),
});

export default store;
