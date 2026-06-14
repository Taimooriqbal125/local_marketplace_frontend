import successAnimation from '@assets/animations/order-success.lottie';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import AppLottie from './AppLottie';

interface SuccessAnimationProps {
  visible?: boolean;
  fullscreen?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible = false,
  fullscreen = true,
  size = 180,
  style,
}) => {
  if (!visible) return null;

  return (
    <View style={[fullscreen ? styles.overlay : styles.inlineContainer, style]}>
      <AppLottie
        source={successAnimation}
        autoPlay
        loop={false}
        style={{ width: size, height: size }}
      />

      <View style={styles.textContainer}>
        <Text style={styles.subtext}>You can track your request status in the Orders tab.</Text>
      </View>
    </View>
  );
};

export default SuccessAnimation;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -10, // Pulls the text up slightly closer to the animation
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    color: '#4d5361ff',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
