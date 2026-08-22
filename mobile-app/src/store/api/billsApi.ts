import type { Bill } from '../../types/models';
import { baseApi, unwrap } from './baseApi';

/** The shape `launchImageLibrary`/`launchCamera` hand back for the picked photo. */
export type PickedImage = { uri: string; type: string; name: string };

export const billsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query<Bill[], number | void>({
      query: (groupId) => ({ url: '/bills', params: groupId ? { group_id: groupId } : undefined }),
      transformResponse: unwrap<Bill[]>,
      providesTags: (result) =>
        result
          ? [...result.map((b) => ({ type: 'Bill' as const, id: b.id })), { type: 'Bill' as const, id: 'LIST' }]
          : [{ type: 'Bill' as const, id: 'LIST' }],
    }),
    getBill: builder.query<Bill, number>({
      query: (id) => `/bills/${id}`,
      transformResponse: unwrap<Bill>,
      providesTags: (_result, _error, id) => [{ type: 'Bill', id }],
    }),
    uploadBill: builder.mutation<Bill, { groupId: number; image: PickedImage }>({
      query: ({ groupId, image }) => {
        const formData = new FormData();
        formData.append('group_id', String(groupId));
        formData.append('image', { uri: image.uri, type: image.type, name: image.name } as unknown as Blob);
        return { url: '/bills', method: 'POST', body: formData };
      },
      transformResponse: unwrap<Bill>,
      invalidatesTags: [{ type: 'Bill', id: 'LIST' }],
    }),
    deleteBill: builder.mutation<void, number>({
      query: (id) => ({ url: `/bills/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Bill', id: 'LIST' }],
    }),
    confirmBill: builder.mutation<Bill, number>({
      query: (id) => ({ url: `/bills/${id}`, method: 'PUT', body: { status: 'confirmed' } }),
      transformResponse: unwrap<Bill>,
      invalidatesTags: (result, _error, id) => [
        { type: 'Bill', id },
        { type: 'GroupBalances', id: result?.group_id },
      ],
    }),
    retryExtraction: builder.mutation<Bill, number>({
      query: (id) => ({ url: `/bills/${id}/extract`, method: 'POST' }),
      transformResponse: unwrap<Bill>,
      invalidatesTags: (_result, _error, id) => [{ type: 'Bill', id }],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useGetBillQuery,
  useUploadBillMutation,
  useDeleteBillMutation,
  useConfirmBillMutation,
  useRetryExtractionMutation,
} = billsApi;
