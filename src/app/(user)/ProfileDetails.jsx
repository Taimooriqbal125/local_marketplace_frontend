import Header from '@components/common/Header';
import ProfileViewCard from '@components/common/ProfileViewCard';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ProfileList from '@components/listings/ProfileList';
import ReviewCard from '@components/listings/ReviewCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProfileDetails() {
  const router = useRouter();

  const activeListings = [
    {
      id: '1',
      image:
        'https://images.unsplash.com/photo-1516450360431-974816311723?q=80&auto=format&fit=crop&w=300',
      title: 'Vintage Leica M6',
      price: '$2,450',
    },
    {
      id: '2',
      image:
        'https://images.unsplash.com/photo-1505236273191-1dce886b01e9?q=80&auto=format&fit=crop&w=300',
      title: 'Sony 35mm f1.4 GM',
      price: '$1,200',
    },
  ];

  const latestReviews = [
    {
      id: '1',
      reviewerName: 'David L.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      reviewDate: '2d ago',
      reviewText:
        'The camera was exactly as described. Shipped within 2 hours of payment. Excellent packaging!',
    },
    {
      id: '2',
      reviewerName: 'Sarah Jenkins',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      rating: 4,
      reviewDate: '1w ago',
      reviewText:
        'Great communication throughout. Item is in beautiful condition. Highly recommended seller.',
    },
  ];

  return (
    <ScreenWrapper withTopInset={false} paddingBottom={40}>
      <Header title="Profile Details" withBackButton={true} onBackPress={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Back Button */}

        {/* Profile Info Summary */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
              }}
              style={styles.profileImage}
            />
            <View style={styles.verifiedBadgeContainer}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#3B82F6"
                style={styles.verifiedIconBg}
              />
            </View>
          </View>

          <Text style={styles.profileName}>Marcus Chen</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.locationText}>San Francisco, CA</Text>
          </View>

          <View style={styles.sellerBadge}>
            <Text style={styles.sellerBadgeText}>VERIFIED SELLER</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <ProfileViewCard
            title="4.9"
            subtitle="128"
            subtitleSuffix="REVIEWS"
            iconName="star"
            containerStyle={styles.statCard}
          />
          <ProfileViewCard
            title="2021"
            subtitle="MEMBER SINCE"
            iconName="calendar"
            iconColor="#3B82F6"
            containerStyle={styles.statCard}
          />
          <ProfileViewCard
            title="452"
            subtitle="ORDERS"
            iconName="checkmark-circle"
            iconColor="#3B82F6"
            containerStyle={styles.statCard}
          />
        </View>

        <View style={styles.divider} />

        {/* About Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.aboutText}>
            Specializing in vintage photography gear and high-end digital accessories. I ensure
            every item is tested, cleaned, and packed with care. Fast shipping from SF and always
            open to reasonable offers.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Active Listings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Listings</Text>
            <Pressable hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={activeListings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listingsList}
            renderItem={({ item }) => (
              <ProfileList
                image={item.image}
                title={item.title}
                price={item.price}
                containerStyle={styles.listingCard}
              />
            )}
          />
        </View>

        <View style={styles.divider} />

        {/* Latest Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Reviews</Text>
          {latestReviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              avatar={review.avatar}
              reviewerName={review.reviewerName}
              rating={review.rating}
              reviewDate={review.reviewDate}
              reviewText={review.reviewText}
              containerStyle={[
                styles.reviewCard,
                index === latestReviews.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
              ]}
            />
          ))}
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
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  verifiedBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedIconBg: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  sellerBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sellerBadgeText: {
    color: '#3B82F6',
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
    // By default ProfileViewCard has fixed width.
    // We override it here so it flexes nicely evenly.
    width: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
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
    color: '#111827',
  },
  aboutText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
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
