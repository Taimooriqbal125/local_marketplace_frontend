import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import AppLottie from './AppLottie';
import loadingAnimation from '../../assets/animations/loading.lottie';

interface AppLoadingAnimationProps {
  visible?: boolean;
  fullscreen?: boolean;
  size?: number;
  message?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const AppLoadingAnimation: React.FC<AppLoadingAnimationProps> = ({
  visible = false,
  fullscreen = true,
  size = 300,
  message = 'Getting things ready...',
  style,
  textStyle,
}) => {
  if (!visible) return null;

  return (
    <View style={[fullscreen ? styles.overlay : styles.inlineContainer, style]}>
      <AppLottie source={loadingAnimation} autoPlay loop style={{ width: size, height: size }} />

      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
};

export default AppLoadingAnimation;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 999,
  },

  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  text: {
    marginTop: 10,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
});
