import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const ServiceItemCard = ({ title, price, image, containerStyle }) => {
  return (
    <View style={[styles.card, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.price}>{price}</Text>
      </View>
      {Boolean(image) && <Image source={{ uri: image }} style={styles.thumbnail} />}
    </View>
  );
};

export default ServiceItemCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
});
