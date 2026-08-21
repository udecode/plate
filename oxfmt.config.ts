import { defineConfig } from 'oxfmt';
import ultracite from 'ultracite/oxfmt';

const projectIgnorePatterns = [
  '.agents/**',
  '.claude/**',
  '.codex/**',
  'AGENTS.md',
  'CLAUDE.md',
  'docs/**',
  'skills/**',
  'templates/**',
  '**/.agents/**',
  '**/.claude/**',
  '**/.codex/**',
  '**/.next*/**',
  '**/.tmp/**',
  '**/.turbo/**',
  '**/__registry__/**',
  '**/build/**',
  '**/coverage/**',
  '**/dist/**',
  '**/docs/**',
  '**/next-env.d.ts',
  '**/node_modules/**',
  '**/public/**',
  '**/skills/**',
  '**/test-results/**',
  '**/tmp/**',
  '**/*otf.json',
  '**/*.html',
  'apps/plite/tests/**/donor/**',
  'apps/www/src/app/(app)/examples/slate/_examples/**',
  'apps/www/src/registry/**/*.schema.json',
  'apps/www/tests/slate-browser/donor/**',
  'benchmarks/slate-v2/donor/**',
  'tooling/plite/donor/**',
  'tooling/slate-v2/donor/**',
];

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    ...projectIgnorePatterns,
  ],
  overrides: [
    ...(ultracite.overrides ?? []),
    {
      files: ['packages/**/src/index.{ts,tsx}'],
      options: {
        sortImports: false,
      },
    },
    {
      files: ['apps/www/src/registry/examples/values/**/*.tsx'],
      options: {
        // TypeScript requires these fixtures' custom JSX pragmas before every
        // import; import sorting otherwise moves an import above the pragma.
        sortImports: false,
      },
    },
  ],
  singleQuote: true,
  sortTailwindcss: {
    stylesheet: 'apps/www/src/app/globals.css',
  },
});
