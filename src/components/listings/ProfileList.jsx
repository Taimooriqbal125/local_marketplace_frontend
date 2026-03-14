import { Image, Pressable, StyleSheet, Text } from 'react-native';

export default function ProfileList({
  image,
  title,
  price,
  onPress,
  containerStyle,
  imageStyle,
  titleStyle,
  priceStyle,
}) {
  return (
    <Pressable activeOpacity={0.85} onPress={onPress} style={[styles.card, containerStyle]}>
      <Image source={{ uri: image }} style={[styles.image, imageStyle]} resizeMode="cover" />

      <Text style={[styles.title, titleStyle]} numberOfLines={2} ellipsizeMode="tail">
        {title}
      </Text>

      <Text style={[styles.price, priceStyle]}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 20,
    minHeight: 40,
  },
  price: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
});
