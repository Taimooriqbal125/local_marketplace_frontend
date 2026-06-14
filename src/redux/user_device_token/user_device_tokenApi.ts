import { baseApi } from '../api/baseApi';

export type DeviceType = 'android' | 'ios' | 'web';

/**
 * Represents a device token record from the backend.
 */
export interface UserDeviceToken {
  id: string;
  user_id: string;
  expo_push_token: string;
  device_type: DeviceType;
  device_name?: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

/**
 * Payload for registering or updating a device token.
 */
export interface RegisterTokenRequest {
  expo_push_token: string;
  device_type: DeviceType;
  device_name?: string;
}

export const deviceTokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Register or update an Expo push token.
     * Maps to POST /device-tokens/
     */
    registerDeviceToken: builder.mutation<UserDeviceToken, RegisterTokenRequest>({
      query: (data) => ({
        url: '/device-tokens/',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['DeviceTokens'],
    }),

    /**
     * Retrieve all device tokens associated with the current user.
     * Maps to GET /device-tokens/
     */
    getMyDeviceTokens: builder.query<UserDeviceToken[], { active_only?: boolean } | void>({
      query: (params) => ({
        url: '/device-tokens/',
        method: 'GET',
        params: params || { active_only: true },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'DeviceToken', id })),
              { type: 'DeviceTokens', id: 'LIST' },
            ]
          : [{ type: 'DeviceTokens', id: 'LIST' }],
    }),

    /**
     * Deactivate a specific token (typically called during logout).
     * Maps to PATCH /device-tokens/deactivate
     */
    deactivateDeviceToken: builder.mutation<{ message: string; success: boolean }, string>({
      query: (expo_push_token) => ({
        url: '/device-tokens/deactivate',
        method: 'PATCH',
        data: { expo_push_token },
      }),
      invalidatesTags: [{ type: 'DeviceTokens', id: 'LIST' }],
    }),

    /**
     * Permanently delete a device token record by its ID.
     * Maps to DELETE /device-tokens/{tokenId}
     */
    deleteDeviceToken: builder.mutation<{ message: string }, string>({
      query: (tokenId) => ({
        url: `/device-tokens/${tokenId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DeviceToken', id },
        { type: 'DeviceTokens', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useRegisterDeviceTokenMutation,
  useGetMyDeviceTokensQuery,
  useDeactivateDeviceTokenMutation,
  useDeleteDeviceTokenMutation,
} = deviceTokenApi;
