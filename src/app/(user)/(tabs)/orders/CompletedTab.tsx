import {
  useGetCompletedOrdersAsBuyerQuery,
  useGetCompletedOrdersAsSellerQuery,
} from '@/redux/orders/orderApi';
import { useGetMyGivenReviewsQuery } from '@/redux/reviews/reviewApi';
import { getRelativeTime } from '@/utils/dateFormatter';

import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';

import { showErrorToast } from '@/components/toast/CustomError';
import type { ApiResponse, Order } from '@/types';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ToggleButton from '@components/common/ToggleButton';
import EmptyState from '@components/listings/EmptyState';
import RequestedOrders from '@components/orders/RequestedOrders';
import AddReviews from '@/components/modals/AddReviews';
import type { JSX } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform } from 'react-native';
import { colors } from '@theme/index';

type TabType = 'buying' | 'selling';

type OrderItem = Partial<Order> & {
  seller_completed_at?: string | null;
  buyer_completed_at?: string | null;
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
  status?: string | null;
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
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if ('orders' in data && Array.isArray(data.orders)) {
    return data.orders;
  }

  if ('items' in data && Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
};

const isCompletedOrder = (order: OrderItem): boolean => {
  const sellerDone = !!(order?.sellerCompletedAt || order?.seller_completed_at);
  const buyerDone = !!(order?.buyerCompletedAt || order?.buyer_completed_at);
  const status = order?.status?.toLowerCase?.();

  return status === 'completed' || (sellerDone && buyerDone);
};

export default function CompletedTab(): JSX.Element {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const {
    data: buyerOrdersData,
    isLoading: buyerLoading,
    isError: isBuyerError,
    error: buyerError,
    refetch: refetchBuyer,
  } = useGetCompletedOrdersAsBuyerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: sellerOrdersData,
    isLoading: sellerLoading,
    isError: isSellerError,
    error: sellerError,
    refetch: refetchSeller,
  } = useGetCompletedOrdersAsSellerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data: myGivenReviewsData, refetch: refetchGivenReviews } = useGetMyGivenReviewsQuery({});

  // Auto-refresh logic
  const lastFetchedTime = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only refetch if it's been more than 30 seconds since last fetch
      if (now - lastFetchedTime.current > 30000) {
        refetchBuyer();
        refetchSeller();
        refetchGivenReviews();
        lastFetchedTime.current = now;
      }
    }, [refetchBuyer, refetchSeller, refetchGivenReviews]),
  );

  // Handle Query Errors
  useEffect(() => {
    if (isBuyerError) {
      const errorMessage = (buyerError as QueryErrorShape | undefined)?.data?.detail;
      showErrorToast(
        errorMessage || 'Failed to fetch your completed orders',
        'Completed Orders Error',
      );
    }
  }, [isBuyerError, buyerError]);

  useEffect(() => {
    if (isSellerError) {
      const errorMessage = (sellerError as QueryErrorShape | undefined)?.data?.detail;
      showErrorToast(
        errorMessage || 'Failed to fetch your completed services',
        'Completed Services Error',
      );
    }
  }, [isSellerError, sellerError]);

  const reviewedOrderIds = useMemo(() => {
    if (!myGivenReviewsData) return new Set<string>();

    const reviews =
      (myGivenReviewsData as any).results ||
      (myGivenReviewsData as any).items ||
      (Array.isArray(myGivenReviewsData) ? myGivenReviewsData : []);

    return new Set<string>(reviews.map((r: any) => r.orderId));
  }, [myGivenReviewsData]);

  const buyerOrders = useMemo(
    () => getOrders(buyerOrdersData).filter(isCompletedOrder),
    [buyerOrdersData],
  );

  const sellerOrders = useMemo(
    () => getOrders(sellerOrdersData).filter(isCompletedOrder),
    [sellerOrdersData],
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([refetchBuyer(), refetchSeller(), refetchGivenReviews()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBuyer, refetchSeller, refetchGivenReviews]);

  const handleLeaveReview = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setReviewModalVisible(true);
  }, []);

  const renderOrderCard = useCallback(
    (item: OrderItem, type: TabType): JSX.Element => {
      const image = item?.imageUrl || item?.image || item?.serviceImage || item?.listingImage || '';

      const title = item?.serviceName || item?.listingTitle || item?.title || 'Untitled Service';

      const otherPersonName =
        type === 'buying'
          ? item?.sellerName || item?.seller?.name || 'Seller'
          : item?.buyerName || item?.buyer?.name || 'Buyer';

      const price =
        item?.agreedPrice || item?.servicePrice || item?.proposedPrice || item?.price || 0;

      const createdDate = item?.createdAt || item?.created_at;

      const isFullyCompleted = item?.status?.toLowerCase?.() === 'completed';
      const orderIdStr = item?.id?.toString() || '';
      const hasReviewed = reviewedOrderIds.has(orderIdStr);

      return (
        <RequestedOrders
          image={image}
          title={title}
          sellerName={otherPersonName}
          price={price}
          date={createdDate ? getRelativeTime(createdDate) : 'Recently'}
          showbutton={type === 'buying' && isFullyCompleted && !hasReviewed}
          buttontitle="Leave a Review"
          onCancel={() => handleLeaveReview(orderIdStr)}
          indicatorText="Completed"
          iconname="checkmark-circle-outline"
          iconcolor={colors.light.success}
          sellerLabel={type === 'buying' ? 'Seller' : 'Buyer'}
        />
      );
    },
    [reviewedOrderIds, handleLeaveReview],
  );

  const renderOrders = useCallback(
    (data: OrderItem[], type: TabType, tabLoading: boolean): JSX.Element => {
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
                title={type === 'buying' ? 'No completed services' : 'No completed orders'}
                subtitle={
                  type === 'buying'
                    ? 'Your completed service history will appear here.'
                    : 'Orders completed with buyers will appear here.'
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

      <AddReviews
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        orderId={selectedOrderId}
      />
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
