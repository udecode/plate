module.exports = {
  extends: '@borealisgroup/eslint-config-ts',
  rules: {
    'no-alert': 'off',
    'import/extensions': [
      'error',
      'never',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
  }
};
