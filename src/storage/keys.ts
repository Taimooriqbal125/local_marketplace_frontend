/**
 * SECURE_KEYS are for sensitive data like tokens.
 * These are stored using expo-secure-store.
 */
export const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  DEVICE_ID: 'device_id',
} as const;

/**
 * CACHE_KEYS are for non-sensitive data like stats and course content.
 * These are stored using @react-native-async-storage/async-storage.
 */
export const CACHE_KEYS = {
  THEME: 'cache.theme',
  CATEGORIES: 'cache.categories',
  HAS_SEEN_HOME_GUIDE: 'cache.hasSeenHomeGuide',
  HAS_SEEN_ORDER_GUIDE: 'cache.hasSeenOrderGuide',
  HAS_SEEN_LISTING_GUIDE: 'cache.hasSeenListingGuide',
  HOME_LISTINGS: 'cache.homeListings',
  LOCATION_COORDS: 'cache.location_coords',
  HAS_SEEN_NOTIFICATION_PROMPT: 'cache.hasSeenNotificationPrompt',
} as const;

/**
 * Cache Config for Expiry (TTL) and Data Slicing (Limits)
 * 1 Hour = 3600000 ms
 * 24 Hours = 86400000 ms
 */
export const CACHE_CONFIG = {
  DEFAULT_LIMIT: 20,
  EXPIRY: {
    FAST: 3600000, // 1 Hour
    NORMAL: 86400000, // 24 Hours
    NONE: null,
  },
} as const;

export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];
export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];
