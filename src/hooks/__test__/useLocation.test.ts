import { renderHook, act } from '@testing-library/react-native';
import { useLocation } from '../useLocation';
import * as Location from 'expo-location';
import { useUpdateMyLocationMutation } from '@/redux/profiles/profileApi';
import { storage } from '@/storage/storage';
import { CACHE_KEYS } from '@/storage/keys';

// Mock dependencies
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
  },
}));

jest.mock('@/redux/profiles/profileApi', () => ({
  useUpdateMyLocationMutation: jest.fn(),
}));

jest.mock('@/storage/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('useLocation hook', () => {
  const mockUpdateLocation = jest.fn();
  const mockUnwrap = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Redux mutation return value
    mockUpdateLocation.mockReturnValue({ unwrap: mockUnwrap });
    (useUpdateMyLocationMutation as jest.Mock).mockReturnValue([mockUpdateLocation]);

    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return cached location if valid and not stale', async () => {
    // Arrange
    (storage.get as jest.Mock).mockResolvedValueOnce({
      value: { latitude: 10, longitude: 20 },
      isStale: false,
    });

    const { result } = renderHook(() => useLocation());

    // Act
    let response;
    await act(async () => {
      response = await result.current.requestAndSyncLocation();
    });

    // Assert
    expect(response).toEqual({ success: true, latitude: 10, longitude: 20 });
    expect(storage.get).toHaveBeenCalledWith(CACHE_KEYS.LOCATION_COORDS);
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(mockUpdateLocation).not.toHaveBeenCalled();
  });

  it('should return PERMISSION_DENIED if foreground permissions are rejected', async () => {
    // Arrange: Cache empty, permissions denied
    (storage.get as jest.Mock).mockResolvedValueOnce(null);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocation());

    // Act
    let response;
    await act(async () => {
      response = await result.current.requestAndSyncLocation();
    });

    // Assert
    expect(response).toEqual({ error: 'PERMISSION_DENIED' });
    expect(Location.hasServicesEnabledAsync).not.toHaveBeenCalled();
  });

  it('should return LOCATION_DISABLED if device location services are off', async () => {
    // Arrange
    (storage.get as jest.Mock).mockResolvedValueOnce(null);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValueOnce(false);

    const { result } = renderHook(() => useLocation());

    // Act
    let response;
    await act(async () => {
      response = await result.current.requestAndSyncLocation();
    });

    // Assert
    expect(response).toEqual({ error: 'LOCATION_DISABLED' });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('should fetch location, sync with backend, and save to cache on success', async () => {
    // Arrange
    (storage.get as jest.Mock).mockResolvedValueOnce(null); // No cache
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValueOnce(true);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 35.123, longitude: -120.456 },
    });
    mockUnwrap.mockResolvedValueOnce({}); // backend success

    const { result } = renderHook(() => useLocation());

    // Act
    let response;
    await act(async () => {
      response = await result.current.requestAndSyncLocation();
    });

    // Assert
    expect(response).toEqual({ success: true, latitude: 35.123, longitude: -120.456 });
    expect(mockUpdateLocation).toHaveBeenCalledWith({ latitude: 35.123, longitude: -120.456 });
    expect(mockUnwrap).toHaveBeenCalled();
    expect(storage.set).toHaveBeenCalledWith(CACHE_KEYS.LOCATION_COORDS, {
      latitude: 35.123,
      longitude: -120.456,
    });
  });

  it('should handle backend sync failure or other exceptions and return UNKNOWN_ERROR', async () => {
    // Arrange
    (storage.get as jest.Mock).mockResolvedValueOnce(null);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValueOnce(true);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 10, longitude: 20 },
    });

    // Simulate backend throwing an error
    mockUnwrap.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useLocation());

    // Act
    let response;
    await act(async () => {
      response = await result.current.requestAndSyncLocation();
    });

    // Assert
    expect(response).toEqual({ error: 'UNKNOWN_ERROR' });
    expect(console.error).toHaveBeenCalled();
    expect(storage.set).not.toHaveBeenCalled(); // Shouldn't cache if backend sync fails
  });

  it('should toggle loading state correctly during execution', async () => {
    // Arrange
    (storage.get as jest.Mock).mockResolvedValueOnce(null);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ status: 'granted' }), 100)),
    );
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValueOnce(true);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 10, longitude: 20 },
    });
    mockUnwrap.mockResolvedValueOnce({});

    const { result } = renderHook(() => useLocation());

    // Check initial loading state
    expect(result.current.loading).toBe(false);

    // Act
    let promise: any;
    act(() => {
      promise = result.current.requestAndSyncLocation();
    });

    // Check loading state while promise is resolving
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await promise;
    });

    // Check loading state after completion
    expect(result.current.loading).toBe(false);
  });
});
