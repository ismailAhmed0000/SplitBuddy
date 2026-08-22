import type { Group, GroupBalance, GroupMember } from '../../types/models';
import { baseApi, unwrap } from './baseApi';

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query<Group[], void>({
      query: () => '/groups',
      transformResponse: unwrap<Group[]>,
      providesTags: (result) =>
        result
          ? [...result.map((g) => ({ type: 'Group' as const, id: g.id })), { type: 'Group' as const, id: 'LIST' }]
          : [{ type: 'Group' as const, id: 'LIST' }],
    }),
    getGroup: builder.query<Group, number>({
      query: (id) => `/groups/${id}`,
      transformResponse: unwrap<Group>,
      providesTags: (_result, _error, id) => [{ type: 'Group', id }],
    }),
    getGroupBalances: builder.query<GroupBalance[], number>({
      query: (id) => `/groups/${id}/balances`,
      transformResponse: unwrap<GroupBalance[]>,
      providesTags: (_result, _error, id) => [{ type: 'GroupBalances', id }],
    }),
    createGroup: builder.mutation<Group, string>({
      query: (name) => ({ url: '/groups', method: 'POST', body: { name } }),
      transformResponse: unwrap<Group>,
      invalidatesTags: [{ type: 'Group', id: 'LIST' }],
    }),
    updateGroup: builder.mutation<Group, { groupId: number; name: string }>({
      query: ({ groupId, name }) => ({ url: `/groups/${groupId}`, method: 'PUT', body: { name } }),
      transformResponse: unwrap<Group>,
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: 'Group', id: groupId },
        { type: 'Group', id: 'LIST' },
      ],
    }),
    deleteGroup: builder.mutation<void, number>({
      query: (id) => ({ url: `/groups/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }],
    }),
    addGroupMember: builder.mutation<GroupMember, { groupId: number; name: string; userId?: number }>({
      query: ({ groupId, name, userId }) => ({
        url: `/groups/${groupId}/members`,
        method: 'POST',
        body: { name, user_id: userId },
      }),
      transformResponse: unwrap<GroupMember>,
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: 'Group', id: groupId },
        { type: 'Group', id: 'LIST' },
      ],
    }),
    removeGroupMember: builder.mutation<void, { groupId: number; memberId: number }>({
      query: ({ groupId, memberId }) => ({ url: `/groups/${groupId}/members/${memberId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: 'Group', id: groupId },
        { type: 'GroupBalances', id: groupId },
        { type: 'Group', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupQuery,
  useGetGroupBalancesQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,
} = groupsApi;
