import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileViewCard({
  title = '4.9',
  subtitle = '',
  subtitleSuffix = '',
  iconName = 'star',
  iconSize = 18,
  iconColor = '#3B82F6',
  containerStyle,
  ratingStyle,
  reviewTextStyle,
  istitle = false,
  toptitle = '',
}) {
  return (
    <View style={[styles.card, containerStyle]}>
      {istitle ? (
        <Text style={styles.toptitle}>{toptitle}</Text>
      ) : (
        <Ionicons name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
      )}

      <Text style={[styles.rating, ratingStyle]}>{title}</Text>

      {Boolean(subtitle) && (
        <Text style={[styles.reviewText, reviewTextStyle]}>
          {subtitle} {subtitleSuffix}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 88,
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginBottom: 6,
  },
  rating: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 26,
  },
  toptitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  reviewText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
