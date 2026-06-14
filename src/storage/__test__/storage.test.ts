import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';

// Mock the async-storage module
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

/**
 * Unit tests for the custom storage wrapper over AsyncStorage.
 * Ensures data serialization, TTL logic, error handling, and correct interaction with AsyncStorage.
 */
describe('storage utility', () => {
  const MOCK_TIME = 1000000000000; // e.g. some timestamp in 2001

  beforeEach(() => {
    jest.clearAllMocks();

    // Use fake timers to control Date.now() for TTL and expiration logic
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_TIME);

    // Suppress console error logs to keep test output clean during rejection tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('set', () => {
    it('should save a value without a TTL', async () => {
      const result = await storage.set('test-key', { foo: 'bar' });

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({
          value: { foo: 'bar' },
          savedAt: MOCK_TIME,
          expiresAt: null,
        }),
      );
    });

    it('should save a value with a TTL', async () => {
      const ttlMs = 3600000; // 1 hour
      const result = await storage.set('test-key', 'some-value', ttlMs);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({
          value: 'some-value',
          savedAt: MOCK_TIME,
          expiresAt: MOCK_TIME + ttlMs,
        }),
      );
    });

    it('should catch error and return false if setItem fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Set Error'));

      const result = await storage.set('test-key', 'val');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return null if key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await storage.get('missing-key');

      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('missing-key');
    });

    it('should return parsed value with isStale: false for valid non-expiring cache', async () => {
      const mockData = {
        value: { foo: 'bar' },
        savedAt: MOCK_TIME,
        expiresAt: null,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await storage.get('test-key');

      expect(result).toEqual({ ...mockData, isStale: false });
    });

    it('should return parsed value with isStale: false if not expired', async () => {
      const mockData = {
        value: 'test',
        savedAt: MOCK_TIME,
        expiresAt: MOCK_TIME + 1000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await storage.get('test-key');

      expect(result).toEqual({ ...mockData, isStale: false });
    });

    it('should return parsed value with isStale: true if expired', async () => {
      const mockData = {
        value: 'test',
        savedAt: MOCK_TIME - 2000,
        expiresAt: MOCK_TIME - 1000, // Expired 1 second ago
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await storage.get('test-key');

      expect(result).toEqual({ ...mockData, isStale: true });
    });

    it('should handle corrupted JSON and remove item, returning null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid-json{[');

      const result = await storage.get('corrupted-key');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('corrupted-key');
    });

    it('should handle getItem rejection, return null, and not throw', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Read Error'));

      const result = await storage.get('error-key');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      // On generic read error, the catch block calls removeItem
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('error-key');
    });
  });

  describe('remove', () => {
    it('should remove a single item', async () => {
      const result = await storage.remove('test-key');

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should return false if removal fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Remove Error'));

      const result = await storage.remove('test-key');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('multiRemove', () => {
    it('should remove multiple items', async () => {
      const keys = ['key1', 'key2'];
      const result = await storage.multiRemove(keys);

      expect(result).toBe(true);
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(keys);
    });

    it('should return false if multiRemove fails', async () => {
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(new Error('MultiRemove Error'));

      const result = await storage.multiRemove(['key1']);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeIfOlderThan', () => {
    it('should return false if item does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await storage.removeIfOlderThan('test-key', 5000);

      expect(result).toBe(false);
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return false if item exists but is not older than maxAgeMs', async () => {
      const mockData = {
        value: 'test',
        savedAt: MOCK_TIME - 1000, // 1 second old
        expiresAt: null,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await storage.removeIfOlderThan('test-key', 5000); // Only remove if > 5s old

      expect(result).toBe(false);
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should remove item and return true if older than maxAgeMs', async () => {
      const mockData = {
        value: 'test',
        savedAt: MOCK_TIME - 6000, // 6 seconds old
        expiresAt: null,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await storage.removeIfOlderThan('test-key', 5000); // Remove if > 5s old

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should return false if parsing/getting fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Get Error'));

      const result = await storage.removeIfOlderThan('test-key', 5000);

      // The get() method catches the error, calls removeItem (cleanup), and returns null
      // then removeIfOlderThan receives null and returns false.
      expect(result).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all async storage', async () => {
      const result = await storage.clearAll();

      expect(result).toBe(true);
      expect(AsyncStorage.clear).toHaveBeenCalledTimes(1);
    });

    it('should return false if clear fails', async () => {
      (AsyncStorage.clear as jest.Mock).mockRejectedValueOnce(new Error('Clear Error'));

      const result = await storage.clearAll();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
