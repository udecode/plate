module.exports = {
  extends: [
    'airbnb',
    'plugin:cypress/recommended',
    'plugin:jest/recommended',
    'plugin:mdx/recommended',
    'plugin:promise/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended',
    './config/eslint/bases/prettier.cjs',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  env: {
    browser: true,
    'cypress/globals': true,
    es6: true,
    jest: true,
    node: true,
    webextensions: false,
  },
  plugins: [
    'babel',
    'chai-friendly',
    'cypress',
    'react',
    'react-hooks',
    'promise',
    'jest',
    'simple-import-sort',
    'import',
    'unused-imports',
    'prettier',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules'],
        typescript: {
          alwaysTryTypes: true,
        },
      },
      typescript: {},
    },
    react: { version: 'detect' },
    tailwindcss: {
      callees: ['cn', 'cva'],
    },
  },
  rules: {
    // Tailwind css classnames order
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'error',

    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    '@typescript-eslint/no-unused-vars': 'off',
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

    'class-methods-use-this': 'off',
    'consistent-return': 'off',

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
        ignore: [
          '^@theme',
          '^@docusaurus',
          '^@generated',
          '^@/plate',
          '^@/lib',
        ],
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

    // Test
    'jest/expect-expect': 'off',
    'jest/no-export': 'off',
    'jest/no-identical-title': 'off',
    'jest/no-standalone-expect': 'off',
    'jest/valid-title': 'off',

    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',

    'linebreak-style': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],

    'mdx/no-unescaped-entities': 'off',
    'mdx/no-unused-expressions': 'off',

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

    'prefer-promise-reject-errors': 'off',
    'prefer-regex-literals': 'off',

    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'promise/no-callback-in-promise': 'off',

    'react/no-unknown-property': 'off',
    'react/button-has-type': [
      'error',
      {
        reset: true,
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.ts', '.tsx', 'mdx'] },
    ],
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
    'react/no-unused-prop-types': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
    'react/jsx-pascal-case': 'off',

    'react-hooks/exhaustive-deps': [
      'warn',
      { enableDangerousAutofixThisMayCauseInfiniteLoops: true },
    ],
    'react-hooks/rules-of-hooks': 'error',

    // TS rules
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    // '@typescript-eslint/no-unused-expressions': [
    //   2,
    //   { allowTernary: true, allowShortCircuit: true },
    // ],
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-var-requires': 'off',

    // Disable JS rules
    'babel/no-unused-expressions': 'off',
    'no-shadow': 'off',
    'no-undef': 'off',
    'no-unexpected-multiline': 'off',
    'no-useless-constructor': 'off',

    'default-param-last': 'off',

    // new
    'jest/no-commented-out-tests': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'max-classes-per-file': 'off',
    'default-case': 'off',
    'no-bitwise': 'off',
    'react/jsx-uses-react': 'off',
    'react/no-unescaped-entities': 'off',
    'react/react-in-jsx-scope': 'off',
    camelcase: 'off',
    'no-constant-condition': 'off',
  },
  overrides: [
    {
      files: ['apps/www/src/**/*'],
      extends: [
        'plugin:@next/next/core-web-vitals',
        './config/eslint/bases/prettier.cjs',
      ],
      rules: {
        'import/no-relative-packages': 'off',
        '@dword-design/import-alias/prefer-alias': [
          'warn',
          {
            alias: {
              '@/plate': './apps/www/src/lib/plate',
              '@/components': './apps/www/src/components',
              '@/styles': './apps/www/src/styles',
              '@/lib': './apps/www/src/lib',
            },
          },
        ],
      },
    },
    {
      files: ['**/*.spec.*'],
      extends: [
        'plugin:@dword-design/import-alias/recommended',
        './config/eslint/bases/prettier.cjs',
      ],
      rules: {
        'import/no-relative-packages': 'off',
        '@dword-design/import-alias/prefer-alias': [
          'warn',
          {
            alias: {
              '@/plate': './apps/www/src/lib/plate',
              '@/components': './apps/www/src/components',
              '@/styles': './apps/www/src/styles',
              '@/lib': './apps/www/src/lib',
              '@': './packages',
            },
          },
        ],
      },
    },
    {
      files: ['**/*.test.*', '**/*.spec.*', '**/*.fixture.*'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'no-restricted-imports': [
          'error',
          {
            paths: [],
          },
        ],
      },
    },
    {
      files: '**/*.mdx',
      rules: {
        'prettier/prettier': 'off',
        'simple-import-sort/imports': 'off',
        'import/order': ['error', { 'newlines-between': 'never' }],
      },
    },
  ],
};
