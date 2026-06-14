import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startWalkthrough,
  selectWalkthrough,
  WalkthroughStep,
} from '@/redux/walkthrough/animationSlice';
import { storage } from '@/storage';

/**
 * Custom hook to trigger a walkthrough if it hasn't been seen yet.
 *
 * @param storageKey - The key from CACHE_KEYS to check in AsyncStorage.
 * @param steps - Array of WalkthroughStep to display.
 * @param ready - Boolean flag to indicate if the data is ready to start (e.g. layouts measured).
 */
export const useWalkthrough = (storageKey: string, steps: WalkthroughStep[], ready = true) => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectWalkthrough);

  // Track if this instance has already checked/triggered persistence
  const hasChecked = useRef(false);
  const wasTriggeredByMe = useRef(false);

  useEffect(() => {
    const checkAndStart = async () => {
      // Avoid re-checking if we already triggered in this lifecycle
      // Also wait if we are not ready yet
      if (hasChecked.current || !ready) return;

      try {
        const result = await storage.get(storageKey);

        if (!result && !isVisible) {
          dispatch(startWalkthrough({ steps, storageKey }));
          wasTriggeredByMe.current = true;
          hasChecked.current = true; // Mark as checked after triggering start
        } else if (result) {
          hasChecked.current = true; // Mark as checked if already seen
        }
      } catch (error) {
        console.error('Error checking walkthrough status:', error);
      }
    };

    checkAndStart();
    // Re-run whenever ready status changes or steps are potentially updated
  }, [storageKey, dispatch, isVisible, ready, steps]);

  // Effect to mark as seen when the walkthrough finishes
  useEffect(() => {
    if (!isVisible && wasTriggeredByMe.current) {
      // Walkthrough just finished or was skipped
      storage.set(storageKey, true);
      wasTriggeredByMe.current = false;
    }
  }, [isVisible, storageKey]);
};
