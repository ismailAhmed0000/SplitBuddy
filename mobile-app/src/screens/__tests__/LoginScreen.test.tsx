import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import authReducer from '../../store/slices/authSlice';
import { api } from '../../store/api/apiSlice';
import LoginScreen from '../LoginScreen';

function createTestStore() {
  return configureStore({
    reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
}

async function renderLoginScreen(navigate = jest.fn()) {
  const store = createTestStore();
  const utils = await render(
    <Provider store={store}>
      <LoginScreen navigation={{ navigate } as never} route={{} as never} />
    </Provider>,
  );
  return { store, navigate, ...utils };
}

describe('LoginScreen', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(
      async () =>
        new Response(
          JSON.stringify({
            user: { id: 1, name: 'Alice', username: 'alice', email: 'alice@example.com', phone: null },
            token: 'test-token',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    ) as unknown as typeof fetch;
  });

  it('disables the submit button until both fields are filled', async () => {
    const { getByText } = await renderLoginScreen();
    expect(getByText('Log in')).toBeDisabled();
  });

  it('lets the user type into the email and password fields', async () => {
    const { getByLabelText } = await renderLoginScreen();
    await fireEvent.changeText(getByLabelText('Email'), 'alice@example.com');
    await fireEvent.changeText(getByLabelText('Password'), 'secret123');

    expect(getByLabelText('Email').props.value).toBe('alice@example.com');
    expect(getByLabelText('Password').props.value).toBe('secret123');
  });

  it('submits credentials and stores the session on success', async () => {
    const { getByLabelText, getByText, store } = await renderLoginScreen();

    await fireEvent.changeText(getByLabelText('Email'), 'alice@example.com');
    await fireEvent.changeText(getByLabelText('Password'), 'secret123');
    await fireEvent.press(getByText('Log in'));

    await waitFor(() => expect(store.getState().auth.token).toBe('test-token'));

    const request = (globalThis.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(request.url).toContain('/login');
    expect(request.method).toBe('POST');
  });

  it('navigates to the register screen', async () => {
    const navigate = jest.fn();
    const { getByText } = await renderLoginScreen(navigate);
    await fireEvent.press(getByText("Don't have an account? Sign up"));
    expect(navigate).toHaveBeenCalledWith('Register');
  });
});
