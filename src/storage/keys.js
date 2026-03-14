/**
 * SECURE_KEYS are for sensitive data like tokens.
 * These are stored using expo-secure-store.
 */
export const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  DEVICE_ID: 'device_id',
};

/**
 * CACHE_KEYS are for non-sensitive data like stats and course content.
 * These are stored using @react-native-async-storage/async-storage.
 */
export const CACHE_KEYS = {
  GLOBAL_STATS: 'cache.globalStats',
  MY_SUMMARY: 'cache.mySummary',
  INSTRUCTOR_SUMMARY: 'cache.instructorSummary',
  GET_COURSE_CONTENT: 'cache.getCourseContent',
  THEME: 'cache.theme',
};
