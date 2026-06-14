import { baseApi } from '../api/baseApi';
import { Order, ApiResponse, CreateOrderRequest, UpdateOrderRequest } from '@/types';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get orders as buyer
     */
    getMyOrdersAsBuyer: builder.query<ApiResponse<Order>, any>({
      query: (params) => ({
        url: '/orders/me/as-buyer',
        method: 'GET',
        params,
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Get orders as seller
     */
    getMyOrdersAsSeller: builder.query<ApiResponse<Order>, any>({
      query: (params) => ({
        url: '/orders/me/as-seller',
        method: 'GET',
        params,
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Requested orders - Buyer
     */
    getRequestedOrdersAsBuyer: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-buyer',
        method: 'GET',
        params: { status: 'requested' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Requested orders - Seller
     */
    getRequestedOrdersAsSeller: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-seller',
        method: 'GET',
        params: { status: 'requested' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Accepted/Active orders - Buyer
     */
    getActiveOrdersAsBuyer: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-buyer',
        method: 'GET',
        params: { status: 'accepted' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Accepted/Active orders - Seller
     */
    getActiveOrdersAsSeller: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-seller',
        method: 'GET',
        params: { status: 'accepted' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Completed orders - Buyer
     */
    getCompletedOrdersAsBuyer: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-buyer',
        method: 'GET',
        params: { status: 'completed' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Completed orders - Seller
     */
    getCompletedOrdersAsSeller: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-seller',
        method: 'GET',
        params: { status: 'completed' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Cancelled orders - Buyer
     */
    getCancelledOrdersAsBuyer: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-buyer',
        method: 'GET',
        params: { status: 'cancelled' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Cancelled orders - Seller
     */
    getCancelledOrdersAsSeller: builder.query<ApiResponse<Order>, void>({
      query: () => ({
        url: '/orders/me/as-seller',
        method: 'GET',
        params: { status: 'cancelled' },
      }),
      providesTags: ['Orders'],
    }),

    /**
     * Get order details by ID
     */
    getOrderById: builder.query<Order, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    /**
     * Create a new order
     */
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (data) => ({
        url: '/orders/',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Orders'],
    }),

    /**
     * Update order
     */
    updateOrder: builder.mutation<Order, { id: string; data: UpdateOrderRequest }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (result, error, { id }) => ['Orders', { type: 'Order', id }],
    }),

    /**
     * Cancel order request by buyer
     */
    cancelOrderRequest: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/orders/${id}/cancel-request`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetMyOrdersAsBuyerQuery,
  useGetMyOrdersAsSellerQuery,
  useGetRequestedOrdersAsBuyerQuery,
  useGetRequestedOrdersAsSellerQuery,
  useGetActiveOrdersAsBuyerQuery,
  useGetActiveOrdersAsSellerQuery,
  useGetCompletedOrdersAsBuyerQuery,
  useGetCompletedOrdersAsSellerQuery,
  useGetCancelledOrdersAsBuyerQuery,
  useGetCancelledOrdersAsSellerQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useCancelOrderRequestMutation,
} = orderApi;
