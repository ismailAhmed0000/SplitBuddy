/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Must be registered before the app renders, and outside the React tree,
// per @react-native-firebase/messaging's requirements — this is what lets a
// data-only push be handled while the app is backgrounded or killed.
setBackgroundMessageHandler(getMessaging(), async () => {
  // Notification-type pushes are displayed by the OS automatically; handle
  // data-only pushes here (e.g. syncing state) once the backend sends them.
});

AppRegistry.registerComponent(appName, () => App);
