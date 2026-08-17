// src/redux/features/auth/authApi.ts
import { baseApi } from '../api/baseApi';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: ({ email, password }) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        return {
          url: '/users/login',
          method: 'POST',
          data: formData,
        };
      },
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<User, RegisterRequest>({
      query: (userData) => ({
        url: '/users/signup',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['User', 'Users'],
    }),

    getUserById: builder.query<User, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<User, { userId: string } & Partial<User>>({
      query: ({ userId, ...userData }) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        data: userData,
      }),
      invalidatesTags: ['User', 'Users'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetUserByIdQuery, useUpdateUserMutation } =
  authApi;
