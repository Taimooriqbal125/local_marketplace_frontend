import React, { useState, ReactNode, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenWrapper from '@components/common/ScreenWrapper';
import Header from '@components/common/Header';
import FilterLayout from '@components/common/FilterLayout';
import ReviewCard from '@components/listings/ReviewCard';
import { useGetMyReceivedReviewsQuery } from '@/redux/reviews/reviewApi';
import { getRelativeTime } from '@/utils/dateFormatter';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import { Review } from '@/types';
import { colors } from '@theme/index';

interface StarFilterProps {
  rating: number;
}

// Defined OUTSIDE of component so it is never re-created on re-renders
const StarFilter = ({ rating }: StarFilterProps) => (
  <View style={styles.starFilterRow}>
    <Text style={styles.starFilterText}>{rating}</Text>
    <Ionicons name="star" size={12} color={colors.light.warning} />
  </View>
);

interface FilterItem {
  id: number;
  label: string | ReactNode;
}

const filters: FilterItem[] = [
  { id: 1, label: 'All' },
  { id: 2, label: <StarFilter rating={5} /> },
  { id: 3, label: <StarFilter rating={4} /> },
  { id: 4, label: <StarFilter rating={3} /> },
  { id: 5, label: <StarFilter rating={2} /> },
  { id: 6, label: <StarFilter rating={1} /> },
];

const EmptyReviews = () => (
  <View style={styles.emptyContainer}>
    {/* Illustration */}
    <View style={styles.illustrationWrapper}>
      {/* Background circle */}
      <View style={styles.bgCircle} />

      {/* Stacked card effect */}
      <View style={styles.cardBack} />
      <View style={styles.cardFront}>
        <Ionicons name="star" size={36} color={colors.light.mutedText} />
        {/* Simulated content lines */}
        <View style={styles.cardLine} />
        <View style={[styles.cardLine, styles.cardLineShort]} />
      </View>

      {/* Floating amber badge */}
      <View style={styles.addBadge}>
        <Ionicons name="chatbubble-ellipses" size={18} color={colors.light.surface} />
        <View style={styles.addBadgeStar}>
          <Ionicons name="star" size={8} color={colors.light.surface} />
        </View>
      </View>
    </View>

    {/* Text */}
    <Text style={styles.emptyTitle}>No reviews yet</Text>
    <Text style={styles.emptySubtitle}>
      Reviews from your customers will{`\n`}appear here once you complete orders.
    </Text>
  </View>
);

const MyReviews = () => {
  const router = useRouter();
  const [selectedFilterId, setSelectedFilterId] = useState<number>(1);
  const [refreshing, setRefreshing] = useState(false);

  // Map filter ID to numeric rating
  const rating = useMemo(() => {
    const filter = filters.find((f) => f.id === selectedFilterId);
    if (!filter || filter.label === 'All') return undefined;
    if (
      typeof filter.label === 'object' &&
      React.isValidElement(filter.label) &&
      (filter.label.props as any)?.rating
    ) {
      return (filter.label.props as any).rating;
    }
    return undefined;
  }, [selectedFilterId]);

  const { data, isLoading, isError, refetch } = useGetMyReceivedReviewsQuery(
    rating ? { rating } : {},
  );

  const reviews: Review[] = useMemo(() => {
    return Array.isArray(data) ? data : data?.results || data?.items || [];
  }, [data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const onSelectFilter = useCallback((item: any) => {
    setSelectedFilterId(item.id as number);
  }, []);

  return (
    <ScreenWrapper withTopInset={false} backgroundColor={colors.light.surface}>
      <Header title="My Reviews" showBackButton={true} onBackPress={onBackPress} />
      <FilterLayout
        filters={filters}
        selectedFilter={selectedFilterId}
        onSelectFilter={onSelectFilter}
      />
      <ScrollView
        style={{ backgroundColor: colors.light.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.light.warning]}
            tintColor={colors.light.warning}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          (isLoading || reviews.length === 0) && styles.scrollFlex,
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <AppLoadingAnimation visible={true} message="Loading reviews..." />
          </View>
        ) : isError ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.light.danger} />
            <Text style={styles.emptyTitle}>Failed to load reviews</Text>
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.8 },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : reviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewWrapper}>
              <ReviewCard
                avatar={review.reviewerPhotoUrl || ''}
                reviewerName={review.reviewerName || ''}
                reviewDate={getRelativeTime(review.createdAt)}
                rating={review.rating}
                reviewText={review.comment || ''}
                serviceTitle={review.serviceTitle}
                serviceImageUrl={review.serviceImageUrl}
                categoryName={review.categoryName}
              />
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default MyReviews;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    backgroundColor: colors.light.surface,
  },
  scrollFlex: {
    flexGrow: 1,
  },
  serviceCard: {
    marginTop: 4,
  },
  starFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },

  // ---- Empty state ----
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
    backgroundColor: colors.light.surface,
  },
  illustrationWrapper: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  bgCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.light.altBorder,
  },
  cardBack: {
    position: 'absolute',
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.light.border,
    top: 24,
    left: 52,
    transform: [{ rotate: '6deg' }],
  },
  cardFront: {
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
    paddingTop: 4,
  },
  cardLine: {
    width: 60,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.light.mutedText,
  },
  cardLineShort: {
    width: 40,
  },
  addBadge: {
    position: 'absolute',
    bottom: 18,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  addBadgeStar: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.light.subText,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewWrapper: {
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.light.success,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.light.surface,
    fontWeight: '600',
  },
});
