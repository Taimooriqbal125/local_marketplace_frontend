import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

import { useGetMyListingsQuery, useUpdateListingMutation } from '@/redux/listings/listingApi';
import ScreenWrapper from '@components/common/ScreenWrapper';
import EmptyState from '@components/listings/EmptyState';
import ListingCard from '@components/listings/ListingCard';

import { getRelativeTime } from '@/utils/dateFormatter';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import { useRouter } from 'expo-router';
import { colors } from '@theme/index';

interface ListingItem {
  id: string;
  title: string;
  categoryName?: string;
  serviceLocation?: string;
  priceAmount?: number | string;
  priceType?: 'hourly' | 'daily' | 'fixed' | string;
  updatedAt: string;
  isNegotiable?: boolean;
  photoUrl?: string;
  imageUrl?: string;
}

interface ListingsResponse {
  results?: ListingItem[];
  items?: ListingItem[];
}

interface UpdateListingError {
  data?: {
    detail?: string;
  };
  message?: string;
}

const LISTING_BASIC_INFO_ROUTE = '/(user)/ListingBasicInfo' as never;
const VIEW_LISTING_ROUTE = '/(user)/ViewListing' as never;

export default function ActiveTab(): React.JSX.Element {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useGetMyListingsQuery({ status: 'active' });
  const [updateListing] = useUpdateListingMutation();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const typedData = data as ListingsResponse | ListingItem[] | undefined;
  const activeListings: ListingItem[] = useMemo(() => {
    return Array.isArray(typedData) ? typedData : typedData?.results || typedData?.items || [];
  }, [typedData]);

  const handlePause = useCallback(
    async (id: string): Promise<void> => {
      try {
        await updateListing({ id, data: { status: 'draft' } }).unwrap();

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully added to paused',
        });
      } catch (error) {
        const typedError = error as UpdateListingError;

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: typedError?.data?.detail || typedError?.message || 'Failed to pause listing',
        });
      }
    },
    [updateListing],
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: ListingItem }) => {
      return (
        <ListingCard
          title={item.title}
          category={item.categoryName || 'Service'}
          location={item.serviceLocation || 'Location'}
          price={item.priceAmount?.toString() || '0'}
          priceUnit={
            item.priceType === 'hourly' ? '/hr' : item.priceType === 'daily' ? '/day' : ' fixed'
          }
          time={getRelativeTime(item.updatedAt)}
          tagText={item.isNegotiable ? 'Negotiable' : 'Fixed'}
          image={
            item.imageUrl ||
            item.photoUrl ||
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop'
          }
          isshowbuttons={true}
          onEdit={() =>
            router.push({
              pathname: LISTING_BASIC_INFO_ROUTE,
              params: { id: item.id },
            })
          }
          onPause={() => handlePause(item.id)}
          onView={() =>
            router.push({
              pathname: VIEW_LISTING_ROUTE,
              params: { id: item.id },
            })
          }
        />
      );
    },
    [router, handlePause],
  );

  return (
    <ScreenWrapper key={2} withTopInset={false}>
      <View style={styles.container}>
        {(isLoading || isFetching) && activeListings.length === 0 ? (
          <View style={styles.loaderContainer}>
            <AppLoadingAnimation visible={true} message="Loading active listings..." />
          </View>
        ) : (
          <FlatList<ListingItem>
            data={activeListings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={
              activeListings.length === 0
                ? [styles.listContent, styles.emptyListContent]
                : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            // Platform Decomposition: Performance optimization for large lists
            windowSize={11}
            removeClippedSubviews={Platform.OS === 'android'}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                // Platform Decomposition: Branded refresh spinner
                tintColor={colors.light.primary} // iOS
                colors={[colors.light.primary, colors.light.secondary]} // Android
                progressBackgroundColor={colors.light.surface} // Android
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No Active Listings"
                subtitle="You don't have any active listings right now. Publish one to start earning!"
                toppadding={0}
              />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
});
