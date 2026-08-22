import type { Buddy } from '../../types/models';
import { baseApi, unwrap } from './baseApi';

export const buddiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuddies: builder.query<Buddy[], void>({
      query: () => '/buddies',
      transformResponse: unwrap<Buddy[]>,
      providesTags: (result) =>
        result
          ? [...result.map((b) => ({ type: 'Buddy' as const, id: b.id })), { type: 'Buddy' as const, id: 'LIST' }]
          : [{ type: 'Buddy' as const, id: 'LIST' }],
    }),
    addBuddy: builder.mutation<Buddy, string>({
      query: (username) => ({ url: '/buddies', method: 'POST', body: { username } }),
      transformResponse: unwrap<Buddy>,
      invalidatesTags: [{ type: 'Buddy', id: 'LIST' }],
    }),
    removeBuddy: builder.mutation<void, number>({
      query: (id) => ({ url: `/buddies/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Buddy', id: 'LIST' }],
    }),
  }),
});

export const { useGetBuddiesQuery, useAddBuddyMutation, useRemoveBuddyMutation } = buddiesApi;
