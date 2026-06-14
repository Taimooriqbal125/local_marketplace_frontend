import { performInitialHydration } from '../hydration';
import { storage } from '@/storage/storage';
import { CACHE_KEYS } from '@/storage/keys';

// Mock dependencies
jest.mock('@/storage/storage', () => ({
  storage: {
    get: jest.fn(),
  },
}));

describe('hydration logic', () => {
  const mockDispatch = jest.fn();
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockDispatch.mockClear();
    (storage.get as jest.Mock).mockClear();
    // Silence console.error for tests that expect failures
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should hydrate home listings if they exist in storage', async () => {
    const mockListings = [{ id: '1', title: 'Listing 1' }];
    (storage.get as jest.Mock).mockImplementation((key) => {
      if (key === CACHE_KEYS.HOME_LISTINGS) {
        return Promise.resolve({ value: mockListings });
      }
      return Promise.resolve(null);
    });

    await performInitialHydration(mockDispatch);

    // Verify storage was checked
    expect(storage.get).toHaveBeenCalledWith(CACHE_KEYS.HOME_LISTINGS);

    // Verify dispatch was called with the specific upsert action
    // Note: RTK Query action creators like upsertQueryData return a thunk
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));

    // In actual execution, RTK Query actions have unique identities,
    // but we can check if it's called with a function that would represent the thunk
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should hydrate categories if they exist in storage', async () => {
    const mockCategories = [{ id: '1', name: 'Electronics' }];
    (storage.get as jest.Mock).mockImplementation((key) => {
      if (key === CACHE_KEYS.CATEGORIES) {
        return Promise.resolve({ value: mockCategories });
      }
      return Promise.resolve(null);
    });

    await performInitialHydration(mockDispatch);

    expect(storage.get).toHaveBeenCalledWith(CACHE_KEYS.CATEGORIES);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should not dispatch if storage is empty', async () => {
    (storage.get as jest.Mock).mockResolvedValue(null);

    await performInitialHydration(mockDispatch);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should handle storage errors gracefully', async () => {
    (storage.get as jest.Mock).mockRejectedValue(new Error('Storage failure'));

    // Should not throw
    await expect(performInitialHydration(mockDispatch)).resolves.not.toThrow();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
