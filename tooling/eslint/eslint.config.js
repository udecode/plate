import { configs, defineConfig } from '@app/eslint';

export default defineConfig(
  ...configs.base,
  ...configs.prettier,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
