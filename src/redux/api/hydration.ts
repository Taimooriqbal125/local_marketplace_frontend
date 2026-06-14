import { AppDispatch } from '../store';
import { listingApi } from '../listings/listingApi';
import { categoryApi } from '../category/categoryApi';
import { storage } from '@/storage/storage';
import { CACHE_KEYS } from '@/storage/keys';
import { saveQueryToCache } from './cacheUtils';

/**
 * Hydrates the app with critical data from disk on startup.
 */
export const performInitialHydration = async (dispatch: AppDispatch) => {
  try {
    await hydrateHomeListings(dispatch);
    await hydrateCategories(dispatch);
  } catch (error) {
    console.error('[Hydration] performInitialHydration failed:', error);
  }
};

export { saveQueryToCache };

// --- Private Helpers (Implementation Details) ---

async function hydrateHomeListings(dispatch: AppDispatch) {
  const cache = await storage.get(CACHE_KEYS.HOME_LISTINGS);
  if (!cache?.value) return;

  console.log(`[Hydration] Injecting cached ${CACHE_KEYS.HOME_LISTINGS}`);
  dispatch(listingApi.util.upsertQueryData('getAllListings', { pageSize: 20 }, cache.value));
}

async function hydrateCategories(dispatch: AppDispatch) {
  const cache = await storage.get(CACHE_KEYS.CATEGORIES);
  if (!cache?.value) return;

  console.log(`[Hydration] Injecting cached ${CACHE_KEYS.CATEGORIES}`);
  dispatch(categoryApi.util.upsertQueryData('getParentCategories', undefined, cache.value));
}
