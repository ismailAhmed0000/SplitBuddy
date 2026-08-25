import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer, { clearCredentials, hydrateAuth, setCredentials, userUpdated } from '../authSlice';
import type { User } from '../../../types/user';

const testUser: User = {
  id: 1,
  name: 'Alice Tester',
  username: 'alice_tester',
  email: 'alice@example.com',
  phone: null,
  bank_name: null,
  bank_account_number: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function createTestStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

describe('authSlice', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts unhydrated with no session', () => {
    const store = createTestStore();
    expect(store.getState().auth).toEqual({ user: null, token: null, isHydrated: false });
  });

  it('hydrates from an empty AsyncStorage as logged out', async () => {
    const store = createTestStore();
    await store.dispatch(hydrateAuth());
    expect(store.getState().auth).toEqual({ user: null, token: null, isHydrated: true });
  });

  it('persists credentials on setCredentials and rehydrates them later', async () => {
    const store = createTestStore();
    await store.dispatch(setCredentials({ user: testUser, token: 'abc123' }));

    expect(store.getState().auth.token).toBe('abc123');
    expect(store.getState().auth.user).toEqual(testUser);

    const nextStore = createTestStore();
    await nextStore.dispatch(hydrateAuth());
    expect(nextStore.getState().auth.token).toBe('abc123');
    expect(nextStore.getState().auth.user).toEqual(testUser);
  });

  it('clears the persisted session on clearCredentials', async () => {
    const store = createTestStore();
    await store.dispatch(setCredentials({ user: testUser, token: 'abc123' }));
    await store.dispatch(clearCredentials());

    expect(store.getState().auth).toMatchObject({ user: null, token: null });

    const nextStore = createTestStore();
    await nextStore.dispatch(hydrateAuth());
    expect(nextStore.getState().auth.token).toBeNull();
  });

  it('updates the cached user via userUpdated', () => {
    const store = createTestStore();
    store.dispatch(userUpdated(testUser));
    expect(store.getState().auth.user).toEqual(testUser);
  });
});
