import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage Wrapper for Caching.
 *
 * Stored shape:
 * {
 *   value: any,
 *   savedAt: number,
 *   expiresAt: number | null
 * }
 *
 * NOTE:
 * - TTL is used to mark data as stale (isStale).
 * - We DO NOT auto-delete on TTL expiry to avoid blank screens offline.
 */
export const storage = {
  /**
   * Save a value with an optional TTL.
   */
  async set(key, value, ttlMs = null) {
    try {
      const now = Date.now();
      const item = {
        value,
        savedAt: now,
        expiresAt: ttlMs ? now + ttlMs : null,
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`AsyncStorage set failed for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Retrieve a value and its metadata.
   * Returns { value, savedAt, expiresAt, isStale } OR null
   */
  async get(key) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;

      const item = JSON.parse(raw);
      const isExpired = item.expiresAt && Date.now() > item.expiresAt;

      return {
        ...item,
        isStale: !!isExpired,
      };
    } catch (error) {
      // Corrupted storage entry
      console.error(`AsyncStorage get failed for key "${key}":`, error);
      await AsyncStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Delete a value.
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`AsyncStorage remove failed for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Hard cleanup for old cache (e.g. > 7 days).
   */
  async removeIfOlderThan(key, maxAgeMs) {
    try {
      const item = await this.get(key);
      if (!item?.savedAt) return false;

      if (Date.now() - item.savedAt > maxAgeMs) {
        await this.remove(key);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`AsyncStorage cleanup failed for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all AsyncStorage data.
   */
  async clearAll() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('AsyncStorage clearAll failed:', error);
      return false;
    }
  },
};

export default storage;
