import { baseApi } from '../api/baseApi';
import { Review, ApiResponse } from '@/types';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Create a new review
     */
    createReview: builder.mutation<Review, Partial<Review>>({
      query: (data) => ({
        url: '/reviews/',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Reviews', 'User'],
    }),

    /**
     * Get all reviews (Admin only)
     */
    getAllReviews: builder.query<ApiResponse<Review>, any>({
      query: (params) => ({
        url: '/reviews/',
        method: 'GET',
        params,
      }),
      providesTags: ['Reviews'],
    }),

    /**
     * Get reviews received by current user
     */
    getMyReceivedReviews: builder.query<ApiResponse<Review>, any>({
      query: (params) => ({
        url: '/reviews/me/received',
        method: 'GET',
        params,
      }),
      providesTags: ['Reviews'],
    }),

    /**
     * Get reviews given by current user
     */
    getMyGivenReviews: builder.query<ApiResponse<Review>, any>({
      query: (params) => ({
        url: '/reviews/me/given',
        method: 'GET',
        params,
      }),
      providesTags: ['Reviews'],
    }),

    /**
     * Get reviews by user ID
     */
    getReviewsByUserId: builder.query<ApiResponse<Review>, string>({
      query: (userId) => ({
        url: `/reviews/byuserid/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'Reviews', id: userId }],
    }),

    /**
     * Get single review by ID
     */
    getReviewById: builder.query<Review, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: 'GET',
      }),
      providesTags: (result, error, reviewId) => [{ type: 'Reviews', id: reviewId }],
    }),

    /**
     * Delete review by ID
     */
    deleteReview: builder.mutation<{ success: boolean }, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetAllReviewsQuery,
  useGetMyReceivedReviewsQuery,
  useGetMyGivenReviewsQuery,
  useGetReviewsByUserIdQuery,
  useGetReviewByIdQuery,
  useDeleteReviewMutation,
} = reviewApi;
