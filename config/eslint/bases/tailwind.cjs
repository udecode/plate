/**
 * Opinionated config base for projects using react.
 *
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */

/**
 * Fine-tune naming convention react typescript jsx (function components)
 *
 * @link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md
 */

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    // @see https://github.com/francoismassart/eslint-plugin-tailwindcss,
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    // Tailwind css classnames order
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'error',
  },
  settings: {
    tailwindcss: {
      callees: ['cn', 'cva', 'withCn', 'className'],
      // cssFiles: [],
    },
  },
  // overrides: [
  //   {
  //     files: [...reactPatterns.files],
  //   },
  // ],
};
