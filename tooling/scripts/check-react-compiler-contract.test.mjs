import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditReactCompilerTextContract,
  auditRegistryReactSource,
} from './check-react-compiler-contract.mjs';

const registryFile = 'apps/www/src/registry/ui/example.tsx';

test('rejects every React memo import and alias shape in copied registry code', () => {
  const issues = auditRegistryReactSource(
    `
      import ReactDefault, { memo as namedMemo } from 'react';
      import * as ReactNamespace from 'react';
      const ReactAlias = ReactNamespace;
      const memoAlias = ReactDefault.memo;
      export const A = ReactDefault.memo(() => null);
      export const B = ReactNamespace['memo'](() => null);
      export const C = ReactAlias.memo(() => null);
      export const D = namedMemo(() => null);
      export const E = memoAlias(() => null);
    `,
    registryFile
  );

  assert.equal(issues.length, 5);
  assert.ok(issues.every((issue) => /manual memoization/.test(issue.reason)));
});

test('rejects displayName assignments and accepts named registry functions', () => {
  assert.equal(
    auditRegistryReactSource(
      `const Example = () => null; Example.displayName = 'Example';`,
      registryFile
    ).length,
    1
  );
  assert.deepEqual(
    auditRegistryReactSource(
      `export function Example() { return null }`,
      registryFile
    ),
    []
  );
});

test('does not treat unrelated memo helpers or non-registry files as React memo', () => {
  assert.deepEqual(
    auditRegistryReactSource(
      `const memo = (value) => value; export const value = memo(1);`,
      registryFile
    ),
    []
  );
  assert.deepEqual(
    auditRegistryReactSource(
      `import { memo } from 'react'; export const A = memo(() => null);`,
      'packages/example/src/example.tsx'
    ),
    []
  );
});

test('accepts the complete React 19 compiler, manifest, lockfile, and app contract', () => {
  const issues = auditReactCompilerTextContract({
    appConfigs: [
      {
        file: 'apps/example/next.config.ts',
        name: 'example',
        source: `
          export default {
            experimental: { turbopackRustReactCompiler: true },
            reactCompiler: true,
            typedRoutes: true,
            turbopack: { root: repoRoot },
          };
        `,
      },
    ],
    compilerConfig: {
      file: 'tooling/config/tsdown.config.ts',
      source: `plugins: [['babel-plugin-react-compiler', { target: '19' }]]`,
    },
    lintConfig: {
      file: 'oxlint.config.ts',
      source: `
        export default {
          overrides: [{
            files: ['packages/plitejs/test/react/render-probes/**/*.{ts,tsx}'],
            rules: { 'react/immutability': 'off' },
          }],
          rules: {
            'react/display-name': 'error',
            'react/immutability': 'error',
            'react/preserve-manual-memoization': 'error',
            'react/refs': 'error',
            'react/set-state-in-effect': 'error',
            'react/use-memo': 'error',
            'react-doctor/react-compiler-no-manual-memoization': 'off',
          },
        };
      `,
    },
    lockfile: { file: 'pnpm-lock.yaml', source: 'lockfileVersion: 9' },
    manifests: [
      {
        file: 'package.json',
        source: JSON.stringify({
          devDependencies: { react: '19.2.8', 'react-dom': '19.2.8' },
        }),
      },
    ],
  });

  assert.deepEqual(issues, []);
});

test('rejects broad or additional Compiler rule exemptions', () => {
  const issues = auditReactCompilerTextContract({
    appConfigs: [],
    compilerConfig: {
      file: 'tooling/config/tsdown.config.ts',
      source: `plugins: [['babel-plugin-react-compiler', { target: '19' }]]`,
    },
    lintConfig: {
      file: 'oxlint.config.ts',
      source: `
        export default {
          overrides: [{
            files: ['**/test/**'],
            rules: {
              'react/immutability': 'off',
              'react/refs': 'off',
            },
          }],
          rules: {
            'react/display-name': 'error',
            'react/immutability': 'error',
            'react/preserve-manual-memoization': 'error',
            'react/refs': 'error',
            'react/set-state-in-effect': 'error',
            'react/use-memo': 'error',
            'react-doctor/react-compiler-no-manual-memoization': 'off',
          },
        };
      `,
    },
    lockfile: { file: 'pnpm-lock.yaml', source: 'lockfileVersion: 9' },
    manifests: [],
  });

  assert.equal(issues.length, 2);
  assert.ok(issues.every((issue) => issue.file === 'oxlint.config.ts'));
});

test('rejects React 18 compilation, runtime shims, stale exact React, and incomplete apps', () => {
  const issues = auditReactCompilerTextContract({
    appConfigs: [
      {
        file: 'apps/example/next.config.ts',
        name: 'example',
        source: `export default { reactCompiler: true };`,
      },
    ],
    compilerConfig: {
      file: 'tooling/config/tsdown.config.ts',
      source: `plugins: [['babel-plugin-react-compiler', { target: '18' }]]`,
    },
    lockfile: {
      file: 'pnpm-lock.yaml',
      source: 'react-compiler-runtime: 1.0.0',
    },
    manifests: [
      {
        file: 'package.json',
        source: JSON.stringify({
          dependencies: { 'react-compiler-runtime': '1.0.0' },
          devDependencies: { react: '19.2.4', 'react-dom': '19.2.4' },
        }),
      },
    ],
  });

  assert.equal(issues.length, 8);
  assert.match(issues[0].reason, /React 19 runtime/);
});
