import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';

interface ReviewCardProps {
  avatar: string;
  reviewerName: string;
  reviewDate: string;
  rating: number;
  reviewText: string;
  serviceTitle?: string;
  serviceImageUrl?: string;
  categoryName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  nameStyle?: StyleProp<TextStyle>;
  dateStyle?: StyleProp<TextStyle>;
  reviewTextStyle?: StyleProp<TextStyle>;
}

const ReviewCard = ({
  avatar,
  reviewerName,
  reviewDate,
  rating,
  reviewText,
  serviceTitle,
  serviceImageUrl,
  categoryName,
  containerStyle,
  nameStyle,
  dateStyle,
  reviewTextStyle,
}: ReviewCardProps) => {
  // Render star rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? colors.light.warning : colors.light.border}
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
      {!!reviewText && reviewText.trim().length > 0 && (
        <Text style={[styles.reviewText, reviewTextStyle]} numberOfLines={0}>
          {reviewText.trim()}
        </Text>
      )}

      {/* Referenced Service Snippet */}
      {serviceTitle && (
        <View style={styles.serviceSnippet}>
          {serviceImageUrl && (
            <Image source={{ uri: serviceImageUrl }} style={styles.serviceImage} />
          )}
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {serviceTitle}
            </Text>
            {categoryName && (
              <Text style={styles.serviceCategory} numberOfLines={1}>
                {categoryName}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.light.mutedText} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.altBorder,
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
    backgroundColor: colors.light.altBackground,
  },
  nameDateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.light.mutedText,
    fontWeight: '400',
  },
  reviewText: {
    fontSize: 14,
    color: colors.light.subText,
    lineHeight: 20,
    marginLeft: 52,
    marginBottom: 8,
  },
  serviceSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 52,
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.light.altBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  serviceImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: colors.light.altBackground,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },
  serviceCategory: {
    fontSize: 11,
    color: colors.light.subText,
    marginTop: 2,
  },
});

export default React.memo(ReviewCard);
