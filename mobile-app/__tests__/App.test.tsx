/**
 * @format
 */

import { render } from '@testing-library/react-native';
import App from '../App';

test('renders the login screen once the (empty) session finishes hydrating', async () => {
  const { findByText } = await render(<App />);

  expect(await findByText('Welcome back')).toBeTruthy();
});
