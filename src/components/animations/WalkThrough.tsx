import React from 'react';
import LottieView from 'lottie-react-native';
import { StyleProp, ViewStyle } from 'react-native';

type LottieSource = React.ComponentProps<typeof LottieView>['source'];

interface WalkThroughProps {
  source: LottieSource;
  autoPlay?: boolean;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
  speed?: number;
}

const WalkThrough: React.FC<WalkThroughProps> = ({
  source,
  autoPlay = true,
  loop = false,
  style,
  speed = 1,
}) => {
  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      style={[
        {
          position: 'absolute', // 👈 add this
        },
        style, // 👈 allows top/left/right/bottom from outside
      ]}
    />
  );
};

export default WalkThrough;
