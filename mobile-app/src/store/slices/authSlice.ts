import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../types/user';

const TOKEN_KEY = 'splitbuddy_token';
const USER_KEY = 'splitbuddy_user';

type AuthState = {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isHydrated: false,
};

/** Reads any previously persisted session so the app can skip the login screen on relaunch. */
export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

  return {
    token,
    user: userJson ? (JSON.parse(userJson) as User) : null,
  };
});

export const setCredentials = createAsyncThunk(
  'auth/setCredentials',
  async (payload: { user: User; token: string }) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, payload.token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(payload.user)),
    ]);

    return payload;
  },
);

export const clearCredentials = createAsyncThunk('auth/clearCredentials', async () => {
  await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userUpdated: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isHydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrated = true;
      })
      .addCase(setCredentials.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(clearCredentials.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { userUpdated } = authSlice.actions;
export default authSlice.reducer;
