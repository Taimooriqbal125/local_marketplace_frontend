import {
  useGetCancelledOrdersAsBuyerQuery,
  useGetCancelledOrdersAsSellerQuery,
} from '@/redux/orders/orderApi';
import { getRelativeTime } from '@/utils/dateFormatter';

import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';

import { showErrorToast } from '@/components/toast/CustomError';
import type { ApiResponse, Order } from '@/types';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ToggleButton from '@components/common/ToggleButton';
import EmptyState from '@components/listings/EmptyState';
import RequestedOrders from '@components/orders/RequestedOrders';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform } from 'react-native';
import { colors } from '@theme/index';

type TabType = 'buying' | 'selling';

type OrderItem = Partial<Order> & {
  imageUrl?: string | null;
  image?: string | null;
  serviceImage?: string | null;
  listingImage?: string | null;
  serviceName?: string | null;
  title?: string | null;
  sellerName?: string | null;
  buyerName?: string | null;
  seller?: { name?: string | null };
  buyer?: { name?: string | null };
  agreedPrice?: string | number;
  servicePrice?: string | number;
  price?: string | number;
  created_at?: string | null;
};

type OrdersDataShape =
  | ApiResponse<OrderItem>
  | { orders?: OrderItem[]; results?: OrderItem[]; items?: OrderItem[] }
  | OrderItem[]
  | undefined;

type QueryErrorShape = {
  data?: {
    detail?: string;
  };
};

const getOrders = (data: OrdersDataShape): OrderItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const d = data as any;
  return d.results || d.items || d.orders || [];
};

export default function CancelledTab() {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    data: buyerOrdersData,
    isLoading: buyerLoading,
    isError: isBuyerError,
    error: buyerError,
    refetch: refetchBuyer,
  } = useGetCancelledOrdersAsBuyerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: sellerOrdersData,
    isLoading: sellerLoading,
    isError: isSellerError,
    error: sellerError,
    refetch: refetchSeller,
  } = useGetCancelledOrdersAsSellerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Auto-refresh logic
  const lastFetchedTime = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only refetch if it's been more than 30 seconds since last fetch
      if (now - lastFetchedTime.current > 30000) {
        refetchBuyer();
        refetchSeller();
        lastFetchedTime.current = now;
      }
    }, [refetchBuyer, refetchSeller]),
  );

  // Handle Query Errors
  useEffect(() => {
    if (isBuyerError) {
      const errorMessage = (buyerError as QueryErrorShape | undefined)?.data?.detail;
      showErrorToast(
        errorMessage || 'Failed to fetch your cancelled orders',
        'Cancelled Orders Error',
      );
    }
  }, [isBuyerError, buyerError]);

  useEffect(() => {
    if (isSellerError) {
      const errorMessage = (sellerError as QueryErrorShape | undefined)?.data?.detail;
      showErrorToast(
        errorMessage || 'Failed to fetch your cancelled services',
        'Cancelled Services Error',
      );
    }
  }, [isSellerError, sellerError]);

  const buyerOrders = useMemo(() => getOrders(buyerOrdersData), [buyerOrdersData]);
  const sellerOrders = useMemo(() => getOrders(sellerOrdersData), [sellerOrdersData]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([refetchBuyer(), refetchSeller()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBuyer, refetchSeller]);

  const renderOrderCard = useCallback((item: OrderItem, type: TabType) => {
    const image = item?.imageUrl || item?.image || item?.serviceImage || item?.listingImage || '';
    const title = item?.serviceName || item?.listingTitle || item?.title || 'Untitled Service';
    const otherPersonName =
      type === 'buying'
        ? item?.sellerName || item?.seller?.name || 'Seller'
        : item?.buyerName || item?.buyer?.name || 'Buyer';
    const price =
      item?.agreedPrice || item?.servicePrice || item?.proposedPrice || item?.price || 0;
    const createdDate = item?.createdAt || item?.created_at;

    return (
      <RequestedOrders
        image={image}
        title={title}
        sellerName={otherPersonName}
        price={price}
        date={createdDate ? getRelativeTime(createdDate) : 'Recently'}
        showbutton={false}
        indicatorText="Cancelled"
        iconname="close-circle-outline"
        iconcolor={colors.light.danger}
        sellerLabel={type === 'buying' ? 'Seller' : 'Buyer'}
      />
    );
  }, []);

  const renderOrders = useCallback(
    (data: OrderItem[], type: TabType, tabLoading: boolean) => {
      if (tabLoading && data.length === 0) {
        return (
          <View style={styles.loadingContainer}>
            <AppLoadingAnimation visible={true} fullscreen={false} />
          </View>
        );
      }

      return (
        <FlatList
          data={data}
          keyExtractor={(item: OrderItem, index: number) =>
            item?.id?.toString?.() || index.toString()
          }
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
          renderItem={({ item }) => renderOrderCard(item, type)}
          contentContainerStyle={[styles.listContent, data.length === 0 && styles.emptyListContent]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !tabLoading ? (
              <EmptyState
                title={type === 'buying' ? 'No cancelled orders' : 'No cancelled services'}
                subtitle={
                  type === 'buying'
                    ? 'Your cancelled orders will appear here.'
                    : 'Cancelled service requests will appear here.'
                }
                toppadding={0}
              />
            ) : null
          }
        />
      );
    },
    [refreshing, onRefresh, renderOrderCard],
  );

  return (
    <ScreenWrapper withTopInset={false}>
      <View style={styles.container}>
        <ToggleButton
          leftText="My Orders"
          rightText="My Services"
          leftIcon="cart-outline"
          rightIcon="bag-handle-outline"
          onToggle={(tab: unknown) => console.log('Selected tab:', tab)}
          initialState="left"
          activeColor={colors.light.primary}
          inactiveColor={colors.light.altBorder}
          textColor={colors.light.surface}
          inactiveTextColor={colors.light.subText}
          borderRadius={25}
          height={50}
          leftScreen={renderOrders(buyerOrders, 'buying', buyerLoading)}
          rightScreen={renderOrders(sellerOrders, 'selling', sellerLoading)}
        />
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
    paddingHorizontal: 2,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
});
