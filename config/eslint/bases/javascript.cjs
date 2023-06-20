module.exports = {
  extends: ['plugin:promise/recommended'],
  plugins: [],
  rules: {
    'babel/no-unused-expressions': 'off',
    camelcase: 'off',
    'class-methods-use-this': 'off',
    'consistent-return': 'off',

    'default-case': 'off',

    'default-param-last': 'off',
    'func-names': 'off',
    'global-require': 'off',
    'linebreak-style': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    'max-classes-per-file': 'off',
    'no-alert': 'off',
    'no-await-in-loop': 'off',
    'no-bitwise': 'off',
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error'],
      },
    ],

    'no-constant-condition': 'off',
    'no-continue': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    // No unused imports
    'no-empty': 'off',
    // No unused variables
    'no-multi-assign': 'off',
    'no-nested-ternary': 'off',
    'no-new': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-prototype-builtins': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-return-assign': 'off', // short
    'no-shadow': 'off', // exceptions
    'no-undef': 'off',
    'no-underscore-dangle': 'off', // short
    'no-unexpected-multiline': 'off', // short
    'no-unused-expressions': 'off', // for..of OK (break)
    'no-unused-vars': 'off', // short
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',

    'prefer-promise-reject-errors': 'off',
    'promise/always-return': 'off',

    'promise/catch-or-return': 'off',
    'promise/no-callback-in-promise': 'off',
    'unused-imports/no-unused-imports': 'warn',

    'unused-imports/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
