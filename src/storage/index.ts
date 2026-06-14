import { CACHE_KEYS, SECURE_KEYS } from './keys';
import secureStore from './securestore';
import { storage } from './storage';

/**
 * Unified Storage Service
 *
 * Usage:
 * import { secureStore, storage, SECURE_KEYS, CACHE_KEYS } from '@/storage';
 *
 * - secureStore: For sensitive data (Tokens, User Data)
 * - storage: For non-sensitive data/caching (Stats, Settings, Course Content)
 */

export { CACHE_KEYS, SECURE_KEYS, secureStore, storage };

/**
 * Combined storage interface for convenience
 */
export interface UnifiedStorage {
  secure: typeof secureStore;
  cache: typeof storage;
  keys: {
    secure: typeof SECURE_KEYS;
    cache: typeof CACHE_KEYS;
  };
}

// Default export as a combined object
const unifiedStorage: UnifiedStorage = {
  secure: secureStore,
  cache: storage,
  keys: {
    secure: SECURE_KEYS,
    cache: CACHE_KEYS,
  },
};

export default unifiedStorage;
