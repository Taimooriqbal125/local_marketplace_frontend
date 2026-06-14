import { storage } from '@/storage/storage';
import { CACHE_CONFIG } from '@/storage/keys';

/**
 * Specialized utility to save API responses to Cache with Limits and Expiry.
 * Extracted to a separate file to prevent circular dependencies between API slices and Hydration logic.
 */
export const saveQueryToCache = async <T extends NonNullable<unknown>>(
  key: string,
  data: T,
  ttl: number | null = CACHE_CONFIG.EXPIRY.NORMAL,
  limit: number = CACHE_CONFIG.DEFAULT_LIMIT,
) => {
  try {
    if (!data) return;

    const dataToSave = prepareDataForStorage(data, limit);
    await storage.set(key, dataToSave, ttl);
  } catch (error) {
    console.warn(`[Cache] Failed to save query for key: ${key}`, error);
  }
};

/**
 * Normalizes data before storage (e.g., slicing results arrays to stay within limits)
 */
function prepareDataForStorage<T>(data: T, limit: number): T {
  // Handle Listings results array
  if (isPaginationResults(data)) {
    return {
      ...(data as object),
      results: (data as any).results.slice(0, limit),
    } as unknown as T;
  }

  // Handle items fallback
  if (isPaginationItems(data)) {
    return {
      ...(data as object),
      items: (data as any).items.slice(0, limit),
    } as unknown as T;
  }

  // Handle plain arrays (Categories)
  if (Array.isArray(data)) {
    return (data as any[]).slice(0, limit) as unknown as T;
  }

  return data;
}

// Type Guards for internal clarity
function isPaginationResults(data: any): boolean {
  return data && typeof data === 'object' && 'results' in data && Array.isArray(data.results);
}

function isPaginationItems(data: any): boolean {
  return data && typeof data === 'object' && 'items' in data && Array.isArray(data.items);
}
