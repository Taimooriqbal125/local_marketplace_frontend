import { showErrorToast, showSuccessToast } from '@/components/toast/CustomError';
import {
  useCancelOrderRequestMutation,
  useGetRequestedOrdersAsBuyerQuery,
  useGetRequestedOrdersAsSellerQuery,
  useUpdateOrderMutation,
} from '@/redux/orders/orderApi';
import type { ApiResponse, Order } from '@/types';
import { getRelativeTime } from '@/utils/dateFormatter';

import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ToggleButton from '@components/common/ToggleButton';
import EmptyState from '@components/listings/EmptyState';
import OrderCard from '@components/orders/orderCard';
import RequestedOrders from '@components/orders/RequestedOrders';
import ShowRequestedModel from '@/components/modals/ShowRequestedModel';
import CustomAlert from '@/components/toast/CustomAlert';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform } from 'react-native';
import { colors } from '@theme/index';

type TabType = 'buying' | 'selling';

type OrderItem = Partial<Order> & {
  created_at?: string | null;
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

  // The ApiResponse now includes results, items, and orders properties
  return data.results || data.items || data.orders || [];
};

const isRequestedOrder = (item: OrderItem): boolean =>
  item?.status?.toLowerCase?.() === 'requested';

export default function RequestedTab() {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    data: buyerOrdersData,
    isLoading: buyerLoading,
    isError: isBuyerError,
    error: buyerError,
    refetch: refetchBuyer,
  } = useGetRequestedOrdersAsBuyerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: sellerOrdersData,
    isLoading: sellerLoading,
    isError: isSellerError,
    error: sellerError,
    refetch: refetchSeller,
  } = useGetRequestedOrdersAsSellerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [cancelOrder] = useCancelOrderRequestMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderMutation();

  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

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

  // Cancel Confirmation State
  const [isCancelAlertVisible, setIsCancelAlertVisible] = useState<boolean>(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderItem | null>(null);

  // Handle Query Errors
  useEffect(() => {
    if (isBuyerError) {
      const errorMessage = (buyerError as QueryErrorShape | undefined)?.data?.detail;
      showErrorToast(
        errorMessage || 'Failed to fetch your order requests',
        'Requested Orders Error',
      );
    }
  }, [isBuyerError, buyerError]);

  useEffect(() => {
    if (isSellerError) {
      const errorMessage = (sellerError as QueryErrorShape | undefined)?.data?.detail;
      showErrorToast(errorMessage || 'Failed to fetch incoming requests', 'Service Requests Error');
    }
  }, [isSellerError, sellerError]);

  const buyerOrders = useMemo(
    () => getOrders(buyerOrdersData).filter(isRequestedOrder),
    [buyerOrdersData],
  );
  const sellerOrders = useMemo(
    () => getOrders(sellerOrdersData).filter(isRequestedOrder),
    [sellerOrdersData],
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([refetchBuyer(), refetchSeller()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBuyer, refetchSeller]);

  const handleCancelRequest = useCallback((item: OrderItem) => {
    setOrderToCancel(item);
    setIsCancelAlertVisible(true);
  }, []);

  const confirmCancel = useCallback(async () => {
    if (!orderToCancel?.id) {
      showErrorToast('Invalid order id', 'Error');
      return;
    }

    try {
      setIsCancelAlertVisible(false);
      await cancelOrder(orderToCancel.id).unwrap();
      showSuccessToast('Order request cancelled successfully', 'Success');
    } catch (error) {
      const errorMessage = (error as QueryErrorShape | undefined)?.data?.detail;
      showErrorToast(errorMessage || 'Failed to cancel request', 'Error');
    } finally {
      setOrderToCancel(null);
    }
  }, [orderToCancel, cancelOrder]);

  const openAcceptModal = useCallback((item: OrderItem) => {
    setSelectedOrder(item);
    setIsModalVisible(true);
  }, []);

  const handleAcceptOrder = useCallback(
    async (agreedPrice: number): Promise<void> => {
      if (!selectedOrder?.id) {
        showErrorToast('Invalid order id', 'Error');
        return;
      }

      try {
        await updateOrderStatus({
          id: selectedOrder.id,
          data: { status: 'accepted', agreedPrice },
        }).unwrap();

        showSuccessToast('Order accepted! It is now in your Accepted tab.', 'Success');

        // Delay closing to let user see the success toast inside the modal
        setTimeout(() => {
          setIsModalVisible(false);
          setSelectedOrder(null);
        }, 2000);
      } catch (error) {
        const errorMessage = (error as QueryErrorShape | undefined)?.data?.detail;
        showErrorToast(errorMessage || 'Failed to accept order', 'Error');
      }
    },
    [selectedOrder, updateOrderStatus],
  );

  const handleRejectOrder = useCallback(
    async (item: OrderItem): Promise<void> => {
      if (!item?.id) {
        showErrorToast('Invalid order id', 'Error');
        return;
      }

      try {
        await updateOrderStatus({
          id: item.id,
          data: { status: 'cancelled' },
        }).unwrap();
        showSuccessToast('Order request rejected.', 'Rejected');
      } catch (error) {
        const errorMessage = (error as QueryErrorShape | undefined)?.data?.detail;
        showErrorToast(errorMessage || 'Failed to reject order', 'Error');
      }
    },
    [updateOrderStatus],
  );

  const renderBuyerCard = useCallback(
    (item: OrderItem) => {
      const image = item?.imageUrl || item?.image || item?.serviceImage || item?.listingImage || '';

      const title = item?.serviceName || item?.listingTitle || item?.title || 'Untitled Service';

      const sellerName = item?.sellerName || item?.seller?.name || 'Seller';

      const price =
        item?.agreedPrice || item?.servicePrice || item?.proposedPrice || item?.price || 0;

      const createdDate = item?.createdAt || item?.created_at;

      return (
        <RequestedOrders
          image={image}
          title={title}
          sellerName={sellerName}
          price={price}
          date={createdDate ? getRelativeTime(createdDate) : 'Recently'}
          indicatorText="Waiting for seller response"
          iconname="time-outline"
          iconcolor={colors.light.warning}
          buttontitle="Cancel Request"
          sellerLabel="Seller"
          onCancel={() => handleCancelRequest(item)}
        />
      );
    },
    [handleCancelRequest],
  );

  const renderSellerCard = useCallback(
    (item: OrderItem) => {
      const image = item?.imageUrl || item?.image || item?.serviceImage || item?.listingImage || '';

      const title = item?.serviceName || item?.listingTitle || item?.title || 'Untitled Service';

      const buyerName = item?.buyerName || item?.buyer?.name || 'Buyer';

      const price =
        item?.agreedPrice || item?.servicePrice || item?.proposedPrice || item?.price || 0;

      const createdDate = item?.createdAt || item?.created_at;

      return (
        <OrderCard
          title={title}
          buyerName={buyerName}
          price={price}
          date={createdDate ? getRelativeTime(createdDate) : 'Recently'}
          image={image}
          onAccept={() => openAcceptModal(item)}
          onReject={() => handleRejectOrder(item)}
        />
      );
    },
    [openAcceptModal, handleRejectOrder],
  );

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
          renderItem={({ item }) =>
            type === 'buying' ? renderBuyerCard(item) : renderSellerCard(item)
          }
          contentContainerStyle={[styles.listContent, data.length === 0 && styles.emptyListContent]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !tabLoading ? (
              <EmptyState
                title={type === 'buying' ? 'No requested orders' : 'No service requests'}
                subtitle={
                  type === 'buying'
                    ? 'Your requested orders will appear here.'
                    : 'New service requests from buyers will appear here.'
                }
                toppadding={0}
              />
            ) : null
          }
        />
      );
    },
    [refreshing, onRefresh, renderBuyerCard, renderSellerCard],
  );

  return (
    <ScreenWrapper withTopInset={false}>
      <View style={styles.container}>
        <ToggleButton
          leftText="My Orders"
          rightText="My Services"
          leftIcon="cart-outline"
          rightIcon="bag-handle-outline"
          onToggle={(tab) => console.log('Selected tab:', tab)}
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

        <ShowRequestedModel
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedOrder(null);
          }}
          onAccept={handleAcceptOrder}
          item={selectedOrder}
          isLoading={isUpdating}
        />

        <CustomAlert
          visible={isCancelAlertVisible}
          title="Cancel Request"
          message="Are you sure you want to cancel this order request? This action cannot be undone."
          type="warning"
          confirmText="Yes, Cancel"
          cancelText="No, Keep it"
          showCancel={true}
          onConfirm={confirmCancel}
          onCancel={() => {
            setIsCancelAlertVisible(false);
            setOrderToCancel(null);
          }}
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
