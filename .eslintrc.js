module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  plugins: [
    'react',
  ],
  rules: {
    'no-console': ['error', {
      allow: ['log', 'warn', 'error'],
    }],
  },
};
