module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  plugins: [
    'react',
  ],
  rules: {
    'no-console': ['error', {
      allow: ['warn', 'error'],
    }],
  },
};
