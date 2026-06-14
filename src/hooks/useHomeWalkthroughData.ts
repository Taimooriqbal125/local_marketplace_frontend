import { useState, useMemo, useEffect } from 'react';
import testAnimation from '@/assets/animations/welcome.lottie';
import { Dimensions, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  WalkthroughStep,
  updateSteps,
  selectWalkthrough,
} from '@/redux/walkthrough/animationSlice';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device-aware offset normalization
const IS_ANDROID = Platform.OS === 'android';

/**
 * Custom hook to manage Home Screen walkthrough data and dynamic rects.
 */
export const useHomeWalkthroughData = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { isVisible } = useSelector(selectWalkthrough);

  // Layout Rects State
  const [layoutRects, setLayoutRects] = useState({
    negotiable: null as any,
    listingCard: null as any,
    filters: null as any,
    headerActions: null as any,
    calibration: null as any, // New calibration view at top: 0
  });

  // Dynamic Step Generation
  const steps: WalkthroughStep[] = useMemo(() => {
    /**
     * ANDROID CALIBRATION LOGIC
     * On some Androids, pageY includes the status bar, on others it doesn't.
     * We compare the calibration view (placed at top:0) with the expected inset.
     */
    const getCalibrationOffset = () => {
      if (!IS_ANDROID || !layoutRects.calibration) return 0;

      // Calibration view is at top: 0 in the ScreenWrapper.
      // ScreenWrapper content starts at 'insets.top' on the screen.
      // If calibration.y is 0, it means pageY is window-relative (missing status bar).
      // So we must add the expected insets.top to align with the Overlay Modal.
      if (layoutRects.calibration.y < insets.top - 5) {
        return insets.top;
      }
      return 0;
    };

    const calibrationOffset = getCalibrationOffset();

    const getNormalizedY = (rawY: number, manualOffset: number, isHeader = false) => {
      if (isHeader) {
        // If calibration detects a shift, we use the offset + small centering adjustment
        const centering = insets.top > 30 ? 4 : 2;
        return rawY + calibrationOffset + centering;
      }

      // Base formula using calibration to normalize all screen positions
      return rawY + calibrationOffset + manualOffset;
    };

    return [
      {
        title: 'Welcome to Marketplace',
        description: 'Discover amazing services and deals tailored just for you.',
        animation: testAnimation,
        position: { top: SCREEN_HEIGHT / 2 - 130 },
        contentPosition: { top: SCREEN_HEIGHT / 2 + 40 },
      },

      {
        title: 'Easy filters',
        description: 'Use filters to find the perfect service for your needs.',
        focusRect: layoutRects.filters
          ? {
              ...layoutRects.filters,
              x: layoutRects.filters.x + 8,
              width: layoutRects.filters.width - 20,
              y: getNormalizedY(layoutRects.filters.y, -6),
            }
          : undefined,
        contentPosition: { top: 250 },
      },
      {
        title: 'Service Listings',
        description: 'Browse through all available services and tap to see full details.',
        focusRect: layoutRects.listingCard
          ? {
              ...layoutRects.listingCard,
              x: layoutRects.listingCard.x + 12,
              width: layoutRects.listingCard.width - 24,
              y: getNormalizedY(layoutRects.listingCard.y, 5),
            }
          : undefined,
        contentPosition: { bottom: 100 },
      },
    ];
  }, [layoutRects, insets.top]);

  // Live-update Redux steps whenever layoutRects change AND walkthrough is visible
  useEffect(() => {
    const hasAnyLayout = Object.values(layoutRects).some((r) => r !== null);
    if (isVisible && hasAnyLayout) {
      dispatch(updateSteps(steps));
    }
  }, [steps, layoutRects, dispatch, isVisible]);

  // Handlers for measuring layouts
  const setRect = (key: keyof typeof layoutRects) => (rect: any) => {
    requestAnimationFrame(() => {
      setLayoutRects((prev) => ({ ...prev, [key]: rect }));
    });
  };

  return {
    steps,
    setRect,
    rects: layoutRects,
  };
};
