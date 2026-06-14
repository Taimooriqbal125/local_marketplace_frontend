import { useGetAllListingsQuery } from '@/redux/listings/listingApi';
import { useGetProfileByUserIdQuery } from '@/redux/profiles/profileApi';
import { useGetReviewsByUserIdQuery } from '@/redux/reviews/reviewApi';
import { ApiResponse, Listing, Profile, Review } from '@/types';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import Header from '@components/common/Header';
import ProfileViewCard from '@components/common/ProfileViewCard';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ProfileList from '@components/listings/ProfileList';
import ReviewCard from '@components/listings/ReviewCard';
import { Ionicons } from '@expo/vector-icons';
import fontsize from '@theme/fontsize';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@theme/index';

const getMemberSince = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
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

export default function ProfileDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const profileId = Array.isArray(id) ? id[0] : id;

  const { data: currentProfile, isLoading: loading } = useGetProfileByUserIdQuery(profileId ?? '', {
    skip: !profileId,
  }) as { data: Profile | undefined; isLoading: boolean };

  const { data: listingsData, isLoading: listingsLoading } = useGetAllListingsQuery(
    { profileId: profileId ?? '' },
    { skip: !profileId },
  );

  const listings: Listing[] = useMemo(() => {
    if (Array.isArray(listingsData)) return listingsData;
    return (listingsData as ApiResponse<Listing>)?.results || (listingsData as any)?.items || [];
  }, [listingsData]);

  const totalListings =
    (listingsData as any)?.total || (listingsData as any)?.totalServices || listings.length;

  const { data: reviewsData, isLoading: reviewsLoading } = useGetReviewsByUserIdQuery(
    profileId ?? '',
    {
      skip: !profileId,
    },
  );

  const reviews: Review[] = useMemo(() => {
    if (Array.isArray(reviewsData)) return reviewsData;
    return (reviewsData as ApiResponse<Review>)?.results || (reviewsData as any)?.items || [];
  }, [reviewsData]);

  const renderListing = useCallback(
    ({ item }: { item: Listing }) => (
      <ProfileList
        image={
          (item.imageUrl ||
            item.photoUrl ||
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop') as string
        }
        title={(item.title || item.name || 'Service') as string}
        price={`RS ${parseFloat(item.priceAmount || '0').toLocaleString()}`}
        containerStyle={styles.listingCard}
        onPress={() =>
          router.push({
            pathname: '/ServicesDetails',
            params: { id: item.id },
          })
        }
      />
    ),
    [router],
  );

  // Static data removed

  if (loading && !currentProfile) {
    return (
      <ScreenWrapper
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AppLoadingAnimation visible={true} />
      </ScreenWrapper>
    );
  }

  if (!currentProfile && !loading) {
    return (
      <ScreenWrapper
        backgroundColor={colors.light.surface}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: fontsize.md, color: colors.light.subText }}>
          Profile not found
        </Text>
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
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withTopInset={false} backgroundColor={colors.light.surface}>
      <Header title="Profile Details" showBackButton={true} onBackPress={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Info Summary */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  currentProfile?.photoUrl ||
                  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
              }}
              style={styles.profileImage}
            />
            <View style={styles.verifiedBadgeContainer}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.light.success}
                style={styles.verifiedIconBg}
              />
            </View>
          </View>

          <Text style={styles.profileName}>{currentProfile?.name || 'User'}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="call" size={14} color={colors.light.subText} />
            <Text style={styles.phoneText}>{currentProfile?.phone || 'N/A'}</Text>
          </View>

          <View style={styles.sellerBadge}>
            <Text style={styles.sellerBadgeText}>TRUSTED SELLER</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <ProfileViewCard
            title={currentProfile?.avgRating || '0.0'}
            subtitle={currentProfile?.reviewsCount?.toString() || '0'}
            subtitleSuffix="REVIEWS"
            iconName="star"
            containerStyle={styles.statCard}
          />
          <ProfileViewCard
            title={getMemberSince(currentProfile?.createdAt)}
            subtitle="MEMBER SINCE"
            iconName="calendar"
            iconColor={colors.light.success}
            containerStyle={styles.statCard}
          />
          <ProfileViewCard
            title={currentProfile?.completedordercount?.toString() || '0'}
            subtitle="ORDERS"
            iconName="checkmark-circle"
            iconColor={colors.light.success}
            containerStyle={styles.statCard}
          />
        </View>

        <View style={styles.divider} />

        {/* About Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.aboutText}>{currentProfile?.bio || 'No bio available.'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Active Listings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Listings</Text>
            {totalListings > 0 && (
              <Text style={styles.totalServicesText}>Total Services: {totalListings}</Text>
            )}
          </View>

          {listingsLoading && listings.length === 0 ? (
            <View style={{ height: 160, justifyContent: 'center' }}>
              <AppLoadingAnimation visible={true} message="Loading listings..." />
            </View>
          ) : listings && listings.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={listings}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listingsList}
              renderItem={renderListing}
            />
          ) : (
            <Text style={styles.emptyText}>No active listings found.</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Latest Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Reviews</Text>
          {reviewsLoading && reviews.length === 0 ? (
            <View style={{ marginVertical: 20, alignSelf: 'flex-start' }}>
              <AppLoadingAnimation visible={true} fullscreen={false} message="Loading reviews..." />
            </View>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <ReviewCard
                key={review.id || index}
                avatar={review.reviewer?.photoUrl || ''}
                reviewerName={review.reviewer?.name || 'Anonymous'}
                rating={review.rating}
                reviewDate={formatDate(review.createdAt)}
                reviewText={review.note}
                containerStyle={[
                  styles.reviewCard,
                  index === reviews.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                ]}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { marginTop: 8 }]}>No reviews yet.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  profileInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.light.surface,
    backgroundColor: colors.light.altBorder,
  },
  verifiedBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: colors.light.surface,
  },
  verifiedIconBg: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 14,
    color: colors.light.subText,
    marginLeft: 4,
  },
  sellerBadge: {
    backgroundColor: colors.light.infoBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sellerBadgeText: {
    color: colors.light.success,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    maxWidth: 110,
    width: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.altBorder,
    width: '100%',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
  },
  aboutText: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 22,
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.light.success,
    fontWeight: '600',
  },
  totalServicesText: {
    fontSize: 14,
    color: colors.light.subText,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.light.mutedText,
    fontStyle: 'italic',
  },
  listingsList: {
    paddingRight: 16,
    gap: 12,
  },
  listingCard: {
    width: 140,
  },
  reviewCard: {
    paddingHorizontal: 0,
  },
});
