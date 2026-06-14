import { useGetListingByIdQuery } from '@/redux/listings/listingApi';
import { Listing } from '@/types';
import { getRelativeTime } from '@/utils/dateFormatter';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@theme/index';

const { width } = Dimensions.get('window');

export default function ViewListing() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const listingId = Array.isArray(id) ? id[0] : id;

  const {
    data: listing,
    isLoading,
    error,
  } = useGetListingByIdQuery(listingId ?? '', {
    skip: !listingId,
  }) as { data: Listing | undefined; isLoading: boolean; error: any };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppLoadingAnimation visible={true} message="Fetching service details..." />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <ScreenWrapper backgroundColor={colors.light.surface}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.light.danger} />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorSubtitle}>
            We couldn&apos;t load the service details. Please try again later.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.8 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.light.surface}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Hero Image Section */}
          <View style={styles.heroSection}>
            <Image
              source={{
                uri:
                  listing?.imageUrl ||
                  listing?.photoUrl ||
                  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop',
              }}
              style={styles.heroImage}
            />
            <View style={styles.headerOverlay}>
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: colors.light.border, borderless: true, radius: 22 }}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.light.text} />
              </Pressable>
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        listing?.status === 'active' ? colors.light.success : colors.light.warning,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{listing?.status || 'Active'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            <View style={styles.mainInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{listing?.title}</Text>
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.priceSymbol}>Rs</Text>
                <Text style={styles.priceAmount}>{listing?.priceAmount}</Text>
                <Text style={styles.priceType}>
                  {listing?.priceType === 'hourly' ? '/ hr' : ' fixed'}
                </Text>
                {listing?.isNegotiable && (
                  <View style={styles.negotiableBadge}>
                    <Text style={styles.negotiableText}>Negotiable</Text>
                  </View>
                )}
              </View>

              <View style={styles.metadataGrid}>
                <View style={styles.metaItem}>
                  <View style={styles.metaIcon}>
                    <Ionicons name="apps" size={20} color={colors.light.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>Category</Text>
                    <Text style={styles.metaValue}>{listing?.categoryName || 'General'}</Text>
                  </View>
                </View>

                <View style={styles.metaItem}>
                  <View style={styles.metaIcon}>
                    <Ionicons name="location" size={20} color={colors.light.success} />
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>Location</Text>
                    <Text style={styles.metaValue}>{listing?.cityName || 'Karachi'}</Text>
                  </View>
                </View>

                <View style={styles.metaItem}>
                  <View style={styles.metaIcon}>
                    <Ionicons name="navigate" size={20} color={colors.light.warning} />
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>Range</Text>
                    <Text style={styles.metaValue}>{listing?.serviceRadiusKm || 15} km</Text>
                  </View>
                </View>

                <View style={styles.metaItem}>
                  <View style={styles.metaIcon}>
                    <Ionicons name="time" size={20} color={colors.light.subText} />
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>Updated</Text>
                    <Text style={styles.metaValue}>{getRelativeTime(listing?.updatedAt)}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Location Detail */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Point</Text>
              <View style={styles.locationDetailCard}>
                <Ionicons name="pin" size={20} color={colors.light.success} />
                <Text style={styles.locationDetailText}>{listing?.serviceLocation}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this Service</Text>
              <Text style={styles.description}>{listing?.description}</Text>
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Footer Action */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.9 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            onPress={() =>
              router.push({ pathname: '/(user)/ListingBasicInfo', params: { id: listing?.id } })
            }
          >
            <Ionicons name="create-outline" size={20} color={colors.light.surface} />
            <Text style={styles.editButtonText}>Edit Service</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
  },
  heroSection: {
    height: 300,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.light.altBackground,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: colors.light.surface,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.light.surface,
    marginTop: -30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  mainInfo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.light.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.success,
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.light.success,
  },
  priceType: {
    fontSize: 16,
    color: colors.light.subText,
    marginLeft: 4,
    fontWeight: '500',
  },
  negotiableBadge: {
    backgroundColor: colors.light.infoBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  negotiableText: {
    color: colors.light.success,
    fontSize: 12,
    fontWeight: '600',
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.altBackground,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.altBorder,
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.light.mutedText,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: colors.light.text,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.altBorder,
    marginVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 12,
  },
  locationDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.altBackground,
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  locationDetailText: {
    fontSize: 14,
    color: colors.light.text,
    flex: 1,
    lineHeight: 20,
  },
  description: {
    fontSize: 15,
    color: colors.light.text,
    lineHeight: 24,
  },
  sellerCard: {
    backgroundColor: colors.light.altBackground,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.light.altBorder,
    marginTop: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.light.altBorder,
  },
  sellerAvatar: {
    width: '100%',
    height: '100%',
  },
  sellerInitials: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInitialsText: {
    color: colors.light.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  sellerText: {
    flex: 1,
    marginLeft: 16,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: colors.light.mutedText,
    marginLeft: 4,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.light.surface,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.success,
    height: 56,
    borderRadius: 16,
    gap: 10,
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 15,
    color: colors.light.subText,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.light.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
