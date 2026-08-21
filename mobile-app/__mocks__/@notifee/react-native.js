const notifee = {
  createChannel: jest.fn(async () => 'default'),
  displayNotification: jest.fn(async () => {}),
  onForegroundEvent: jest.fn(() => () => {}),
  onBackgroundEvent: jest.fn(() => {}),
};

const AndroidImportance = { NONE: 0, MIN: 1, LOW: 2, DEFAULT: 3, HIGH: 4 };
const EventType = { UNKNOWN: -1, DISMISSED: 0, PRESS: 1, ACTION_PRESS: 3 };

module.exports = notifee;
module.exports.default = notifee;
module.exports.AndroidImportance = AndroidImportance;
module.exports.EventType = EventType;
