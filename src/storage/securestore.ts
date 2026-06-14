import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS, SecureKey } from './keys';

/**
 * Default options for SecureStore.
 */
const DEFAULT_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'local_market_secure_store',
};

/**
 * Helper to normalize errors.
 */
const formatError = (action: string, key: string, error: unknown): Error => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new Error(`SecureStore ${action} failed for key "${key}": ${message}`);
};

interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Generic SecureStore service
 */
const secureStore = {
  /**
   * Check whether SecureStore is available on the current device.
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await SecureStore.isAvailableAsync();
    } catch (error) {
      console.error('SecureStore availability check failed:', error);
      return false;
    }
  },

  /**
   * Save a plain string value securely.
   */
  async setItem(
    key: SecureKey,
    value: string,
    options: SecureStore.SecureStoreOptions = {},
  ): Promise<boolean> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string.');
      }

      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('SecureStore is not available on this device.');
      }

      await SecureStore.setItemAsync(key, value, {
        ...DEFAULT_OPTIONS,
        ...options,
      });

      return true;
    } catch (error) {
      console.error(formatError('setItem', key, error));
      return false;
    }
  },

  /**
   * Read a plain string value securely.
   */
  async getItem(
    key: SecureKey,
    options: SecureStore.SecureStoreOptions = {},
  ): Promise<string | null> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string.');
      }

      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('SecureStore is not available on this device.');
      }

      const value = await SecureStore.getItemAsync(key, {
        ...DEFAULT_OPTIONS,
        ...options,
      });

      return value;
    } catch (error) {
      console.error(formatError('getItem', key, error));
      return null;
    }
  },

  /**
   * Delete a value securely.
   */
  async removeItem(key: SecureKey, options: SecureStore.SecureStoreOptions = {}): Promise<boolean> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string.');
      }

      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('SecureStore is not available on this device.');
      }

      await SecureStore.deleteItemAsync(key, {
        ...DEFAULT_OPTIONS,
        ...options,
      });

      return true;
    } catch (error) {
      console.error(formatError('removeItem', key, error));
      return false;
    }
  },

  /**
   * Save any serializable object as JSON.
   */
  async setObject<T>(
    key: SecureKey,
    value: T,
    options: SecureStore.SecureStoreOptions = {},
  ): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.setItem(key, jsonValue, options);
    } catch (error) {
      console.error(formatError('setObject', key, error));
      return false;
    }
  },

  /**
   * Read and parse JSON object.
   */
  async getObject<T>(
    key: SecureKey,
    options: SecureStore.SecureStoreOptions = {},
  ): Promise<T | null> {
    try {
      const value = await this.getItem(key, options);

      if (value == null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(formatError('getObject', key, error));
      return null;
    }
  },

  /**
   * Check whether a key exists.
   */
  async hasItem(key: SecureKey, options: SecureStore.SecureStoreOptions = {}): Promise<boolean> {
    try {
      const value = await this.getItem(key, options);
      return value !== null;
    } catch (error) {
      console.error(formatError('hasItem', key, error));
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // Token helpers
  // ---------------------------------------------------------------------------

  async setAccessToken(token: string): Promise<boolean> {
    return this.setItem(SECURE_KEYS.ACCESS_TOKEN, token);
  },

  async getAccessToken(): Promise<string | null> {
    return await this.getItem(SECURE_KEYS.ACCESS_TOKEN);
  },

  async removeAccessToken(): Promise<boolean> {
    return this.removeItem(SECURE_KEYS.ACCESS_TOKEN);
  },

  async setRefreshToken(token: string): Promise<boolean> {
    return this.setItem(SECURE_KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await this.getItem(SECURE_KEYS.REFRESH_TOKEN);
  },

  async removeRefreshToken(): Promise<boolean> {
    return this.removeItem(SECURE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Save both auth tokens together.
   */
  async saveAuthTokens({ accessToken, refreshToken }: AuthTokens): Promise<boolean> {
    try {
      const results = await Promise.all([
        accessToken ? this.setAccessToken(accessToken) : Promise.resolve(true),
        refreshToken ? this.setRefreshToken(refreshToken) : Promise.resolve(true),
      ]);

      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);

      return results.every(Boolean);
    } catch (error) {
      console.error('Saving auth tokens failed:', error);
      return false;
    }
  },

  /**
   * Read both auth tokens together.
   */
  async getAuthTokens(): Promise<AuthTokens> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Reading auth tokens failed:', error);
      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  },

  /**
   * Clear auth-related sensitive data.
   */
  async clearAuthStorage(): Promise<boolean> {
    try {
      const results = await Promise.all([
        this.removeAccessToken(),
        this.removeRefreshToken(),
        this.removeItem(SECURE_KEYS.USER_DATA),
      ]);

      return results.every(Boolean);
    } catch (error) {
      console.error('Clearing auth storage failed:', error);
      return false;
    }
  },
};

export default secureStore;
