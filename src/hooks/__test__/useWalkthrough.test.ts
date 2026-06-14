import { renderHook, waitFor } from '@testing-library/react-native';
import { useWalkthrough } from '../useWalkthrough';
import { useDispatch, useSelector } from 'react-redux';
import { storage } from '@/storage';
import { startWalkthrough } from '@/redux/walkthrough/animationSlice';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('@/redux/walkthrough/animationSlice', () => ({
  startWalkthrough: jest.fn(),
  selectWalkthrough: jest.fn(),
}));

describe('useWalkthrough hook', () => {
  const mockDispatch = jest.fn();
  const mockStorageKey = 'cache.testGuide';
  const mockSteps = [
    { title: 'Step 1', description: 'Test 1' },
    { title: 'Step 2', description: 'Test 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    // Suppress console.error inside tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not check storage or dispatch if ready is false', async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ isVisible: false });

    renderHook(() => useWalkthrough(mockStorageKey, mockSteps as any, false));

    // Wait to ensure no async side effects happened
    await waitFor(() => {
      expect(storage.get).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  it('should not dispatch if storage returns a truthy value (already seen)', async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ isVisible: false });
    (storage.get as jest.Mock).mockResolvedValueOnce({ value: true }); // Seen

    renderHook(() => useWalkthrough(mockStorageKey, mockSteps as any, true));

    await waitFor(() => {
      expect(storage.get).toHaveBeenCalledWith(mockStorageKey);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  it('should dispatch startWalkthrough if not seen and not currently visible', async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ isVisible: false });
    (storage.get as jest.Mock).mockResolvedValueOnce(null); // Not seen

    renderHook(() => useWalkthrough(mockStorageKey, mockSteps as any, true));

    await waitFor(() => {
      expect(storage.get).toHaveBeenCalledWith(mockStorageKey);
      expect(mockDispatch).toHaveBeenCalledWith(
        startWalkthrough({ steps: mockSteps, storageKey: mockStorageKey }),
      );
    });
  });

  it('should not dispatch if not seen but currently visible', async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ isVisible: true });
    (storage.get as jest.Mock).mockResolvedValueOnce(null); // Not seen

    renderHook(() => useWalkthrough(mockStorageKey, mockSteps as any, true));

    await waitFor(() => {
      expect(storage.get).toHaveBeenCalledWith(mockStorageKey);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  it('should handle storage.get error gracefully without crashing', async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ isVisible: false });
    (storage.get as jest.Mock).mockRejectedValueOnce(new Error('Storage Error'));

    renderHook(() => useWalkthrough(mockStorageKey, mockSteps as any, true));

    await waitFor(() => {
      expect(storage.get).toHaveBeenCalledWith(mockStorageKey);
      expect(console.error).toHaveBeenCalledWith(
        'Error checking walkthrough status:',
        expect.any(Error),
      );
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  it('should mark as seen in storage when walkthrough finishes (isVisible goes from true to false)', async () => {
    let currentIsVisible = false;
    (useSelector as unknown as jest.Mock).mockImplementation(() => ({
      isVisible: currentIsVisible,
    }));
    (storage.get as jest.Mock).mockResolvedValueOnce(null); // Not seen

    const { rerender } = renderHook(() => useWalkthrough(mockStorageKey, mockSteps as any, true));

    // Phase 1: Not seen -> dispatches startWalkthrough
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        startWalkthrough({ steps: mockSteps, storageKey: mockStorageKey }),
      );
    });

    // Phase 2: Walkthrough is now visible (simulate Redux state update)
    currentIsVisible = true;
    rerender({});

    // Storage should not be updated yet
    expect(storage.set).not.toHaveBeenCalled();

    // Phase 3: Walkthrough finishes (isVisible becomes false)
    currentIsVisible = false;
    rerender({});

    // Storage should now be updated
    await waitFor(() => {
      expect(storage.set).toHaveBeenCalledWith(mockStorageKey, true);
    });
  });
});
