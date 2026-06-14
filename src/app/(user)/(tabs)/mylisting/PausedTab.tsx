import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform } from 'react-native';

import { useGetMyListingsQuery, useUpdateListingMutation } from '@/redux/listings/listingApi';
import ScreenWrapper from '@components/common/ScreenWrapper';
import EmptyState from '@components/listings/EmptyState';
import ListingCard from '@components/listings/ListingCard';
import Toast from 'react-native-toast-message';

import { getRelativeTime } from '@/utils/dateFormatter';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import { colors } from '@theme/index';

interface ListingItem {
  id: string;
  title: string;
  categoryName?: string;
  serviceLocation?: string;
  cityName?: string;
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

export default function PausedTab(): React.JSX.Element {
  const { data, isLoading, isFetching, refetch } = useGetMyListingsQuery({ status: 'draft' });
  const [updateListing] = useUpdateListingMutation();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const typedData = data as ListingsResponse | ListingItem[] | undefined;
  const pausedListings: ListingItem[] = useMemo(() => {
    return Array.isArray(typedData) ? typedData : typedData?.results || typedData?.items || [];
  }, [typedData]);

  const handleResume = useCallback(
    async (id: string): Promise<void> => {
      try {
        await updateListing({ id, data: { status: 'active' } }).unwrap();

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Listing is now Active!',
        });
      } catch (error) {
        const typedError = error as UpdateListingError;

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: typedError?.data?.detail || typedError?.message || 'Failed to activate listing',
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
          location={item.serviceLocation || item.cityName || 'Location'}
          price={item.priceAmount?.toString() || '0'}
          priceUnit={
            item.priceType === 'hourly' ? '/hr' : item.priceType === 'daily' ? '/day' : ' fixed'
          }
          time={getRelativeTime(item.updatedAt)}
          tagText={item.isNegotiable ? 'Negotiable' : 'Fixed'}
          image={
            item.photoUrl ||
            item.imageUrl ||
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop'
          }
          isshowbuttons={true}
          pauseLabel="Activate"
          pauseIcon="play-circle"
          onPause={() => handleResume(item.id)}
        />
      );
    },
    [handleResume],
  );

  return (
    <ScreenWrapper withTopInset={false}>
      <View style={styles.container}>
        {(isLoading || isFetching) && pausedListings.length === 0 ? (
          <View style={styles.loaderContainer}>
            <AppLoadingAnimation visible={true} size={60} message="Loading paused listings..." />
          </View>
        ) : (
          <FlatList<ListingItem>
            data={pausedListings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={
              pausedListings.length === 0
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
                title="No Paused Listings"
                subtitle="You don't have any drafted or paused listings right now."
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyListContent: {
    justifyContent: 'center',
  },
});
