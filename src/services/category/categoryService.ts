import axiosInstance from '@services/axios';
import { Category, ApiResponse } from '@/types';

/**
 * Category Service
 * Handles category-related API calls
 */
const categoryService = {
  /**
   * Get all categories
   */
  getAllCategories: async (params: any = {}): Promise<ApiResponse<Category> | Category[]> => {
    const response = await axiosInstance.get('/categories/', { params });
    return response.data;
  },

  /**
   * Get parent categories
   */
  getParentCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get('/categories/parentcategories');
    return response.data;
  },

  /**
   * Get single category by ID
   */
  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await axiosInstance.get(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Get category by slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axiosInstance.get(`/categories/slug/${slug}`);
    return response.data;
  },

  /**
   * Create category (Admin only)
   */
  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const response = await axiosInstance.post('/categories/', categoryData);
    return response.data;
  },

  /**
   * Update category by ID (Admin only)
   */
  updateCategory: async (
    categoryId: string,
    categoryData: Partial<Category>,
  ): Promise<Category> => {
    const response = await axiosInstance.patch(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Delete category by ID (Admin only)
   */
  deleteCategory: async (categoryId: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${categoryId}`);
  },

  /**
   * Get category with nested children for admin (Admin only)
   */
  getCategoryAdminById: async (categoryId: string): Promise<Category> => {
    const response = await axiosInstance.get(`/categories/admin/${categoryId}`);
    return response.data;
  },

  /**
   * Get category tree
   */
  getCategoryTree: async (params: any = {}): Promise<Category[]> => {
    const response = await axiosInstance.get('/categories/tree/', { params });
    return response.data;
  },

  /**
   * Get sub categories
   */
  getSubCategories: async (parentId: string): Promise<Category[]> => {
    const response = await axiosInstance.get(`/categories/parent/${parentId}/children`);
    return response.data;
  },
};

export default categoryService;
