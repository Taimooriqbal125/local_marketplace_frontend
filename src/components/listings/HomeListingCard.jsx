import { Ionicons } from '@expo/vector-icons';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const HomeListingCard = ({
  image,
  isTopRated = false,
  isNegotiable = false,
  category = 'HOME SERVICES',
  location = 'Manhattan',
  title = 'Premium Deep Cleaning',
  providerName = 'Mike R.',
  providerAvatar = 'M',
  rating = 5.0,
  price = 25,
  priceUnit = 'hr',
  onPress,
  containerStyle,
}) => {
  return (
    <Pressable
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image Section with Tags */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

        {/* Top Rated Badge - Top Left */}
        {isTopRated && (
          <View style={[styles.badge, styles.topRatedBadge]}>
            <Text style={styles.badgeText}>TOP RATED</Text>
          </View>
        )}

        {/* Negotiable Badge - Top Right */}
        {isNegotiable && (
          <View style={[styles.badge, styles.negotiableBadge]}>
            <Text style={styles.badgeText}>NEGOTIABLE</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Category and Location */}
        <View style={styles.headerRow}>
          <Text style={styles.category}>{category}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Provider Info and Price */}
        <View style={styles.footerRow}>
          {/* Provider Info */}
          <View style={styles.providerContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{providerAvatar}</Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{providerName}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${price}</Text>
            <Text style={styles.priceUnit}>/{priceUnit}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    top: 12,
  },
  topRatedBadge: {
    left: 12,
    backgroundColor: '#10B981',
  },
  negotiableBadge: {
    right: 12,
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  providerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    gap: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  priceUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
});

export default HomeListingCard;
