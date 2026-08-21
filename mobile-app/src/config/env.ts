import { Platform } from 'react-native';

/**
 * The Android emulator can't reach the host machine via `localhost` (it
 * needs the special `10.0.2.2` alias); the iOS simulator shares the host's
 * network so `localhost` works there. A physical device needs the host
 * machine's LAN IP instead of either — override API_URL for that case.
 */
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_URL = __DEV__ ? `http://${DEV_HOST}:8000/api` : 'https://api.splitbuddy.app/api';
