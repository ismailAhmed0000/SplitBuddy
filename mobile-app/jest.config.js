module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest',
    '\\.css$': '<rootDir>/jest/cssMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-async-storage)?|immer|react-redux|@reduxjs|@react-navigation)/)',
  ],
  setupFiles: ['<rootDir>/jest/setup.js'],
};
