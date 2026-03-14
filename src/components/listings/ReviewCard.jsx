import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewCard = ({
  avatar,
  reviewerName,
  reviewDate,
  rating,
  reviewText,
  containerStyle,
  nameStyle,
  dateStyle,
  reviewTextStyle,
}) => {
  // Render star rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#FBBF24' : '#D1D5DB'}
        />,
      );
    }
    return stars;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header: Avatar, Name, and Date */}
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={styles.nameDateContainer}>
          <Text style={[styles.reviewerName, nameStyle]} numberOfLines={1}>
            {reviewerName}
          </Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
        </View>

        <Text style={[styles.reviewDate, dateStyle]} numberOfLines={1}>
          {reviewDate}
        </Text>
      </View>

      {/* Review Text */}
      <Text style={[styles.reviewText, reviewTextStyle]} numberOfLines={0}>
        {reviewText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  nameDateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginLeft: 52,
  },
});

export default ReviewCard;
