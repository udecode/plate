/**
 * Opinionated config base for projects using playwright.
 *
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */

const playwrightPatterns = {
  files: ['**/e2e/**/*.test.{js,ts}'],
};

export default {
  overrides: [
    {
      // @see https://github.com/playwright-community/eslint-plugin-playwright
      extends: ['plugin:playwright/recommended'],
      // To ensure best performance enable only on e2e test files
      files: playwrightPatterns.files,
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        // '@typescript-eslint/no-object-literal-type-assertion': 'off',
      },
    },
  ],
};
