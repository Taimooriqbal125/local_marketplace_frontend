import negotiableAnimation from '@assets/animations/negotiable.lottie';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import AppLottie from './AppLottie';

interface NegotiableAnimationProps {
  visible?: boolean;
  fullscreen?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const NegotiableAnimation: React.FC<NegotiableAnimationProps> = ({
  visible = false,
  fullscreen = true,
  size = 180,
  style,
}) => {
  if (!visible) return null;

  return (
    <View style={[fullscreen ? styles.overlay : styles.inlineContainer, style]}>
      <AppLottie
        source={negotiableAnimation}
        autoPlay
        loop={false}
        style={{ width: size, height: size }}
      />

      <View>
        <Text style={styles.text}>Save money with negotiable prices</Text>
      </View>
    </View>
  );
};

export default NegotiableAnimation;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 999,
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
