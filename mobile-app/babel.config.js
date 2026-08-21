module.exports = {
  presets: ['module:@react-native/babel-preset'],
  overrides: [
    {
      // Only our own source needs the className->style JSX transform;
      // applying it to node_modules (pulled in here just so Jest can
      // transpile their ESM builds) triggers nativewind's "doctor" check
      // injection, which breaks packages that don't expect it.
      exclude: /node_modules/,
      presets: ['nativewind/babel'],
    },
  ],
};
