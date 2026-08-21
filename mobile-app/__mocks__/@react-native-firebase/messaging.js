const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  EPHEMERAL: 3,
};

module.exports = {
  AuthorizationStatus,
  getMessaging: jest.fn(() => ({})),
  requestPermission: jest.fn(async () => AuthorizationStatus.AUTHORIZED),
  getToken: jest.fn(async () => 'mock-fcm-token'),
  onTokenRefresh: jest.fn(() => () => {}),
  onMessage: jest.fn(() => () => {}),
  onNotificationOpenedApp: jest.fn(() => () => {}),
  getInitialNotification: jest.fn(async () => null),
  setBackgroundMessageHandler: jest.fn(),
};
