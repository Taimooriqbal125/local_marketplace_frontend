import { baseApi } from '../api/baseApi';
import { Notification } from '@/types';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get current user's notifications
     */
    getNotifications: builder.query<Notification[], void>({
      query: () => ({
        url: '/notifications',
        method: 'GET',
      }),
      providesTags: ['Notifications'],
    }),

    getNotificationById: builder.query<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'GET',
      }),
      providesTags: ['Notifications'],
    }),
    /**
     * Mark all notifications as read
     */
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/notifications/mark-all-as-read/',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    /**
     * Mark single notification as read
     */
    markAsRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'PATCH',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notification = draft.find((n) => n.id === id);
            if (notification) {
              notification.isRead = true;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'Notification', id }, 'Notifications'],
    }),

    /**
     * Delete a notification
     */
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            return draft.filter((n) => n.id !== id);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
