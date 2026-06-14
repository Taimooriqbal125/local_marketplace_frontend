import networkReducer, { setNetworkStatus, selectNetworkStatus } from '../networkSlice';

describe('networkSlice', () => {
  const initialState = {
    isConnected: true,
    isInternetReachable: true,
  };

  it('should return the initial state', () => {
    expect(networkReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setNetworkStatus', () => {
    const newStatus = {
      isConnected: false,
      isInternetReachable: false,
    };

    const actual = networkReducer(initialState, setNetworkStatus(newStatus));

    expect(actual.isConnected).toBe(false);
    expect(actual.isInternetReachable).toBe(false);
  });

  it('should handle null values in setNetworkStatus', () => {
    const newStatus = {
      isConnected: null,
      isInternetReachable: null,
    };

    const actual = networkReducer(initialState, setNetworkStatus(newStatus));

    expect(actual.isConnected).toBeNull();
    expect(actual.isInternetReachable).toBeNull();
  });

  describe('selectors', () => {
    it('should select the network status', () => {
      const state = {
        network: {
          isConnected: true,
          isInternetReachable: false,
        },
      };

      const selected = selectNetworkStatus(state);
      expect(selected).toEqual(state.network);
    });
  });
});
