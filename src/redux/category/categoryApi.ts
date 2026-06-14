import { baseApi } from '../api/baseApi';
import { CACHE_KEYS, CACHE_CONFIG } from '@/storage/keys';
import { saveQueryToCache } from '../api/cacheUtils';
import { Category, ApiResponse } from '@/types';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all categories (flat list)
     */
    getAllCategories: builder.query<ApiResponse<Category> | Category[], any>({
      query: (params) => ({
        url: '/categories/',
        method: 'GET',
        params,
      }),
      providesTags: ['Categories'],
    }),

    /**
     * Get parent categories and save to device storage upon success
     */
    getParentCategories: builder.query<ApiResponse<Category> | Category[], void>({
      query: () => '/categories/parentcategories',
      providesTags: ['ParentCategories'],
      // Lifecycle trigger: Cache the successfully fetched parent categories to device storage
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await saveQueryToCache(CACHE_KEYS.CATEGORIES, data, CACHE_CONFIG.EXPIRY.NORMAL);
        } catch {
          console.warn('[getParentCategories] Query failed, skipping cache update');
        }
      },
    }),

    /**
     * Get category tree (nested children)
     */
    getCategoryTree: builder.query<Category[], any>({
      query: (params) => ({
        url: '/categories/tree/',
        method: 'GET',
        params,
      }),
      providesTags: ['CategoryTree'],
    }),

    /**
     * Get sub categories
     */
    getSubCategories: builder.query<ApiResponse<Category> | Category[], string>({
      query: (parentId) => `/categories/parent/${parentId}/children`,
      providesTags: (result, error, parentId) => [{ type: 'SubCategories', id: parentId }],
    }),

    /**
     * Get single category by ID
     */
    getCategoryById: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    /**
     * Get category by slug
     */
    getCategoryBySlug: builder.query<Category, string>({
      query: (slug) => `/categories/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Category', id: slug }],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetParentCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetSubCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
} = categoryApi;
