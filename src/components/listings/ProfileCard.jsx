import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
}) => {
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
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={[styles.rating, ratingStyle]}>{rating}</Text>
          <Text style={styles.reviewCount}>
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </Text>
        </View>
      </View>

      {/* View Profile Button */}
      <Pressable onPress={onViewProfile} style={styles.viewProfileButton}>
        <Text style={[styles.viewProfileText, viewProfileTextStyle]}>View Profile</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
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
    color: '#111827',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewProfileButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default ProfileCard;
