import type { AppNotification } from '../../types/models';
import { baseApi, unwrap } from './baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<AppNotification[], void>({
      query: () => '/notifications',
      transformResponse: unwrap<AppNotification[]>,
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    markNotificationRead: builder.mutation<AppNotification, number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      transformResponse: unwrap<AppNotification>,
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationsApi;
