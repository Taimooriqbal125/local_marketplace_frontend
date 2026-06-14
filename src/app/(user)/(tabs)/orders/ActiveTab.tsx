import { showErrorToast, showSuccessToast } from '@/components/toast/CustomError';
import {
  useGetActiveOrdersAsBuyerQuery,
  useGetActiveOrdersAsSellerQuery,
  useUpdateOrderMutation,
} from '@/redux/orders/orderApi';
import { getRelativeTime } from '@/utils/dateFormatter';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ToggleButton from '@components/common/ToggleButton';
import EmptyState from '@components/listings/EmptyState';
import RequestedOrders from '@components/orders/RequestedOrders';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform } from 'react-native';
import { colors } from '@theme/index';

const getOrders = (data: any) =>
  data?.orders || data?.results || data?.items || (Array.isArray(data) ? data : []);

const hasSellerCompleted = (order: any) =>
  !!(order?.sellerCompletedAt || order?.seller_completed_at);

const hasBuyerCompleted = (order: any) => !!(order?.buyerCompletedAt || order?.buyer_completed_at);

const isActiveOrder = (order: any) => {
  const sellerDone = hasSellerCompleted(order);
  const buyerDone = hasBuyerCompleted(order);

  return !(sellerDone && buyerDone);
};

export default function ActiveTab() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: buyerOrdersData,
    isLoading: buyerLoading,
    isError: isBuyerError,
    error: buyerError,
    refetch: refetchBuyer,
  } = useGetActiveOrdersAsBuyerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: sellerOrdersData,
    isLoading: sellerLoading,
    isError: isSellerError,
    error: sellerError,
    refetch: refetchSeller,
  } = useGetActiveOrdersAsSellerQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateOrder] = useUpdateOrderMutation();

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

  const getErrorMessage = (error: any, fallbackMessage: string) => {
    return error?.data?.detail || error?.data?.message || error?.message || fallbackMessage;
  };

  useEffect(() => {
    if (isBuyerError) {
      showErrorToast(
        getErrorMessage(buyerError, 'Failed to fetch your orders'),
        'Buyer Orders Error',
      );
    }
  }, [isBuyerError, buyerError]);

  useEffect(() => {
    if (isSellerError) {
      showErrorToast(
        getErrorMessage(sellerError, 'Failed to fetch your services'),
        'Seller Orders Error',
      );
    }
  }, [isSellerError, sellerError]);

  const buyerOrders = useMemo(
    () => getOrders(buyerOrdersData).filter(isActiveOrder),
    [buyerOrdersData],
  );
  const sellerOrders = useMemo(
    () => getOrders(sellerOrdersData).filter(isActiveOrder),
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

  const handleCompleteOrder = useCallback(
    async (item: any, role: 'buyer' | 'seller') => {
      try {
        await updateOrder({
          id: item?.id,
          data: {
            status: 'completed',
          },
        }).unwrap();

        showSuccessToast(
          role === 'buyer' ? 'Order completion confirmed!' : 'Order marked as completed!',
          'Success',
        );
      } catch (error) {
        showErrorToast(getErrorMessage(error, 'Failed to complete order'), 'Error', 'alert-circle');
      }
    },
    [updateOrder],
  );

  const renderOrderCard = useCallback(
    (item: any, type: string) => {
      const image = item?.imageUrl || item?.image || item?.serviceImage || item?.listingImage || '';

      const title = item?.serviceName || item?.listingTitle || item?.title || 'Untitled Service';

      const otherPersonName =
        type === 'buying'
          ? item?.sellerName || item?.seller?.name || 'Seller'
          : item?.buyerName || item?.buyer?.name || 'Buyer';

      const price =
        item?.agreedPrice || item?.servicePrice || item?.proposedPrice || item?.price || 0;

      const createdDate = item?.createdAt || item?.created_at;

      const sellerDone = hasSellerCompleted(item);
      const buyerDone = hasBuyerCompleted(item);

      let indicatorText = 'Order in Progress';
      let iconname = 'time-outline';
      let iconcolor: string = colors.light.warning;
      let showButton = false;
      let buttontitle: string | undefined = undefined;
      let onPressAction: (() => void) | undefined = undefined;

      if (type === 'buying') {
        if (!buyerDone) {
          indicatorText = 'Order in Progress';
          iconname = 'time-outline';
          iconcolor = colors.light.warning;
          showButton = true;
          buttontitle = 'Mark as Completed';
          onPressAction = () => handleCompleteOrder(item, 'buyer');
        } else {
          indicatorText = 'Waiting for seller to finalize';
          iconname = 'checkmark-done-outline';
          iconcolor = colors.light.success;
          showButton = false;
        }
      } else {
        if (!sellerDone) {
          indicatorText = buyerDone ? 'Buyer confirmed completion' : 'Work in Progress';
          iconname = buyerDone ? 'checkmark-done-outline' : 'time-outline';
          iconcolor = buyerDone ? colors.light.success : colors.light.warning;
          showButton = true;
          buttontitle = 'Mark as Completed';
          onPressAction = () => handleCompleteOrder(item, 'seller');
        }
      }

      return (
        <RequestedOrders
          image={image}
          title={title}
          sellerName={otherPersonName}
          price={price}
          date={createdDate ? getRelativeTime(createdDate) : 'Recently'}
          showbutton={showButton}
          buttontitle={buttontitle}
          onCancel={onPressAction}
          indicatorText={indicatorText}
          iconname={iconname}
          iconcolor={iconcolor}
          sellerLabel={type === 'buying' ? 'Seller' : 'Buyer'}
        />
      );
    },
    [handleCompleteOrder],
  );

  const renderOrders = useCallback(
    (data: any, type: string, tabLoading: boolean) => {
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
          keyExtractor={(item, index) => item?.id?.toString?.() || index.toString()}
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
                title={type === 'buying' ? 'No active orders' : 'No active services'}
                subtitle={
                  type === 'buying'
                    ? 'Your active orders will appear here.'
                    : 'Your active service orders will appear here.'
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
