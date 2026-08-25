import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../types/user';
import { USER_KEY, userUpdated } from '../slices/authSlice';
import { baseApi, unwrap } from './baseApi';

export type UpdateUserPayload = Partial<{
  name: string;
  username: string;
  email: string;
  phone: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
}>;

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<User, { userId: number } & UpdateUserPayload>({
      query: ({ userId, ...body }) => ({ url: `/users/${userId}`, method: 'PUT', body }),
      transformResponse: unwrap<User>,
      invalidatesTags: ['User'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(userUpdated(data));
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
      },
    }),
  }),
});

export const { useUpdateUserMutation } = usersApi;
