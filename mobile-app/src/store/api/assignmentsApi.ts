import type { Assignment, ShareType } from '../../types/models';
import { baseApi, unwrap } from './baseApi';

export const assignmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation<
      Assignment,
      { billId: number; itemId: number; groupMemberId: number; shareType?: ShareType }
    >({
      query: ({ itemId, groupMemberId, shareType = 'equal' }) => ({
        url: `/items/${itemId}/assignments`,
        method: 'POST',
        body: { group_member_id: groupMemberId, share_type: shareType },
      }),
      transformResponse: unwrap<Assignment>,
      invalidatesTags: (_result, _error, { billId }) => [{ type: 'Bill', id: billId }],
    }),
    deleteAssignment: builder.mutation<void, { billId: number; assignmentId: number }>({
      query: ({ assignmentId }) => ({ url: `/assignments/${assignmentId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { billId }) => [{ type: 'Bill', id: billId }],
    }),
  }),
});

export const { useCreateAssignmentMutation, useDeleteAssignmentMutation } = assignmentsApi;
