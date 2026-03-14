// secureStore.js

import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS } from './keys';

/**
 * Default options for SecureStore.
 * You can tweak these later if your app needs stricter auth behavior.
 */
const DEFAULT_OPTIONS = {
  keychainService: 'local_market_secure_store',
  // requireAuthentication: true, // enable only if you want Face ID / fingerprint / passcode prompt
};

/**
 * Small helper to normalize errors.
 */
const formatError = (action, key, error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new Error(`SecureStore ${action} failed for key "${key}": ${message}`);
};

/**
 * Generic SecureStore service
 */
const secureStore = {
  /**
   * Check whether SecureStore is available on the current device.
   */
  async isAvailable() {
    try {
      return await SecureStore.isAvailableAsync();
    } catch (error) {
      console.error('SecureStore availability check failed:', error);
      return false;
    }
  },

  /**
   * Save a plain string value securely.
   * @param {string} key
   * @param {string} value
   * @param {object} options
   */
  async setItem(key, value, options = {}) {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string.');
      }

      if (typeof value !== 'string') {
        throw new Error('Value must be a string. Use setObject for objects.');
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
   * Returns null if not found.
   * @param {string} key
   * @param {object} options
   */
  async getItem(key, options = {}) {
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
   * @param {string} key
   * @param {object} options
   */
  async removeItem(key, options = {}) {
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
   * @param {string} key
   * @param {object | array} value
   * @param {object} options
   */
  async setObject(key, value, options = {}) {
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
   * Returns null if not found or invalid.
   * @param {string} key
   * @param {object} options
   */
  async getObject(key, options = {}) {
    try {
      const value = await this.getItem(key, options);

      if (value == null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(formatError('getObject', key, error));
      return null;
    }
  },

  /**
   * Check whether a key exists.
   * @param {string} key
   * @param {object} options
   */
  async hasItem(key, options = {}) {
    try {
      const value = await this.getItem(key, options);
      return value !== null;
    } catch (error) {
      console.error(formatError('hasItem', key, error));
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // Token helpers (Professional shortcuts)
  // ---------------------------------------------------------------------------

  async setAccessToken(token) {
    return this.setItem(SECURE_KEYS.ACCESS_TOKEN, token);
  },

  async getAccessToken() {
    return this.getItem(SECURE_KEYS.ACCESS_TOKEN);
  },

  async removeAccessToken() {
    return this.removeItem(SECURE_KEYS.ACCESS_TOKEN);
  },

  async setRefreshToken(token) {
    return this.setItem(SECURE_KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken() {
    return this.getItem(SECURE_KEYS.REFRESH_TOKEN);
  },

  async removeRefreshToken() {
    return this.removeItem(SECURE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Save both auth tokens together.
   */
  async saveAuthTokens({ accessToken, refreshToken }) {
    try {
      const results = await Promise.all([
        accessToken ? this.setAccessToken(accessToken) : Promise.resolve(true),
        refreshToken ? this.setRefreshToken(refreshToken) : Promise.resolve(true),
      ]);

      return results.every(Boolean);
    } catch (error) {
      console.error('Saving auth tokens failed:', error);
      return false;
    }
  },

  /**
   * Read both auth tokens together.
   */
  async getAuthTokens() {
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
  async clearAuthStorage() {
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
