import ScreenWrapper from '@components/common/ScreenWrapper';
import ProfileCard from '@components/listings/ProfileCard';
import ReviewCard from '@components/listings/ReviewCard';
import RequestServiceModal from '@components/modals/RequestServiceModal';
import { Ionicons } from '@expo/vector-icons';
import fontsize from '@theme/fontsize';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
export default function ServicesDetails() {
  const navigation = useNavigation();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

  const service = {
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
    category: 'Cleaning',
    location: 'New York, NY',
    title: 'Deep Residential & Office Eco-Cleaning',
    price: '$120.00',
    badge: 'Negotiable',
    description:
      'Experience a spotless environment with our premium eco-friendWeWeWely cleaning service. We use specalized non-toxic products safe for pets and families, delivering a fresh and detailed clean for both residential and office spaces.',
  };
  const handleMessage = () => {
    router.push('/(user)/(tabs)/Message');
  };

  return (
    <ScreenWrapper style={{ backgroundColor: '#FFFFFF', paddingBottom: 36 }}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.imageWrapper}>
            <Image source={{ uri: service.image }} style={styles.heroImage} resizeMode="cover" />

            <View style={styles.overlayTopRow}>
              <Pressable
                style={styles.iconButton}
                activeOpacity={0.8}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </Pressable>

              <View style={styles.rightIcons}>
                <Pressable style={styles.iconButton} activeOpacity={0.8}>
                  <Ionicons name="heart" size={16} color="#FFFFFF" />
                </Pressable>

                <Pressable style={styles.iconButton} activeOpacity={0.8}>
                  <Ionicons name="share-social" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.badgesRow}>
              <View style={[styles.smallBadge, styles.categoryBadge]}>
                <Text style={[styles.smallBadgeText, styles.categoryBadgeText]}>
                  {service.category}
                </Text>
              </View>

              <View style={[styles.smallBadge, styles.locationBadge]}>
                <Text style={[styles.smallBadgeText, styles.locationBadgeText]}>
                  {service.location}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{service.title}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{service.price}</Text>

              <View style={styles.negotiableBadge}>
                <Text style={styles.negotiableText}>{service.badge}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text
                style={styles.description}
                numberOfLines={isExpanded ? undefined : 3}
                onTextLayout={(e) => {
                  if (!isExpanded && e.nativeEvent.lines.length >= 3) {
                    setIsTruncated(true);
                  }
                }}
              >
                {service.description}
              </Text>

              {isTruncated && (
                <Pressable activeOpacity={0.7} onPress={() => setIsExpanded(!isExpanded)}>
                  <Text style={styles.readMore}>{isExpanded ? 'Read less' : 'Read more'}</Text>
                </Pressable>
              )}
            </View>

            {/* Profile Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About the Provider</Text>
              <ProfileCard
                name="Mike R."
                avatar="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
                rating="5.0"
                reviewCount={124}
                onViewProfile={() => navigation.navigate('ProfileDetails')}
                containerStyle={{ marginHorizontal: 0, marginVertical: 12 }}
              />
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <ReviewCard
                reviewerName="Sarah Jenkins"
                avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
                rating={5}
                reviewDate="Oct 12, 2023"
                reviewText="Mike did an incredible job with the deep cleaning. The office looks brand new and he was very professional and on time. Highly recommend his services to anyone looking for eco-friendly cleaning!"
                containerStyle={{ paddingHorizontal: 0 }}
              />
              <ReviewCard
                reviewerName="David Chen"
                avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                rating={4}
                reviewDate="Sep 28, 2023"
                reviewText="Good service, very thorough. Left everything smelling clean without the harsh chemical smell."
                containerStyle={{ paddingHorizontal: 0, borderBottomWidth: 0 }}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable style={styles.messageButton} activeOpacity={0.85} onPress={handleMessage}>
            <Text style={styles.messageButtonText}>Message</Text>
          </Pressable>

          <Pressable
            style={styles.requestButton}
            activeOpacity={0.85}
            onPress={() => setRequestModalOpen(true)}
          >
            <Text style={styles.requestButtonText}>Request Service</Text>
          </Pressable>
        </View>
      </View>

      <RequestServiceModal
        visible={isRequestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        service={service}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E5E7EB',
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#E7F0FF',
  },
  categoryBadgeText: {
    color: '#3B82F6',
  },
  locationBadge: {
    backgroundColor: '#F3F4F6',
  },
  locationBadgeText: {
    color: '#6B7280',
  },
  smallBadgeText: {
    fontSize: fontsize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: fontsize.xl,
    lineHeight: 26,
    fontWeight: '700',
    color: '#111827',
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
    color: '#111827',
    marginRight: 10,
  },
  negotiableBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  negotiableText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: fontsize.xl,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
  },
  readMore: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  messageButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  requestButton: {
    flex: 1.4,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
