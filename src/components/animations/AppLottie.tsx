import React from 'react';
import LottieView from 'lottie-react-native';
import { StyleProp, ViewStyle } from 'react-native';

type LottieSource = React.ComponentProps<typeof LottieView>['source'];

interface AppLottieProps {
  source: LottieSource;
  autoPlay?: boolean;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
  speed?: number;
}

const AppLottie: React.FC<AppLottieProps> = ({
  source,
  autoPlay = true,
  loop = false,
  style,
  speed = 1,
}) => {
  return <LottieView source={source} autoPlay={autoPlay} loop={loop} speed={speed} style={style} />;
};

export default AppLottie;
