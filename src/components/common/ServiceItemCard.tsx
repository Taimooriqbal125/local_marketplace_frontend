import React from 'react';
import { Image, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors } from '@theme/index';

interface ServiceItemCardProps {
  title: string;
  price: string;
  image?: string;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  priceStyle?: StyleProp<TextStyle>;
}

const ServiceItemCard: React.FC<ServiceItemCardProps> = ({
  title,
  price,
  image,
  containerStyle,
  titleStyle,
  priceStyle,
}) => {
  return (
    <View style={[styles.card, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>

        <Text style={[styles.price, priceStyle]}>{price}</Text>
      </View>

      {!!image && <Image source={{ uri: image }} style={styles.thumbnail} />}
    </View>
  );
};

export default React.memo(ServiceItemCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: colors.light.primary,
    fontWeight: '600',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
});
