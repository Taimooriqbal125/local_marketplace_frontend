import { renderHook, act } from '@testing-library/react-native';
import { useHomeWalkthroughData } from '../useHomeWalkthroughData';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { updateSteps } from '@/redux/walkthrough/animationSlice';

// Mock Platform.OS BEFORE importing the hook since IS_ANDROID is module-scoped
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform.OS = 'android';
  return RN;
});

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

jest.mock('@/redux/walkthrough/animationSlice', () => ({
  updateSteps: jest.fn(),
  selectWalkthrough: jest.fn(),
}));

describe('useHomeWalkthroughData hook', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => {
      // Mock the selectWalkthrough slice to return isVisible: true
      return { isVisible: true };
    });
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 40, bottom: 20 });
  });

  it('should initialize with default empty rects and basic steps', () => {
    const { result } = renderHook(() => useHomeWalkthroughData());

    // Check initial layoutRects (all should be null)
    expect(result.current.rects.filters).toBeNull();
    expect(result.current.rects.listingCard).toBeNull();
    expect(result.current.rects.calibration).toBeNull();

    // Check initial steps (focusRects should be undefined since layouts are null)
    expect(result.current.steps.length).toBe(3);
    expect(result.current.steps[0].title).toBe('Welcome to Marketplace');
    expect(result.current.steps[1].title).toBe('Easy filters');
    expect(result.current.steps[1].focusRect).toBeUndefined();
  });

  it('should update rects when setRect is called', () => {
    const { result } = renderHook(() => useHomeWalkthroughData());

    const mockFilterRect = { x: 10, y: 50, width: 100, height: 40 };

    // Act to update the rect
    act(() => {
      result.current.setRect('filters')(mockFilterRect);
    });

    // Assert the state updated
    expect(result.current.rects.filters).toEqual(mockFilterRect);
  });

  it('should calculate focusRects correctly when layout rects are provided', () => {
    const { result } = renderHook(() => useHomeWalkthroughData());

    const mockFilterRect = { x: 10, y: 100, width: 200, height: 50 };

    act(() => {
      result.current.setRect('filters')(mockFilterRect);
    });

    // After updating the rect, the hook's useMemo should recalculate the step
    const filterStep = result.current.steps.find((s) => s.title === 'Easy filters');

    expect(filterStep?.focusRect).toBeDefined();
    // width = 200 - 20 = 180
    // x = 10 + 8 = 18
    // y = 100 - 6 (manual offset) + 0 (calibration offset because no calibration rect) = 94
    expect(filterStep?.focusRect).toMatchObject({
      x: 18,
      width: 180,
      y: 94,
      height: 50,
    });
  });

  it('should apply Android calibration offset if calibration view is shifted', () => {
    const { result } = renderHook(() => useHomeWalkthroughData());

    // Mock inset top = 50
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 50, bottom: 20 });

    act(() => {
      // Provide a calibration rect that starts at y=0 (meaning status bar is excluded from pageY)
      result.current.setRect('calibration')({ x: 0, y: 0, width: 100, height: 10 });
      // Provide a normal filter rect
      result.current.setRect('filters')({ x: 10, y: 100, width: 200, height: 50 });
    });

    const filterStep = result.current.steps.find((s) => s.title === 'Easy filters');

    // calibration.y (0) < insets.top (50) - 5 => true
    // so calibrationOffset = 50
    // new Y = rawY (100) + calibrationOffset (50) + manualOffset (-6) = 144
    expect(filterStep?.focusRect?.y).toBe(144);
  });

  it('should dispatch updateSteps when isVisible is true and layouts are set', () => {
    const { result } = renderHook(() => useHomeWalkthroughData());

    act(() => {
      result.current.setRect('filters')({ x: 10, y: 100, width: 200, height: 50 });
    });

    // It should dispatch because isVisible is true and at least one layout is set
    expect(mockDispatch).toHaveBeenCalledWith(updateSteps(result.current.steps));
  });

  it('should not dispatch updateSteps if walkthrough is not visible', () => {
    (useSelector as unknown as jest.Mock).mockImplementation(() => {
      return { isVisible: false };
    });

    const { result } = renderHook(() => useHomeWalkthroughData());

    act(() => {
      result.current.setRect('filters')({ x: 10, y: 100, width: 200, height: 50 });
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
