import { baseApi } from '../api/baseApi';
import { City, ApiResponse } from '@/types';

export const cityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all cities
     */
    getAllCities: builder.query<ApiResponse<City> | City[], void>({
      query: () => ({
        url: '/cities/',
        method: 'GET',
      }),
      providesTags: ['Cities'],
    }),

    /**
     * Get single city by ID
     */
    getCityById: builder.query<City, string>({
      query: (cityId) => `/cities/${cityId}`,
      providesTags: (result, error, cityId) => [{ type: 'City', id: cityId }],
    }),

    /**
     * Get city by slug
     */
    getCityBySlug: builder.query<City, string>({
      query: (slug) => `/cities/slug/${slug}`,
      // We can optionally tag by slug to invalidate
      providesTags: (result, error, slug) => [{ type: 'City', id: slug }],
    }),

    /**
     * Create city (Admin only)
     */
    createCity: builder.mutation<City, Partial<City>>({
      query: (cityData) => ({
        url: '/cities/',
        method: 'POST',
        data: cityData,
      }),
      invalidatesTags: ['Cities'],
    }),

    /**
     * Update city by ID (Admin only)
     */
    updateCity: builder.mutation<City, { cityId: string; cityData: Partial<City> }>({
      query: ({ cityId, cityData }) => ({
        url: `/cities/${cityId}`,
        method: 'PATCH',
        data: cityData,
      }),
      invalidatesTags: (result, error, { cityId }) => ['Cities', { type: 'City', id: cityId }],
    }),

    /**
     * Delete city by ID (Admin only)
     */
    deleteCity: builder.mutation<{ success: boolean }, string>({
      query: (cityId) => ({
        url: `/cities/${cityId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cities'],
    }),
  }),
});

export const {
  useGetAllCitiesQuery,
  useGetCityByIdQuery,
  useGetCityBySlugQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = cityApi;
