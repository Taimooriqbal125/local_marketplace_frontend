import { saveQueryToCache } from '../cacheUtils';
import { storage } from '@/storage/storage';
import { CACHE_CONFIG } from '@/storage/keys';

// Mock storage
jest.mock('@/storage/storage', () => ({
  storage: {
    set: jest.fn(),
  },
}));

describe('cacheUtils', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    (storage.set as jest.Mock).mockClear();
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should slice plain arrays to the default limit', async () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    const limit = 5;

    // Passing undefined allows the default parameter (CACHE_CONFIG.EXPIRY.NORMAL) to trigger
    await saveQueryToCache('test-key', largeArray, undefined, limit);

    expect(storage.set).toHaveBeenCalledWith(
      'test-key',
      largeArray.slice(0, limit),
      CACHE_CONFIG.EXPIRY.NORMAL,
    );
  });

  it('should handle pagination response with "results" key', async () => {
    const mockResponse = {
      count: 100,
      results: Array.from({ length: 50 }, (_, i) => ({ id: i })),
    };
    const limit = 10;

    await saveQueryToCache('test-key', mockResponse, null, limit);

    const callArgs = (storage.set as jest.Mock).mock.calls[0];
    expect(callArgs[1].results.length).toBe(limit);
    expect(callArgs[1].count).toBe(100);
  });

  it('should handle pagination response with "items" key', async () => {
    const mockResponse = {
      total: 100,
      items: Array.from({ length: 50 }, (_, i) => ({ id: i })),
    };
    const limit = 10;

    await saveQueryToCache('test-key', mockResponse, null, limit);

    const callArgs = (storage.set as jest.Mock).mock.calls[0];
    expect(callArgs[1].items.length).toBe(limit);
    expect(callArgs[1].total).toBe(100);
  });

  it('should save plain objects without slicing', async () => {
    const plainObject = { id: '1', name: 'Test' };

    await saveQueryToCache('test-key', plainObject);

    expect(storage.set).toHaveBeenCalledWith('test-key', plainObject, CACHE_CONFIG.EXPIRY.NORMAL);
  });

  it('should handle storage errors gracefully', async () => {
    (storage.set as jest.Mock).mockRejectedValue(new Error('Storage failure'));

    await expect(saveQueryToCache('test-key', { data: 'test' })).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should not save null or undefined data', async () => {
    await saveQueryToCache('test-key', null as any);
    await saveQueryToCache('test-key', undefined as any);

    expect(storage.set).not.toHaveBeenCalled();
  });
});
