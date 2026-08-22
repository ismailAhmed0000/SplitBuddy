import type { Settlement } from '../../types/models';
import { baseApi, unwrap } from './baseApi';

export const settlementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettlements: builder.query<Settlement[], number>({
      query: (groupId) => ({ url: '/settlements', params: { group_id: groupId } }),
      transformResponse: unwrap<Settlement[]>,
      providesTags: (_result, _error, groupId) => [{ type: 'Settlement', id: groupId }],
    }),
    createSettlement: builder.mutation<
      Settlement,
      { groupId: number; paidBy: number; paidTo: number; amount: number; note?: string }
    >({
      query: ({ groupId, paidBy, paidTo, amount, note }) => ({
        url: '/settlements',
        method: 'POST',
        body: { group_id: groupId, paid_by: paidBy, paid_to: paidTo, amount, note },
      }),
      transformResponse: unwrap<Settlement>,
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: 'Settlement', id: groupId },
        { type: 'GroupBalances', id: groupId },
      ],
    }),
  }),
});

export const { useGetSettlementsQuery, useCreateSettlementMutation } = settlementsApi;
