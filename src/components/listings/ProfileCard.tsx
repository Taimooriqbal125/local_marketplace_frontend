import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@theme/index';

interface ProfileCardProps {
  name: string;
  avatar: string;
  rating: number | string;
  reviewCount: number;
  onViewProfile?: () => void;
  containerStyle?: ViewStyle;
  nameStyle?: TextStyle;
  ratingStyle?: TextStyle;
  viewProfileTextStyle?: TextStyle;
}

const ProfileCard = ({
  name,
  avatar,
  rating,
  reviewCount,
  onViewProfile,
  containerStyle,
  nameStyle,
  ratingStyle,
  viewProfileTextStyle,
}: ProfileCardProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Profile Image */}
      <Image source={{ uri: avatar }} style={styles.avatar} />

      {/* Name and Rating Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, nameStyle]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={colors.light.warning} />
          <Text style={[styles.rating, ratingStyle]}>{rating}</Text>
          <Text style={styles.reviewCount}>
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </Text>
        </View>
      </View>

      {/* View Profile Button */}
      <Pressable
        onPress={onViewProfile}
        style={({ pressed }) => [
          styles.viewProfileButton,
          Platform.OS === 'ios' && pressed && { opacity: 0.7 },
        ]}
        android_ripple={{ color: colors.light.border, borderless: true }}
      >
        <Text style={[styles.viewProfileText, viewProfileTextStyle]}>View Profile</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.light.subText,
  },
  viewProfileButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.success,
  },
});

export default React.memo(ProfileCard);
