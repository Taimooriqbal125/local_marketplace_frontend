import WalkThrough from '@/components/animations/WalkThrough';
import { closeWalkthrough, nextStep, selectWalkthrough } from '@/redux/walkthrough/animationSlice';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const OVERLAY_COLOR = 'rgba(13, 14, 14, 0.75)';
const PADDING = 3; // padding around the target element

/**
 * SpotlightCutout: Renders 4 dark rectangles around the target,
 * leaving the target area transparent so the actual UI element shows through.
 *
 *  ┌──────────────────────────┐
 *  │       TOP DARK           │
 *  ├────┬──────────────┬──────┤
 *  │LEFT│  (transparent)│RIGHT│
 *  │DARK│   TARGET AREA │DARK │
 *  ├────┴──────────────┴──────┤
 *  │      BOTTOM DARK         │
 *  └──────────────────────────┘
 */
const SpotlightCutout: React.FC<{
  rect: { x: number; y: number; width: number; height: number };
}> = ({ rect }) => {
  const cutTop = rect.y - PADDING;
  const cutLeft = rect.x - PADDING;
  const cutWidth = rect.width + PADDING * 2;
  const cutHeight = rect.height + PADDING * 2;

  return (
    <>
      {/* Top dark region */}
      <View style={[styles.darkRegion, { top: 0, left: 0, right: 0, height: cutTop }]} />
      {/* Bottom dark region */}
      <View
        style={[styles.darkRegion, { top: cutTop + cutHeight, left: 0, right: 0, bottom: 0 }]}
      />
      {/* Left dark region */}
      <View
        style={[styles.darkRegion, { top: cutTop, left: 0, width: cutLeft, height: cutHeight }]}
      />
      {/* Right dark region */}
      <View
        style={[
          styles.darkRegion,
          {
            top: cutTop,
            left: cutLeft + cutWidth,
            right: 0,
            height: cutHeight,
          },
        ]}
      />
      {/* Green border around the cutout */}
      <View
        style={[
          styles.cutoutBorder,
          {
            top: cutTop,
            left: cutLeft,
            width: cutWidth,
            height: cutHeight,
          },
        ]}
      />
    </>
  );
};

const Overlay: React.FC = () => {
  const dispatch = useDispatch();
  const { isVisible, currentStepIndex, steps } = useSelector(selectWalkthrough);

  if (!isVisible || steps.length === 0) return null;

  const step = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const hasFocus = !!step.focusRect;

  return (
    <Modal transparent visible={isVisible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* If focusRect exists → spotlight cutout, otherwise → full dark overlay */}
        {hasFocus ? <SpotlightCutout rect={step.focusRect!} /> : <View style={styles.background} />}

        {/* Lottie Animation - positioned dynamically */}
        {!hasFocus && (
          <WalkThrough source={step.animation} style={[styles.animation, step.position]} />
        )}

        {/* Content Box - dynamic position and width from step data */}
        <View
          style={[styles.content, step.contentPosition, step.width ? { width: step.width } : {}]}
        >
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => dispatch(closeWalkthrough())}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => dispatch(nextStep())}
              activeOpacity={0.8}
            >
              <Text style={styles.nextText}>{isLastStep ? 'Finish' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Overlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: OVERLAY_COLOR,
  },
  darkRegion: {
    position: 'absolute',
    backgroundColor: OVERLAY_COLOR,
  },
  cutoutBorder: {
    position: 'absolute',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#10B981',
    zIndex: 5,
  },
  animation: {
    width: 220,
    height: 220,
  },
  content: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.88,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  nextText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
