import { PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

/**
 * `getMessaging()` throws until a real Firebase project is wired up (see
 * README "Push notifications setup") — guard every entry point so the rest
 * of the app keeps working, with push notifications simply staying inert,
 * instead of crashing on boot.
 */
function getMessagingInstance(): ReturnType<typeof getMessaging> | null {
  try {
    return getMessaging();
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const messaging = getMessagingInstance();
  if (!messaging) return false;

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }

  // `requestPermission` is deprecated in favor of a dedicated permissions
  // library (react-native-permissions / expo-notifications), but it still
  // works today and avoids pulling in another native dependency for now.
  const authStatus = await requestPermission(messaging);
  return authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
}

export async function getFcmToken(): Promise<string | null> {
  const messaging = getMessagingInstance();
  if (!messaging) return null;

  try {
    return await getToken(messaging);
  } catch {
    return null;
  }
}

async function ensureAndroidChannel(): Promise<string> {
  return notifee.createChannel({
    id: 'default',
    name: 'General notifications',
    importance: AndroidImportance.HIGH,
  });
}

/**
 * Wires FCM + notifee together so a push actually renders while the app is
 * open (FCM alone stays silent in the foreground) and routes taps back to
 * the caller. Call once — e.g. from the root navigator once auth is ready —
 * and call the returned cleanup function on unmount.
 */
export function setupPushNotifications({
  onTokenRefresh: onTokenRefreshCallback,
  onNotificationOpened,
}: {
  onTokenRefresh?: (token: string) => void;
  onNotificationOpened?: (data: Record<string, unknown> | undefined) => void;
} = {}) {
  const messaging = getMessagingInstance();
  if (!messaging) return () => {};

  const unsubscribeTokenRefresh = onTokenRefresh(messaging, (token) => {
    onTokenRefreshCallback?.(token);
  });

  const unsubscribeForegroundMessage = onMessage(messaging, async (remoteMessage) => {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
      android: {
        channelId: await ensureAndroidChannel(),
        importance: AndroidImportance.HIGH,
      },
    });
  });

  const unsubscribeNotifeeEvent = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      onNotificationOpened?.(detail.notification?.data);
    }
  });

  const unsubscribeNotificationOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage) => {
    onNotificationOpened?.(remoteMessage.data);
  });

  getInitialNotification(messaging).then((remoteMessage) => {
    if (remoteMessage) onNotificationOpened?.(remoteMessage.data);
  });

  return () => {
    unsubscribeTokenRefresh();
    unsubscribeForegroundMessage();
    unsubscribeNotifeeEvent();
    unsubscribeNotificationOpenedApp();
  };
}
