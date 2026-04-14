module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/hooks/**/*.test.ts', '**/__tests__/hooks/**/*.test.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  moduleNameMapper: {
    '^expo/src/winter$': '<rootDir>/__mocks__/expo-winter.js',
    '^expo/src/winter/(.*)$': '<rootDir>/__mocks__/expo-winter.js',
    '^expo/virtual/streams$': '<rootDir>/__mocks__/expo-winter.js',
    '^expo-modules-core/src/polyfill/dangerous-internal$': '<rootDir>/__mocks__/expo-winter.js',
  },
};
