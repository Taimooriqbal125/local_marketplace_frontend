import { baseApi } from '../api/baseApi';
import { ApiResponse, Listing } from '@/types';
import { saveQueryToCache } from '../api/cacheUtils';
import { CACHE_KEYS, CACHE_CONFIG } from '@/storage/keys';

// --- Parameter Types ---
interface ListingQueryParams extends Record<string, unknown> {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  priceAmount: string;
  priceType: string;
  isNegotiable: boolean;
  status: string;
  categoryId: string;
  cityId: string;
  serviceLocation: string;
  serviceRadiusKm: number;
  image?: any; // For multipart upload
}

export const listingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all public service listings
     */
    getAllListings: builder.query<ApiResponse<Listing> | Listing[], ListingQueryParams | void>({
      query: (params) => ({
        url: '/services/',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['Listings'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Standard: Cache the Home listings with a Fast Expiry (1 Hour)
          // and a memory-efficient limit of 20 items.
          await saveQueryToCache(
            CACHE_KEYS.HOME_LISTINGS,
            data,
            CACHE_CONFIG.EXPIRY.FAST,
            CACHE_CONFIG.DEFAULT_LIMIT,
          );
        } catch {
          // If the query fails, we don't update the cache
          console.warn('[getAllListings] Query failed, skipping cache update');
        }
      },
    }),

    /**
     * Get nearby listings using logged-in user's saved profile location
     */
    getNearbyListingsFromProfile: builder.query<
      ApiResponse<Listing> | Listing[],
      ListingQueryParams | void
    >({
      query: (params) => ({
        url: '/services/nearby/me',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['Listings'],
    }),

    /**
     * Get single listing by ID
     */
    getListingById: builder.query<Listing, string>({
      query: (id) => `/services/${id}`,
      providesTags: (result, error, id) => [{ type: 'Listing', id }],
    }),

    /**
     * Get current user's listings
     */
    getMyListings: builder.query<Listing[], ListingQueryParams | void>({
      query: (params) => ({
        url: '/services/me',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['Listings'],
    }),

    /**
     * Create a new service listing
     */
    createListing: builder.mutation<Listing, FormData | CreateListingRequest>({
      query: (data) => ({
        url: '/services/',
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Listings'],
    }),

    /**
     * Update service listing by ID
     */
    updateListing: builder.mutation<
      Listing,
      { id: string; data: Partial<CreateListingRequest> | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PATCH',
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: (result, error, { id }) => ['Listings', { type: 'Listing', id }],
    }),

    /**
     * Delete service listing by ID
     */
    deleteListing: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Listings'],
    }),
  }),
});

export const {
  useGetAllListingsQuery,
  useGetNearbyListingsFromProfileQuery,
  useGetListingByIdQuery,
  useGetMyListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
} = listingApi;
