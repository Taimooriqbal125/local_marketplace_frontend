import React from 'react';
import {
  Image,
  ImageStyle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors } from '@theme/index';

interface ProfileListProps {
  image: string;
  title: string;
  price: number | string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  priceStyle?: TextStyle;
}

const ProfileList = ({
  image,
  title,
  price,
  onPress,
  containerStyle,
  imageStyle,
  titleStyle,
  priceStyle,
}: ProfileListProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        containerStyle,
        Platform.OS === 'ios' && pressed && { opacity: 0.8 },
      ]}
      android_ripple={{ color: colors.light.border }}
    >
      <Image source={{ uri: image }} style={[styles.image, imageStyle]} resizeMode="cover" />

      <Text style={[styles.title, titleStyle]} numberOfLines={2} ellipsizeMode="tail">
        {title}
      </Text>

      <Text style={[styles.price, priceStyle]}>{price}</Text>
    </Pressable>
  );
};

export default React.memo(ProfileList);

const styles = StyleSheet.create({
  card: {
    width: 132,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    backgroundColor: colors.light.altBackground,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    lineHeight: 20,
    minHeight: 25,
  },
  price: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.success,
  },
});
