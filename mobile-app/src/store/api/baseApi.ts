import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config/env';
import type { RootState } from '../index';

/** Unwraps the Laravel API's `{ data: T }` envelope. */
export function unwrap<T>(response: { data: T }): T {
  return response.data;
}

export const baseApi = createApi({
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
  tagTypes: ['User', 'Group', 'GroupBalances', 'Bill', 'Buddy', 'Settlement', 'Notification'],
  endpoints: () => ({}),
});
