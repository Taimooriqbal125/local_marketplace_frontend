import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppSelector } from '@/redux/hooks';
import { selectNetworkStatus } from '@/redux/network/networkSlice';
import { colors } from '@theme/index';

const NoInternetBanner = () => {
  const insets = useSafeAreaInsets();
  const { isConnected } = useAppSelector(selectNetworkStatus);
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (isConnected === false) {
      translateY.value = withSpring(insets.top > 0 ? insets.top : 20, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
    }
  }, [isConnected, insets.top, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (isConnected === null) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <Feather name="wifi-off" size={18} color={colors.light.surface} />
        <Text style={styles.text}>No Internet Connection. Please check your network.</Text>
      </View>
    </Animated.View>
  );
};

export default NoInternetBanner;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: colors.light.danger,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    shadowColor: colors.light.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: {
    color: colors.light.surface,
    fontSize: 13,
    fontWeight: '600',
  },
});
