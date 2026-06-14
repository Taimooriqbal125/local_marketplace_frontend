import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Overlay from '../Overlay';
import { useDispatch, useSelector } from 'react-redux';
import { closeWalkthrough, nextStep } from '@/redux/walkthrough/animationSlice';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@/redux/walkthrough/animationSlice', () => ({
  selectWalkthrough: jest.fn(),
  closeWalkthrough: jest.fn(() => ({ type: 'walkthrough/close' })),
  nextStep: jest.fn(() => ({ type: 'walkthrough/nextStep' })),
}));

jest.mock('@/components/animations/WalkThrough', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const MockWalkThrough = (props: Record<string, unknown>) =>
    ReactMock.createElement(RN.View, { ...props, testID: 'walkthrough-animation' });
  MockWalkThrough.displayName = 'MockWalkThrough';
  return MockWalkThrough;
});

describe('Overlay component', () => {
  const mockDispatch = jest.fn();

  const baseFocusStep = {
    title: 'Easy filters',
    description: 'Use filters to find the perfect service.',
    focusRect: { x: 10, y: 100, width: 200, height: 50 },
    contentPosition: { top: 200 },
  };

  const baseAnimationStep = {
    title: 'Welcome to Marketplace',
    description: 'Discover amazing services.',
    animation: 'mock-animation-source',
    position: { top: 100 },
    contentPosition: { top: 300 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('should render null when isVisible is false', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: false,
      currentStepIndex: 0,
      steps: [baseFocusStep],
    });

    const { toJSON } = render(React.createElement(Overlay));
    expect(toJSON()).toBeNull();
  });

  it('should render null when steps array is empty', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [],
    });

    const { toJSON } = render(React.createElement(Overlay));
    expect(toJSON()).toBeNull();
  });

  it('should render the modal with step title and description', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseFocusStep],
    });

    const { getByText } = render(React.createElement(Overlay));

    expect(getByText('Easy filters')).toBeTruthy();
    expect(getByText('Use filters to find the perfect service.')).toBeTruthy();
  });

  it('should show "Next" text when not on the last step', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseFocusStep, baseAnimationStep],
    });

    const { getByText } = render(React.createElement(Overlay));
    expect(getByText('Next')).toBeTruthy();
  });

  it('should show "Finish" text on the last step', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 1,
      steps: [baseFocusStep, baseAnimationStep],
    });

    const { getByText } = render(React.createElement(Overlay));
    expect(getByText('Finish')).toBeTruthy();
  });

  it('should dispatch closeWalkthrough when Skip is pressed', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseFocusStep],
    });

    const { getByText } = render(React.createElement(Overlay));
    fireEvent.press(getByText('Skip'));

    expect(mockDispatch).toHaveBeenCalledWith(closeWalkthrough());
  });

  it('should dispatch nextStep when Next is pressed', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseFocusStep, baseAnimationStep],
    });

    const { getByText } = render(React.createElement(Overlay));
    fireEvent.press(getByText('Next'));

    expect(mockDispatch).toHaveBeenCalledWith(nextStep());
  });

  it('should render spotlight cutout when step has focusRect', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseFocusStep],
    });

    const { toJSON } = render(React.createElement(Overlay));
    const tree = JSON.stringify(toJSON());

    // SpotlightCutout renders 5 Views (4 dark regions + 1 border).
    // The full dark background view should NOT be present.
    // Verify the cutout border color is rendered
    expect(tree).toContain('#10B981');
  });

  it('should render full dark background when step has no focusRect', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseAnimationStep],
    });

    const { toJSON } = render(React.createElement(Overlay));
    const tree = JSON.stringify(toJSON());

    // Full dark overlay should be present
    expect(tree).toContain('rgba(13, 14, 14, 0.75)');
    // The green cutout border should NOT be present
    expect(tree).not.toContain('#10B981');
  });

  it('should render WalkThrough animation only when step has no focusRect', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseAnimationStep],
    });

    const { queryByTestId } = render(React.createElement(Overlay));
    expect(queryByTestId('walkthrough-animation')).toBeTruthy();
  });

  it('should NOT render WalkThrough animation when step has focusRect', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({
      isVisible: true,
      currentStepIndex: 0,
      steps: [baseFocusStep],
    });

    const { queryByTestId } = render(React.createElement(Overlay));
    expect(queryByTestId('walkthrough-animation')).toBeNull();
  });
});
