import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import AppLottie from './AppLottie';
import locationAnimation from '@assets/animations/glasses.lottie';

interface LocationAnimationProps {
  visible?: boolean;
  fullscreen?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const LocationAnimation: React.FC<LocationAnimationProps> = ({
  visible = false,
  fullscreen = true,
  size = 180,
  style,
}) => {
  if (!visible) return null;

  return (
    <View style={[fullscreen ? styles.overlay : styles.inlineContainer, style]}>
      <AppLottie
        source={locationAnimation}
        autoPlay
        loop={false}
        style={{ width: size, height: size }}
      />
      <View>
        <Text style={styles.text}>Get your nearest services...</Text>
      </View>
    </View>
  );
};

export default LocationAnimation;

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
