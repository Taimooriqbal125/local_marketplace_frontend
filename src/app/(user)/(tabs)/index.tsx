import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/index';

import CompleteProfileModal from '@/components/modals/CompleteProfileModal';
import { useWalkthrough } from '@/hooks/useWalkthrough';
import { useGetParentCategoriesQuery } from '@/redux/category/categoryApi';
import {
  useGetAllListingsQuery,
  useGetNearbyListingsFromProfileQuery,
} from '@/redux/listings/listingApi';
import { useGetNotificationsQuery } from '@/redux/notification/notificationApi';
import { useGetMyProfileQuery } from '@/redux/profiles/profileApi';
import { CACHE_KEYS } from '@/storage/keys';
import { selectWalkthrough } from '@/redux/walkthrough/animationSlice';
import LocationAnimation from '@components/animations/LocationAnimation';
import NegotiableAnimation from '@components/animations/NegotiableAnimation';
import { FilterButtons } from '@components/common/FilterButtons';
import FilterLayout, { FilterItem } from '@components/common/FilterLayout';
import ScreenWrapper from '@components/common/ScreenWrapper';
import HomeHeader from '@components/listings/HomeHeader';
import HomeListingCard from '@components/listings/HomeListingCard';
import { useNavigation, useRouter } from 'expo-router';
import { useHomeWalkthroughData } from '@/hooks/useHomeWalkthroughData';
import { useLocation } from '@/hooks/useLocation';
import EmptyState from '../../../components/listings/EmptyState';
import { useSelector } from 'react-redux';
import notificationSocket from '@/services/sockets/notificationSocket';

type PriceType = 'hourly' | 'daily' | 'fixed' | '';

type PriceUnit = 'hr' | 'day' | 'fixed';

type Category = {
  id: string;
  name: string;
};

type NotificationItem = {
  isRead?: boolean;
};

type Seller = {
  sellerRatingAvg?: string | number;
  name?: string;
  photoUrl?: string;
  imageUrl?: string;
};

type ListingItem = {
  id: string;
  imageUrl?: string;
  isNegotiable?: boolean;
  categoryName?: string;
  serviceLocation?: string;
  cityName?: string;
  title?: string;
  seller?: Seller;
  priceAmount?: string | number;
  priceType?: PriceType | string;
};

type FilterCategory = FilterItem;

type ListingsResponse =
  | {
      results?: ListingItem[];
      items?: ListingItem[];
    }
  | ListingItem[]
  | undefined;

const formatPriceUnit = (priceType: string): PriceUnit => {
  switch (priceType) {
    case 'hourly':
      return 'hr';
    case 'daily':
      return 'day';
    case 'fixed':
      return 'fixed';
    default:
      return 'hr';
  }
};

export default function UserMarket() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [priceType, setPriceType] = useState<PriceType>('');
  const [isNegotiable, setIsNegotiable] = useState<boolean>(false);
  const [isNearbyOnly, setIsNearbyOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showLocationAnimation, setShowLocationAnimation] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const listingCardRef = useRef<View>(null);
  const filtersRef = useRef<View>(null);

  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Dynamic Walkthrough & Layout Logic
  const { steps: HOME_WALKTHROUGH_STEPS, setRect, rects } = useHomeWalkthroughData();

  const { data: profile, error: profileError, isSuccess: profileLoaded } = useGetMyProfileQuery();
  const { isVisible: isWalkthroughVisible } = useSelector(selectWalkthrough);
  const { requestAndSyncLocation } = useLocation();

  // 1. Sync location on app mount/profile load
  React.useEffect(() => {
    if (profileLoaded) {
      requestAndSyncLocation();
    }
  }, [profileLoaded, requestAndSyncLocation]);

  // Trigger Walkthrough only when:
  // 1. Initial layout (calibration or header) is measured
  // 2. Profile is successfully loaded (don't show during "Complete Profile" flow)
  const isWalkthroughReady = !!(rects.calibration || rects.headerActions) && profileLoaded;
  useWalkthrough(CACHE_KEYS.HAS_SEEN_HOME_GUIDE, HOME_WALKTHROUGH_STEPS, isWalkthroughReady);

  React.useEffect(() => {
    // Only show modal if the user has no profile at all (404)
    // AND if the walkthrough isn't already taking up the screen
    if (profileError && (profileError as any)?.status === 404 && !isWalkthroughVisible) {
      setShowProfileModal(true);
    } else if (profileLoaded) {
      // Profile exists — ensure modal stays hidden
      setShowProfileModal(false);
    }
  }, [profileLoaded, profileError, isWalkthroughVisible]);

  const handleCompleteNow = () => {
    setShowProfileModal(false);
    router.replace('/(auth)/ProfileForm' as any);
  };

  const queryParams = {
    pageSize: 20,
    ...(priceType && { priceType }),
    ...(isNegotiable && { isNegotiable: true }),
    ...(selectedCategoryId !== 'all' && { category: selectedCategoryId }),
  };

  const {
    data: allListingsData,
    isFetching: isAllFetching,
    isLoading: isAllLoading,
    refetch: refetchAll,
  } = useGetAllListingsQuery(queryParams, { skip: isNearbyOnly });

  const {
    data: nearbyListingsData,
    isFetching: isNearbyFetching,
    isLoading: isNearbyLoading,
    refetch: refetchNearby,
  } = useGetNearbyListingsFromProfileQuery(queryParams, { skip: !isNearbyOnly });

  const {
    data: parentCategoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useGetParentCategoriesQuery();

  const { data: notifications = [], refetch: refetchNotifications } = useGetNotificationsQuery();

  const unreadCount = (notifications as NotificationItem[]).filter((n) => !n.isRead).length;

  React.useEffect(() => {
    const unsubscribe = notificationSocket.onMessage((message) => {
      // The backend sends payloads like: { event: "notification", data: { ... } }
      if (
        message?.event === 'notification' ||
        message?.event === 'new_notification' ||
        message?.event === 'mark_as_read'
      ) {
        refetchNotifications();
      }
    });
    return () => unsubscribe();
  }, [refetchNotifications]);

  const parentCategories = (parentCategoriesData || []) as Category[];

  const getListingsArray = (data: ListingsResponse): ListingItem[] => {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.items && Array.isArray(data.items)) return data.items;
    return [];
  };

  const listings = getListingsArray(allListingsData as ListingsResponse);
  const nearbyListings = getListingsArray(nearbyListingsData as ListingsResponse);

  const listingsLoading = isNearbyOnly ? isNearbyLoading : isAllLoading;
  const listingsFetching = isNearbyOnly ? isNearbyFetching : isAllFetching;
  const combinedLoading = listingsLoading || listingsFetching || categoriesLoading;

  const handleRefresh = useCallback((): void => {
    refetchCategories();
    refetchNotifications();
    setPriceType('');
    setIsNegotiable(false);
    setIsNearbyOnly(false);
    setSearchQuery('');
    setSelectedCategoryId('all');

    if (isNearbyOnly) {
      refetchNearby();
    } else {
      refetchAll();
    }
  }, [isNearbyOnly, refetchNearby, refetchAll, refetchCategories, refetchNotifications]);

  const handlePriceTypeChange = (value: PriceType): void => {
    setPriceType(value);
  };

  const handleNegotiableToggle = (): void => {
    const nextValue = !isNegotiable;
    setIsNegotiable(nextValue);

    if (nextValue) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleNearbyOnlyToggle = (): void => {
    const nextValue = !isNearbyOnly;
    setIsNearbyOnly(nextValue);

    if (nextValue) {
      setShowLocationAnimation(true);
      setTimeout(() => setShowLocationAnimation(false), 2000);
    }
  };

  const filterCategories: FilterCategory[] = [
    { id: 'all', label: 'All Services' },
    ...parentCategories.map((cat) => ({
      id: cat.id,
      label: cat.name,
    })),
  ];

  const sourceData: ListingItem[] = isNearbyOnly ? nearbyListings : listings;

  const filteredData = Array.isArray(sourceData)
    ? sourceData.filter((item: ListingItem) => {
        if (!searchQuery) return true;
        return (
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  const onServicePress = (listingId: string): void => {
    router.push({
      pathname: '/(user)/ServicesDetails',
      params: { id: listingId },
    });
  };

  return (
    <ScreenWrapper style={{ backgroundColor: colors.light.altBackground }}>
      <View
        onLayout={(e) => {
          e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
            setRect('calibration')({ x: pageX, y: pageY, width, height });
          });
        }}
        style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, opacity: 0 }}
      />
      <View style={styles.container}>
        <View>
          <HomeHeader
            title="Market"
            notificationCount={unreadCount}
            onNotificationPress={() => {
              navigation.navigate('Notification' as never);
            }}
            onSearch={setSearchQuery}
            profileImage={profile?.photoUrl}
            profileInitials={profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            onActionsLayout={setRect('headerActions')}
          />
        </View>

        <FilterLayout
          filters={filterCategories}
          selectedFilter={selectedCategoryId}
          onSelectFilter={(item: FilterItem) => setSelectedCategoryId(String(item.id))}
        />

        <View
          ref={filtersRef}
          onLayout={() => {
            filtersRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
              setRect('filters')({ x: pageX, y: pageY, width, height });
            });
          }}
          style={{ paddingBottom: 12 }}
        >
          <FilterButtons
            priceType={priceType}
            onPriceTypeChange={handlePriceTypeChange}
            isNegotiable={isNegotiable}
            onNegotiableToggle={handleNegotiableToggle}
            isNearbyOnly={isNearbyOnly}
            onNearbyOnlyToggle={handleNearbyOnlyToggle}
            onNegotiableLayout={setRect('negotiable')}
          />
        </View>

        <FlatList<ListingItem>
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? 100 + insets.bottom : 90 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          // Mobile Design List Performance defaults
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={11} // Reduced from default 21 to save memory
          removeClippedSubviews={Platform.OS === 'android'} // Android optimization
          refreshControl={
            <RefreshControl
              refreshing={combinedLoading}
              onRefresh={handleRefresh}
              // Platform Decomposition: Branded refresh spinner
              tintColor={colors.light.primary} // iOS
              colors={[colors.light.primary, colors.light.secondary]} // Android
              progressBackgroundColor={colors.light.surface} // Android
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Listings Found"
              subtitle="Try adjusting your filters or search query."
              toppadding={90}
            />
          }
          renderItem={({ item, index }) => {
            const card = (
              <HomeListingCard
                image={
                  item.imageUrl ||
                  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop'
                }
                isTopRated={parseFloat(String(item.seller?.sellerRatingAvg || '0')) >= 4.5}
                isNegotiable={item.isNegotiable}
                category={item.categoryName?.toUpperCase() || 'SERVICE'}
                location={item.serviceLocation || item.cityName}
                title={item.title}
                providerName={item.seller?.name || 'User'}
                providerAvatar={item.seller?.photoUrl || 'U'}
                rating={parseFloat(String(item.seller?.sellerRatingAvg || '0'))}
                price={parseFloat(String(item.priceAmount || '0'))}
                priceUnit={formatPriceUnit(String(item.priceType || ''))}
                onPress={() => onServicePress(item.id)}
              />
            );

            // Measure only the first card for walkthrough spotlight
            if (index === 0) {
              return (
                <View
                  ref={listingCardRef}
                  onLayout={() => {
                    listingCardRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
                      setRect('listingCard')({ x: pageX, y: pageY, width, height });
                    });
                  }}
                >
                  {card}
                </View>
              );
            }
            return card;
          }}
        />
      </View>

      <NegotiableAnimation visible={showSuccess} />
      <LocationAnimation visible={showLocationAnimation} />

      <CompleteProfileModal visible={showProfileModal} onCompleteNow={handleCompleteNow} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lottieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
