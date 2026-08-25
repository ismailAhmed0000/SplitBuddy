// This file re-exports the split-up API modules so existing imports
// (`from '../store/api/apiSlice'`) keep working unchanged. Each domain's
// endpoints live in their own file — see authApi.ts, buddiesApi.ts,
// groupsApi.ts, billsApi.ts, assignmentsApi.ts, settlementsApi.ts, and
// notificationsApi.ts — all built on the shared `baseApi` in baseApi.ts.

export { baseApi as api } from './baseApi';

export * from './authApi';
export * from './usersApi';
export * from './buddiesApi';
export * from './groupsApi';
export * from './billsApi';
export * from './assignmentsApi';
export * from './settlementsApi';
export * from './notificationsApi';
