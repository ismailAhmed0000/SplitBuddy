import type { User } from '../../types/user';
import type { UserBalances } from '../../types/models';
import { clearCredentials, setCredentials } from '../slices/authSlice';
import { baseApi, unwrap } from './baseApi';

type AuthResponse = { user: User; token: string };

type LoginPayload = { email: string; password: string };

type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
      invalidatesTags: ['User'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({ url: '/register', method: 'POST', body }),
      invalidatesTags: ['User'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
      invalidatesTags: ['User'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
        }
      },
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/user',
      transformResponse: unwrap<User>,
      providesTags: ['User'],
    }),
    searchUsers: builder.query<User[], string>({
      query: (q) => ({ url: '/users/search', params: { q } }),
      transformResponse: unwrap<User[]>,
    }),
    getUserBalances: builder.query<UserBalances, number>({
      query: (userId) => `/users/${userId}/balances`,
      transformResponse: unwrap<UserBalances>,
      providesTags: ['GroupBalances'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useSearchUsersQuery,
  useGetUserBalancesQuery,
} = authApi;
