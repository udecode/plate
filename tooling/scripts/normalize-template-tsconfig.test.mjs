import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeTemplateTsconfig } from './normalize-template-tsconfig.mjs';

test('normalizes template aliases for TypeScript 7', () => {
  const config = {
    compilerOptions: {
      baseUrl: '.',
      ignoreDeprecations: '6.0',
      paths: {
        '@/*': ['src/*'],
        '@pkg/*': ['./pkg/*'],
        '@upstream/*': ['../upstream/*'],
      },
    },
  };

  assert.deepEqual(normalizeTemplateTsconfig(config), {
    compilerOptions: {
      paths: {
        '@/*': ['./src/*'],
        '@pkg/*': ['./pkg/*'],
        '@upstream/*': ['../upstream/*'],
      },
    },
  });
});
