import { CACHE_KEYS, SECURE_KEYS } from './keys';
import secureStore from './securestore';
import storage from './storage';

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

// Default export as a combined object for convenience
export default {
  secure: secureStore,
  cache: storage,
  keys: {
    secure: SECURE_KEYS,
    cache: CACHE_KEYS,
  },
};
