module.exports = {
  extends: ['airbnb', 'plugin:promise/recommended'],
  plugins: ['simple-import-sort', 'import', 'unused-imports'],
  rules: {
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'promise/no-callback-in-promise': 'off',
    'prefer-promise-reject-errors': 'off',

    'babel/no-unused-expressions': 'off',

    'no-use-before-define': 'off',
    'max-classes-per-file': 'off',
    'default-case': 'off',
    'no-bitwise': 'off',
    'no-constant-condition': 'off',
    camelcase: 'off',
    'no-shadow': 'off',
    'no-undef': 'off',
    'no-unexpected-multiline': 'off',
    'no-useless-constructor': 'off',

    'default-param-last': 'off',
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    // No unused imports
    'unused-imports/no-unused-imports': 'warn',
    // No unused variables
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
    'no-alert': 'off',
    'no-continue': 'off',
    'no-multi-assign': 'off',
    'no-await-in-loop': 'off',
    'no-empty': 'off',
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error'],
      },
    ],
    'no-nested-ternary': 'off', // short
    'no-new': 'off', // exceptions
    'no-param-reassign': 'off',
    'no-plusplus': 'off', // short
    'no-prototype-builtins': 'off', // short
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
    ], // for..of OK (break)
    'no-return-assign': 'off', // short
    'no-underscore-dangle': 'off',
    'no-unused-expressions': 'off',

    'linebreak-style': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],

    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    'func-names': 'off',

    // https://github.com/benmosher/eslint-plugin-import/issues/1558
    'import/extensions': [
      'error',
      'never',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
        json: 'always',
        scss: 'always',
      },
    ],
    'import/no-cycle': 'off',
    'import/no-named-as-default': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': [
      'error',
      {
        ignore: ['^@theme', '^@docusaurus', '^@generated', '^@/plate'],
      },
    ],
    'import/prefer-default-export': 'off', // Allow single Named-export
    'import/order': ['off', { 'newlines-between': 'always' }],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          [
            // import "./setup": Side effect imports.
            '^\\u0000',
            // Node.js builtins.`
            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
            // import react from "react": Packages.
            '^react',
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            '^@?\\w',
            // import a from "/a": Absolute imports and other imports.
            // Anything that does not start with a dot.
            '^(assets|components|config|hooks|plugins|store|styled|themes|utils|contexts)(/.*|$)',
            // import a from "./a": Relative imports.
            // Parent imports. Put `..` last.
            '^\\.\\.(?!/?$)',
            '^\\.\\./?$',
            // Other relative imports. Put same-folder imports and `.` last.
            '^\\./(?=.*/)(?!/?$)',
            '^\\.(?!/?$)',
            '^\\./?$',
          ],
        ],
      },
    ],

    'global-require': 'off',
  },
};
