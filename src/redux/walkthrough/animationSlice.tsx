import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalkthroughStep {
  animation?: any;
  title: string;
  description: string;
  position?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width?: number;
    height?: number;
  };
  contentPosition?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  width?: number | string;
  focusRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AnimationState {
  isVisible: boolean;
  currentStepIndex: number;
  steps: WalkthroughStep[];
  storageKey: string | null;
}

const initialState: AnimationState = {
  isVisible: false,
  currentStepIndex: 0,
  steps: [],
  storageKey: null,
};

const animationSlice = createSlice({
  name: 'animation',
  initialState,
  reducers: {
    startWalkthrough: (
      state,
      action: PayloadAction<{ steps: WalkthroughStep[]; storageKey: string }>,
    ) => {
      state.steps = action.payload.steps;
      state.storageKey = action.payload.storageKey;
      state.currentStepIndex = 0;
      state.isVisible = true;
    },
    nextStep: (state) => {
      if (state.currentStepIndex < state.steps.length - 1) {
        state.currentStepIndex += 1;
      } else {
        state.isVisible = false;
        state.steps = [];
        state.storageKey = null;
      }
    },
    closeWalkthrough: (state) => {
      state.isVisible = false;
      state.steps = [];
      state.storageKey = null;
    },
    updateSteps: (state, action: PayloadAction<WalkthroughStep[]>) => {
      // Update steps in-place without resetting progress
      state.steps = action.payload;
    },
  },
});

export const { startWalkthrough, nextStep, closeWalkthrough, updateSteps } = animationSlice.actions;

// Selectors
export const selectWalkthrough = (state: any) => state.animation;

export default animationSlice.reducer;
