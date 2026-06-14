import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

const initialState: NetworkState = {
  isConnected: true,
  isInternetReachable: true,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkStatus: (
      state,
      action: PayloadAction<{
        isConnected: boolean | null;
        isInternetReachable: boolean | null;
      }>,
    ) => {
      state.isConnected = action.payload.isConnected;
      state.isInternetReachable = action.payload.isInternetReachable;
    },
  },
});

export const { setNetworkStatus } = networkSlice.actions;

export const selectNetworkStatus = (state: { network: NetworkState }) => state.network;

export default networkSlice.reducer;
