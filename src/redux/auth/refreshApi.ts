import { baseApi } from '../api/baseApi';

// URL: POST /refreshtokens/logout
// Headers:
// Authorization: Bearer <access_token> (required)
// Body:
// Optional if cookie present
// Otherwise:
// {
// "refresh_token": "your_refresh_token"
// }
// Success response:
// { "message": "Logged out successfully" }

/**
 * TOKEN MANAGEMENT API
 * Handles all token lifecycle endpoints: issue, rotate, revoke, and revoke-all.
 */

import { injectRefreshApi } from '@/app/axios/axiosBaseQuery';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
}

export interface MessageResponse {
  message: string;
}

export const refreshApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 1. POST /refreshtokens/issue
     * Authorization header (Bearer) required.
     */
    issueToken: builder.mutation<TokenResponse, void>({
      query: () => ({
        url: '/refreshtokens/issue',
        method: 'POST',
      }),
    }),

    /**
     * 2. POST /refreshtokens/rotate
     * Body can contain refresh_token (optional if cookie exists).
     */
    refreshToken: builder.mutation<TokenResponse, { refresh_token?: string } | void>({
      query: (data) => ({
        url: '/refreshtokens/rotate',
        method: 'POST',
        data,
      }),
    }),

    /**
     * 3. POST /refreshtokens/revoke
     * Body contains refresh_token.
     */
    revokeToken: builder.mutation<MessageResponse, { refresh_token?: string } | void>({
      query: (data) => ({
        url: '/refreshtokens/revoke',
        method: 'POST',
        data,
      }),
    }),

    /**
     * 4. POST /refreshtokens/revoke-all
     * Authorization header (Bearer) required.
     */
    revokeAllTokens: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: '/refreshtokens/revoke-all',
        method: 'POST',
      }),
    }),

    /**
     * 5. POST /refreshtokens/logout
     * Authorization header (Bearer) required.
     */
    logout: builder.mutation<MessageResponse, { refresh_token?: string } | void>({
      query: (data) => ({
        url: '/refreshtokens/logout',
        method: 'POST',
        data,
      }),
    }),
  }),
});

// Inject the API reference into the base query to enable centralized rotation
injectRefreshApi(refreshApi);

export const {
  useIssueTokenMutation,
  useRefreshTokenMutation,
  useRevokeTokenMutation,
  useRevokeAllTokensMutation,
  useLogoutMutation,
} = refreshApi;
