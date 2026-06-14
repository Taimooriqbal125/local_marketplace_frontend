import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@theme/index';

interface HomeListingCardProps {
  image: string;
  isTopRated?: boolean;
  isNegotiable?: boolean;
  category?: string;
  location?: string;
  title?: string;
  providerName?: string;
  providerAvatar?: string;
  rating?: number;
  price?: number | string;
  priceUnit?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

/**
 * REFACTORED: HomeListingCard
 * Following Clean Code principles: "Small!", "Do One Thing", and "Stepdown Rule".
 */
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
}: HomeListingCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        containerStyle,
        Platform.OS === 'ios' && pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
      android_ripple={{ color: colors.light.border }}
    >
      <ListingImageSection uri={image} isTrusted={isTopRated} isNegotiable={isNegotiable} />

      <View style={styles.content}>
        <CategoryLocationRow category={category} location={location} />

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.footerRow}>
          <ProviderSection name={providerName} avatar={providerAvatar} rating={rating} />
          <PriceDisplay value={price} unit={priceUnit} />
        </View>
      </View>
    </Pressable>
  );
};

// --- Internal Sub-components (One Level of Abstraction) ---

const ListingImageSection = ({
  uri,
  isTrusted,
  isNegotiable,
}: {
  uri: string;
  isTrusted: boolean;
  isNegotiable: boolean;
}) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <View style={styles.imageContainer}>
      {!imageError && uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.image, styles.fallbackImageContainer]}>
          <Ionicons name="image-outline" size={48} color={colors.light.primary} />
          <Text style={styles.fallbackText}>Image unavailable</Text>
        </View>
      )}

      {isTrusted && (
        <View style={[styles.badge, styles.topRatedBadge]}>
          <Text style={styles.badgeText}>TRUSTED SELLER</Text>
        </View>
      )}

      {isNegotiable && (
        <View style={[styles.badge, styles.negotiableBadge]}>
          <Text style={styles.negotiableBadgeText}>NEGOTIABLE</Text>
        </View>
      )}
    </View>
  );
};

const CategoryLocationRow = ({ category, location }: { category: string; location: string }) => (
  <View style={styles.headerRow}>
    <Text style={styles.category}>{category}</Text>
    <View style={styles.locationContainer}>
      <Ionicons name="location" size={14} color={colors.light.subText} />
      <Text style={styles.locationText}>{location}</Text>
    </View>
  </View>
);

const ProviderSection = ({
  name,
  avatar,
  rating,
}: {
  name: string;
  avatar?: string;
  rating: number;
}) => (
  <View style={styles.providerContainer}>
    <Avatar source={avatar} name={name} />
    <View style={styles.providerInfo}>
      <Text style={styles.providerName}>{name}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color={colors.light.warning} />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    </View>
  </View>
);

const Avatar = ({ source, name }: { source?: string; name: string }) => {
  const [error, setError] = React.useState(false);
  const showImage = source && source !== 'U' && !error;

  return (
    <View style={styles.avatarContainer}>
      {showImage ? (
        <Image
          source={{ uri: source }}
          style={styles.avatarImage}
          contentFit="cover"
          transition={200}
          onError={() => setError(true)}
        />
      ) : (
        <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text>
      )}
    </View>
  );
};

const PriceDisplay = ({ value, unit }: { value: number | string; unit: string }) => (
  <View style={styles.priceContainer}>
    <Text style={styles.price}>RS{value}</Text>
    <Text style={styles.priceUnit}>/{unit}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.surface,
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
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackImageContainer: {
    backgroundColor: colors.light.altBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: colors.light.mutedText,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
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
    backgroundColor: colors.light.success,
  },
  negotiableBadge: {
    right: 12,
    backgroundColor: colors.light.infoBackground,
  },
  negotiableBadgeText: {
    color: colors.light.info,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeText: {
    color: colors.light.surface,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: colors.light.subText,
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
    color: colors.light.subText,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
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
    backgroundColor: colors.light.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
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
    color: colors.light.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.light.subText,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.success,
  },
  priceUnit: {
    fontSize: 14,
    color: colors.light.subText,
    fontWeight: '400',
  },
});

export default React.memo(HomeListingCard);
