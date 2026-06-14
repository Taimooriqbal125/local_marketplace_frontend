import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/index';

import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ProfileCard from '@components/listings/ProfileCard';
import ReviewCard from '@components/listings/ReviewCard';
import RequestServiceModal from '@components/modals/RequestServiceModal';
import fontsize from '@theme/fontsize';

import EnableNotificationUI from '@/components/common/EnableNotificationUI';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useGetListingByIdQuery } from '@/redux/listings/listingApi';
import { useGetReviewsByUserIdQuery } from '@/redux/reviews/reviewApi';
import { ApiResponse, Listing, Review } from '@/types';

const formatPrice = (price: string | number | undefined): string => {
  if (price === undefined || price === null || price === '') return 'N/A';
  return `RS ${parseFloat(String(price)).toLocaleString()}`;
};

const getPriceUnit = (type: string | undefined): string => {
  switch (type) {
    case 'hourly':
      return '/hr';
    case 'daily':
      return '/day';
    case 'fixed':
      return ' fixed';
    default:
      return '';
  }
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function ServicesDetails() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const router = useRouter();

  const listingId = Array.isArray(id) ? id[0] : id;

  const { data: currentListing, isLoading: loading } = useGetListingByIdQuery(listingId ?? '', {
    skip: !listingId,
  }) as { data: Listing | undefined; isLoading: boolean };

  const { data: reviewsData, isLoading: reviewsLoading } = useGetReviewsByUserIdQuery(
    currentListing?.seller?.userId ?? '',
    {
      skip: !currentListing?.seller?.userId,
    },
  ) as { data: ApiResponse<Review> | Review[] | undefined; isLoading: boolean };

  const reviews: Review[] = useMemo(() => {
    if (Array.isArray(reviewsData)) return reviewsData;
    return reviewsData?.results || reviewsData?.items || [];
  }, [reviewsData]);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isTruncated, setIsTruncated] = useState<boolean>(false);
  const [isRequestModalOpen, setRequestModalOpen] = useState<boolean>(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const { isPermissionGranted, reInitialize } = usePushNotifications();

  const handleMessage = useCallback((): void => {
    router.push('/(user)/(tabs)/Message');
  }, [router]);

  const handleRequestService = (): void => {
    // Action-based progressive onboarding
    if (!isPermissionGranted) {
      setShowNotificationPrompt(true);
    } else {
      setRequestModalOpen(true);
    }
  };

  const handleEnableNotifications = async (): Promise<void> => {
    await reInitialize();
    setShowNotificationPrompt(false);
    setRequestModalOpen(true); // Automatically proceed to booking
  };

  const handleSkipNotifications = (): void => {
    setShowNotificationPrompt(false);
    setRequestModalOpen(true); // Proceed to booking even if they skip
  };

  if (showNotificationPrompt) {
    return (
      <EnableNotificationUI onEnable={handleEnableNotifications} onSkip={handleSkipNotifications} />
    );
  }

  if (loading && !currentListing) {
    return (
      <ScreenWrapper
        backgroundColor={colors.light.surface}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AppLoadingAnimation visible={true} />
      </ScreenWrapper>
    );
  }

  if (!currentListing && !loading) {
    return (
      <ScreenWrapper
        backgroundColor={colors.light.surface}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            height: '80%',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <MaterialIcons name="error" size={30} color={colors.light.danger} />
          <Text style={{ fontSize: 18, color: colors.light.subText }}>404 Service not found</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              { marginTop: 12 },
              Platform.OS === 'ios' && pressed && { opacity: 0.7 },
            ]}
            android_ripple={{ color: colors.light.altBorder }}
          >
            <Text style={{ color: colors.light.success, fontWeight: 'bold' }}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.light.surface} style={{ paddingBottom: 36 }}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.imageWrapper}>
            {!imageError ? (
              <Image
                source={{
                  uri:
                    currentListing?.imageUrl ||
                    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
                }}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[styles.heroImage, styles.fallbackImageContainer]}>
                <Ionicons name="image-outline" size={64} color={colors.light.success} />
                <Text style={styles.fallbackText}>Image unavailable</Text>
              </View>
            )}

            <View style={styles.overlayTopRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: colors.light.border, borderless: true, radius: 16 }}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={20} color={colors.light.surface} />
              </Pressable>

              <View style={styles.rightIcons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                  ]}
                  android_ripple={{ color: colors.light.border, borderless: true, radius: 16 }}
                >
                  <Ionicons name="heart" size={16} color={colors.light.surface} />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                  ]}
                  android_ripple={{ color: colors.light.border, borderless: true, radius: 16 }}
                >
                  <Ionicons name="share-social" size={16} color={colors.light.surface} />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.badgesRow}>
              <View style={[styles.smallBadge, styles.categoryBadge]}>
                <Text style={[styles.smallBadgeText, styles.categoryBadgeText]}>
                  {currentListing?.categoryName || 'General'}
                </Text>
              </View>

              <View style={[styles.smallBadge, styles.locationBadge]}>
                <Text style={[styles.smallBadgeText, styles.locationBadgeText]}>
                  {currentListing?.serviceLocation || currentListing?.cityName || 'Unknown'}
                </Text>
              </View>

              {currentListing?.isNegotiable && (
                <View style={styles.negotiableBadge}>
                  <Text style={styles.negotiableText}>Negotiable</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{currentListing?.title}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {formatPrice(currentListing?.priceAmount)}
                <Text
                  style={{ fontSize: fontsize.sm, fontWeight: '600', color: colors.light.subText }}
                >
                  {getPriceUnit(currentListing?.priceType)}
                </Text>
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text
                style={styles.description}
                numberOfLines={isExpanded ? undefined : 3}
                onTextLayout={(e) => {
                  if (!isExpanded && e.nativeEvent.lines.length >= 3 && !isTruncated) {
                    requestAnimationFrame(() => setIsTruncated(true));
                  }
                }}
              >
                {currentListing?.description}
              </Text>

              {isTruncated && (
                <Pressable
                  style={({ pressed }) => [Platform.OS === 'ios' && pressed && { opacity: 0.7 }]}
                  onPress={() => setIsExpanded(!isExpanded)}
                >
                  <Text style={styles.readMore}>{isExpanded ? 'Read less' : 'Read more'}</Text>
                </Pressable>
              )}
            </View>

            {/* Profile Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About the Provider</Text>
              <ProfileCard
                name={currentListing?.seller?.name || 'User'}
                avatar={currentListing?.seller?.photoUrl || ''}
                rating={currentListing?.seller?.sellerRatingAvg || '0.0'}
                reviewCount={currentListing?.seller?.sellerRatingCount || 0}
                onViewProfile={() =>
                  router.push({
                    pathname: '/ProfileDetails',
                    params: { id: currentListing?.seller?.userId },
                  })
                }
                containerStyle={{ marginHorizontal: 0, marginVertical: 12 }}
              />
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews about this seller</Text>

              {reviewsLoading && reviews.length === 0 ? (
                <View style={{ marginVertical: 20, alignSelf: 'flex-start' }}>
                  <AppLoadingAnimation
                    visible={true}
                    fullscreen={false}
                    message="Loading reviews..."
                  />
                </View>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <ReviewCard
                    key={review.id || index}
                    reviewerName={review.reviewer?.name || 'Anonymous'}
                    avatar={review.reviewer?.photoUrl || ''}
                    rating={review.rating}
                    reviewDate={formatDate(review.createdAt)}
                    reviewText={review.note}
                    containerStyle={{
                      paddingHorizontal: 0,
                      borderBottomWidth: index === reviews.length - 1 ? 0 : 1,
                    }}
                  />
                ))
              ) : (
                <Text
                  style={{
                    color: colors.light.subText,
                    fontSize: 14,
                    fontStyle: 'italic',
                    marginTop: 8,
                  }}
                >
                  No reviews yet for this seller.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.messageButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.8 },
            ]}
            android_ripple={{ color: colors.light.altBorder }}
            onPress={handleMessage}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.requestButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.8 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            onPress={handleRequestService}
          >
            <Text style={styles.requestButtonText}>Request Service</Text>
          </Pressable>
        </View>
      </View>

      <RequestServiceModal
        visible={isRequestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        service={currentListing ?? null}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  reviewsLoadingContainer: {
    marginVertical: 20,
    alignSelf: 'flex-start',
  },
  noReviewsText: {
    color: colors.light.subText,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  profileCardWrapper: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  imageWrapper: {
    height: 300,
    position: 'relative',
    backgroundColor: colors.light.altBorder,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  fallbackImageContainer: {
    backgroundColor: '#d3d5deff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#787878ff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  overlayTopRow: {
    position: 'absolute',
    top: 14,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: colors.light.infoBackground,
  },
  categoryBadgeText: {
    color: colors.light.success,
  },
  locationBadge: {
    backgroundColor: colors.light.altBorder,
  },
  locationBadgeText: {
    color: colors.light.subText,
  },
  smallBadgeText: {
    fontSize: fontsize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: fontsize.xl,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  price: {
    fontSize: fontsize.xxl,
    fontWeight: '800',
    color: colors.light.text,
    marginRight: 10,
  },
  negotiableBadge: {
    backgroundColor: colors.light.infoBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  negotiableText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.light.success,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: fontsize.xl,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.light.subText,
  },
  readMore: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.success,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  messageButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: colors.light.surface,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.success,
  },
  requestButton: {
    flex: 1.4,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.success,
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.surface,
  },
});
