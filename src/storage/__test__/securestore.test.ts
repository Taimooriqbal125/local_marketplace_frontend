import * as SecureStore from 'expo-secure-store';
import secureStore from '../securestore';
import { SECURE_KEYS } from '../keys';

// Mock the expo-secure-store module
jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(),
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

/**
 * Unit tests for the custom secureStore utility wrapper.
 * Ensures robust type safety, error handling, and correct interaction with expo-secure-store.
 */
describe('secureStore utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation: SecureStore is available
    (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);

    // Suppress console logs/errors during testing to keep output clean
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true if SecureStore is available', async () => {
      const result = await secureStore.isAvailable();
      expect(result).toBe(true);
      expect(SecureStore.isAvailableAsync).toHaveBeenCalledTimes(1);
    });

    it('should return false and log error if checking availability throws', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Device not supported'),
      );

      const result = await secureStore.isAvailable();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'SecureStore availability check failed:',
        expect.any(Error),
      );
    });
  });

  describe('setItem', () => {
    it('should securely store a string value', async () => {
      const result = await secureStore.setItem(SECURE_KEYS.DEVICE_ID, 'test-device-123');

      expect(result).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_KEYS.DEVICE_ID,
        'test-device-123',
        { keychainService: 'local_market_secure_store' },
      );
    });

    it('should return false if key is invalid', async () => {
      const result = await secureStore.setItem('' as any, 'test-value');

      expect(result).toBe(false);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return false if SecureStore is unavailable', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      const result = await secureStore.setItem(SECURE_KEYS.DEVICE_ID, 'test-value');

      expect(result).toBe(false);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should return false if setItemAsync throws an error', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Write failed'));

      const result = await secureStore.setItem(SECURE_KEYS.DEVICE_ID, 'test-value');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getItem', () => {
    it('should retrieve a stored string value', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-device-123');

      const result = await secureStore.getItem(SECURE_KEYS.DEVICE_ID);

      expect(result).toBe('test-device-123');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(SECURE_KEYS.DEVICE_ID, {
        keychainService: 'local_market_secure_store',
      });
    });

    it('should return null if key is invalid', async () => {
      const result = await secureStore.getItem('' as any);

      expect(result).toBeNull();
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('should return null if SecureStore is unavailable', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      const result = await secureStore.getItem(SECURE_KEYS.DEVICE_ID);

      expect(result).toBeNull();
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should delete a stored value', async () => {
      const result = await secureStore.removeItem(SECURE_KEYS.DEVICE_ID);

      expect(result).toBe(true);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SECURE_KEYS.DEVICE_ID, {
        keychainService: 'local_market_secure_store',
      });
    });

    it('should return false if deletion fails', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

      const result = await secureStore.removeItem(SECURE_KEYS.DEVICE_ID);

      expect(result).toBe(false);
    });
  });

  describe('setObject & getObject', () => {
    const testObject = { id: 1, theme: 'dark' };

    it('should securely store a JSON object', async () => {
      const result = await secureStore.setObject(SECURE_KEYS.USER_DATA, testObject);

      expect(result).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_KEYS.USER_DATA,
        JSON.stringify(testObject),
        { keychainService: 'local_market_secure_store' },
      );
    });

    it('should retrieve and parse a JSON object', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(testObject));

      const result = await secureStore.getObject<typeof testObject>(SECURE_KEYS.USER_DATA);

      expect(result).toEqual(testObject);
    });

    it('should return null when retrieving an object if not found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await secureStore.getObject(SECURE_KEYS.USER_DATA);

      expect(result).toBeNull();
    });

    it('should return null if JSON parsing fails', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('invalid-json');

      const result = await secureStore.getObject(SECURE_KEYS.USER_DATA);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('hasItem', () => {
    it('should return true if item exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('some-value');

      const result = await secureStore.hasItem(SECURE_KEYS.DEVICE_ID);

      expect(result).toBe(true);
    });

    it('should return false if item does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await secureStore.hasItem(SECURE_KEYS.DEVICE_ID);

      expect(result).toBe(false);
    });
  });

  describe('Auth Tokens specific methods', () => {
    it('should save auth tokens successfully', async () => {
      const result = await secureStore.saveAuthTokens({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      });

      expect(result).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_KEYS.ACCESS_TOKEN,
        'access-123',
        expect.any(Object),
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_KEYS.REFRESH_TOKEN,
        'refresh-456',
        expect.any(Object),
      );
    });

    it('should get auth tokens', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-123') // First call for access token
        .mockResolvedValueOnce('refresh-456'); // Second call for refresh token

      const tokens = await secureStore.getAuthTokens();

      expect(tokens).toEqual({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      });
    });

    it('should return nulls if auth tokens are missing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const tokens = await secureStore.getAuthTokens();

      expect(tokens).toEqual({
        accessToken: null,
        refreshToken: null,
      });
    });

    it('should clear auth storage completely', async () => {
      const result = await secureStore.clearAuthStorage();

      expect(result).toBe(true);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_KEYS.ACCESS_TOKEN,
        expect.any(Object),
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_KEYS.REFRESH_TOKEN,
        expect.any(Object),
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_KEYS.USER_DATA,
        expect.any(Object),
      );
    });
  });
});
