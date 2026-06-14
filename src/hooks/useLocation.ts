import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useUpdateMyLocationMutation } from '@/redux/profiles/profileApi';
import { storage } from '@/storage/storage';
import { CACHE_KEYS } from '@/storage/keys';

export const useLocation = () => {
  const [updateLocation] = useUpdateMyLocationMutation();
  const [loading, setLoading] = useState(false);

  const requestAndSyncLocation = useCallback(async () => {
    setLoading(true);

    try {
      // 0. Check cache first
      const cachedLocation = await storage.get(CACHE_KEYS.LOCATION_COORDS);
      if (cachedLocation && !cachedLocation.isStale && cachedLocation.value) {
        return {
          success: true,
          latitude: cachedLocation.value.latitude,
          longitude: cachedLocation.value.longitude,
        };
      }

      // 1. Check permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return { error: 'PERMISSION_DENIED' };
      }

      // 2. Check device location services (IMPORTANT)
      const enabled = await Location.hasServicesEnabledAsync();

      if (!enabled) {
        return { error: 'LOCATION_DISABLED' };
      }

      // 3. Get location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 4. Sync backend
      await updateLocation({ latitude, longitude }).unwrap();

      // 5. Save to cache
      await storage.set(CACHE_KEYS.LOCATION_COORDS, { latitude, longitude });

      return { success: true, latitude, longitude };
    } catch (error) {
      console.error('Location sync error:', error);
      return { error: 'UNKNOWN_ERROR' };
    } finally {
      setLoading(false);
    }
  }, [updateLocation]);

  return { requestAndSyncLocation, loading };
};
