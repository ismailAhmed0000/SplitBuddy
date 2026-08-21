import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config/env';
import type { User } from '../../types/user';
import { clearCredentials, setCredentials } from '../slices/authSlice';
import type { RootState } from '../index';

type AuthResponse = { user: User; token: string };

type LoginPayload = { email: string; password: string };

type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({ url: '/register', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
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
      transformResponse: (response: { data: User }) => response.data,
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetCurrentUserQuery } = api;
