import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenWrapper from '@components/common/ScreenWrapper';
import Header from '@components/common/Header';
import FilterLayout from '@components/common/FilterLayout';
import ReviewCard from '@components/listings/ReviewCard';
import ServiceItemCard from '@components/common/ServiceItemCard';

// Defined OUTSIDE of component so it is never re-created on re-renders
const StarFilter = ({ rating }) => (
  <View style={styles.starFilterRow}>
    <Text style={styles.starFilterText}>{rating}</Text>
    <Ionicons name="star" size={12} color="#F59E0B" />
  </View>
);

const filters = [
  { id: 1, label: 'All' },
  { id: 2, label: <StarFilter rating={5} /> },
  { id: 3, label: <StarFilter rating={4} /> },
  { id: 4, label: <StarFilter rating={3} /> },
  { id: 5, label: <StarFilter rating={2} /> },
  { id: 6, label: <StarFilter rating={1} /> },
];

// Demo data — replace with data from your API/store
const reviews = [
  {
    id: '1',
    avatar: '',
    reviewerName: 'John Doe',
    reviewDate: '2022-01-01',
    rating: 5,
    reviewText: 'Great service!',
    service: { title: 'Interior Design Consultation', price: '$100', image: '' },
  },
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
        <Ionicons name="star" size={36} color="#F6D06B" />
        {/* Simulated content lines */}
        <View style={styles.cardLine} />
        <View style={[styles.cardLine, styles.cardLineShort]} />
      </View>

      {/* Floating amber badge */}
      <View style={styles.addBadge}>
        <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
        <View style={styles.addBadgeStar}>
          <Ionicons name="star" size={8} color="#fff" />
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
  const [selectedFilter, setSelectedFilter] = useState('All');

  return (
    <ScreenWrapper withTopInset={false}>
      <Header title="My Reviews" showBackButton={true} onBackPress={() => router.back()} />
      <FilterLayout
        filters={filters}
        selectedFilter={selectedFilter}
        onSelectFilter={(item) => setSelectedFilter(item.label)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, reviews.length === 0 && styles.scrollFlex]}
      >
        {reviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          reviews.map((review) => (
            <View key={review.id}>
              <ReviewCard
                avatar={review.avatar}
                reviewerName={review.reviewerName}
                reviewDate={review.reviewDate}
                rating={review.rating}
                reviewText={review.reviewText}
              />
              <ServiceItemCard
                title={review.service.title}
                price={review.service.price}
                image={review.service.image}
                containerStyle={styles.serviceCard}
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
    color: '#374151',
  },

  // ---- Empty state ----
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
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
    backgroundColor: '#FEF9EC',
  },
  cardBack: {
    position: 'absolute',
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#FDEEC8',
    top: 24,
    left: 52,
    transform: [{ rotate: '6deg' }],
  },
  cardFront: {
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#FEF3D0',
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
    backgroundColor: '#F6D06B',
    opacity: 0.5,
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
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
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
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
