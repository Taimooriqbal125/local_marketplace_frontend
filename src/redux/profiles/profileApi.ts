import { baseApi } from '../api/baseApi';
import { Profile, UserLocation, ApiResponse } from '@/types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get current logged-in user's profile
     */
    getMyProfile: builder.query<Profile, void>({
      query: () => '/profiles/me',
      providesTags: ['Profile'],
    }),

    /**
     * Create current logged-in user's profile
     */
    createMyProfile: builder.mutation<Profile, { profileData: Partial<Profile>; photoFile?: any }>({
      query: ({ profileData, photoFile }) => {
        const formData = new FormData();
        formData.append('profile_data', JSON.stringify(profileData));

        if (photoFile) {
          formData.append('photoUrl', photoFile);
        }

        return {
          url: '/profiles/',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
      invalidatesTags: ['Profile'],
    }),

    /**
     * Get current logged-in user's location
     */
    getMyLocation: builder.query<UserLocation, void>({
      query: () => '/profiles/me',
      providesTags: ['ProfileLocation'],
    }),

    /**
     * Update current user's location
     */
    updateMyLocation: builder.mutation<UserLocation, Partial<UserLocation>>({
      query: (locationData) => ({
        url: '/profiles/me/location',
        method: 'PATCH',
        data: locationData,
      }),
      invalidatesTags: ['ProfileLocation', 'Profile'],
    }),

    /**
     * Get all profiles (Admin only)
     */
    getAllProfiles: builder.query<ApiResponse<Profile> | Profile[], any>({
      query: (params) => ({
        url: '/profiles/',
        method: 'GET',
        params,
      }),
      providesTags: ['Profiles'],
    }),

    /**
     * Get profile by user ID
     */
    getProfileByUserId: builder.query<Profile, string>({
      query: (userId) => `/profiles/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId }],
    }),

    /**
     * Update profile by user ID
     */
    updateProfileByUserId: builder.mutation<
      Profile,
      { userId: string; profileData?: Partial<Profile>; photoFile?: any }
    >({
      query: ({ userId, profileData, photoFile }) => {
        const formData = new FormData();

        if (profileData) {
          formData.append('profile_data', JSON.stringify(profileData));
        }

        if (photoFile) {
          formData.append('photoUrl', photoFile);
        }

        return {
          url: `/profiles/${userId}`,
          method: 'PATCH',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
      invalidatesTags: ['Profile', 'Profiles'],
    }),

    /**
     * Delete profile by user ID
     */
    deleteProfileByUserId: builder.mutation<{ success: boolean }, string>({
      query: (userId) => ({
        url: `/profiles/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profiles', 'Profile'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useCreateMyProfileMutation,
  useGetMyLocationQuery,
  useUpdateMyLocationMutation,
  useGetAllProfilesQuery,
  useGetProfileByUserIdQuery,
  useUpdateProfileByUserIdMutation,
  useDeleteProfileByUserIdMutation,
} = profileApi;
