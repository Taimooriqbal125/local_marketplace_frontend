import { secureStore } from '@/storage';
import axiosInstance from '@services/axios';

/**
 * User Service
 * User authentication and user management
 */
const authService = {
  /**
   * Login user
   * FastAPI OAuth2PasswordRequestForm expects:
   * - username
   * - password
   * Here username = email
   *
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<Object>} token data
   */
  loginUser: async ({ email, password }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axiosInstance.post('/users/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token, user } = response.data;

      // Persist tokens using the refactored secureStore
      if (access_token) {
        await secureStore.saveAuthTokens({
          accessToken: access_token,
          refreshToken: refresh_token || null,
        });
      }

      // Optional: Save user data if returned
      if (user) {
        await secureStore.setObject('user_data', user);
      }

      return response.data;
    } catch (error) {
      console.error('Login user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await secureStore.clearAuthStorage();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData
   * @returns {Promise<Object>} created user
   */
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/users/', userData);

      return response.data;
    } catch (error) {
      console.error('Create user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all users
   * Optional query params:
   * - skip
   * - limit
   * - is_active
   * - is_admin
   *
   * @param {Object} params
   * @returns {Promise<Array>} users list
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/users/', {
        params,
      });

      return response.data;
    } catch (error) {
      console.error('Get all users error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get single user by ID
   * @param {string} userId
   * @returns {Promise<Object>} user data
   */
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);

      return response.data;
    } catch (error) {
      console.error('Get user by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update user by ID
   * @param {string} userId
   * @param {Object} userData
   * @returns {Promise<Object>} updated user
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.patch(`/users/${userId}`, userData);

      return response.data;
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete user by ID
   * @param {string} userId
   * @returns {Promise<Object>} success message
   */
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);

      return response.data;
    } catch (error) {
      console.error('Delete user error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default authService;
