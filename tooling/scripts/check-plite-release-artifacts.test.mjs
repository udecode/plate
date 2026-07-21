import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  auditPackedPackage,
  collectExternalImports,
  createConsumerSources,
  filterTypeScriptConsumerDiagnostics,
  getPublicExports,
  parseRuntimeExportNames,
  runTypeScriptConsumer,
} from './check-plite-release-artifacts.mjs';

const packageJson = {
  dependencies: {
    dependency: '^1.0.0',
  },
  exports: {
    '.': {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
    './internal': {
      default: './dist/internal.js',
      import: './dist/internal.js',
      types: './dist/internal.d.ts',
    },
    './package.json': './package.json',
  },
  main: './dist/index.js',
  module: './dist/index.js',
  name: '@platejs/example',
  peerDependencies: {
    '@platejs/plite': '>=54.0.0',
  },
  sideEffects: false,
  type: 'module',
  types: './dist/index.d.ts',
};

const files = [
  { path: 'dist/index.d.ts', source: '' },
  {
    path: 'dist/index.js',
    source: [
      "import { createEditor } from '@platejs/plite';",
      "import dependency from 'dependency';",
      'export { createEditor, dependency };',
    ].join('\n'),
  },
  { path: 'dist/internal.d.ts', source: '' },
  {
    path: 'dist/internal.js',
    source: 'export const internalValue = true;',
  },
  { path: 'package.json', source: '' },
];

test('enumerates every explicit public package subpath', () => {
  assert.deepEqual(
    getPublicExports(packageJson).map(
      ({ importTarget, specifier, subpath, typesTarget }) => ({
        importTarget,
        specifier,
        subpath,
        typesTarget,
      })
    ),
    [
      {
        importTarget: './dist/index.js',
        specifier: '@platejs/example',
        subpath: '.',
        typesTarget: './dist/index.d.ts',
      },
      {
        importTarget: './dist/internal.js',
        specifier: '@platejs/example/internal',
        subpath: './internal',
        typesTarget: './dist/internal.d.ts',
      },
      {
        importTarget: './package.json',
        specifier: '@platejs/example/package.json',
        subpath: './package.json',
        typesTarget: './package.json',
      },
    ]
  );
});

test('derives adjacent declarations from generated string exports', () => {
  assert.deepEqual(
    getPublicExports({
      exports: {
        '.': './dist/index.js',
        './package.json': './package.json',
        './react': './dist/react/index.js',
      },
      name: '@platejs/generated',
    }).map(({ importTarget, typesTarget }) => ({ importTarget, typesTarget })),
    [
      {
        importTarget: './dist/index.js',
        typesTarget: './dist/index.d.ts',
      },
      {
        importTarget: './package.json',
        typesTarget: './package.json',
      },
      {
        importTarget: './dist/react/index.js',
        typesTarget: './dist/react/index.d.ts',
      },
    ]
  );
});

test('keeps packed consumer diagnostics and ignores linked dependency noise', () => {
  const consumerDirectory = '/repo/.tmp/release/consumer';
  const output = [
    'node_modules/@platejs/yjs/dist/index.d.ts(3,10): error TS2305: Missing export.',
    '../../../node_modules/playwright/types.d.ts(4,17): error TS1540: External syntax.',
    '../../../packages/core/dist/index.d.ts(4,15): error TS2834: Linked dependency.',
    'error TS2688: Cannot find type definition file for node.',
  ].join('\n');

  assert.equal(
    filterTypeScriptConsumerDiagnostics(output, consumerDirectory),
    [
      'node_modules/@platejs/yjs/dist/index.d.ts(3,10): error TS2305: Missing export.',
      'error TS2688: Cannot find type definition file for node.',
    ].join('\n')
  );
});

test('rejects a packed declaration that imports a missing Core symbol', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'plite-release-types-'));
  const consumerDirectory = join(root, 'consumer');
  const coreDirectory = join(root, 'core');
  const yjsDirectory = join(
    consumerDirectory,
    'node_modules',
    '@platejs',
    'yjs'
  );

  t.after(() => rmSync(root, { force: true, recursive: true }));
  mkdirSync(coreDirectory, { recursive: true });
  mkdirSync(join(yjsDirectory, 'dist'), { recursive: true });
  writeFileSync(
    join(coreDirectory, 'package.json'),
    JSON.stringify({
      exports: {
        '.': {
          default: './index.js',
          types: './index.d.ts',
        },
      },
      name: '@platejs/core',
      type: 'module',
    })
  );
  writeFileSync(
    join(coreDirectory, 'index.d.ts'),
    'export type Present = true;'
  );
  writeFileSync(join(coreDirectory, 'index.js'), 'export {};');
  symlinkSync(
    coreDirectory,
    join(consumerDirectory, 'node_modules', '@platejs', 'core'),
    'junction'
  );
  writeFileSync(
    join(yjsDirectory, 'package.json'),
    JSON.stringify({
      exports: {
        '.': {
          default: './dist/index.js',
          types: './dist/index.d.ts',
        },
      },
      name: '@platejs/yjs',
      type: 'module',
    })
  );
  writeFileSync(
    join(yjsDirectory, 'dist', 'index.d.ts'),
    [
      "import type { MissingCoreSymbol } from '@platejs/core';",
      'export type Probe = MissingCoreSymbol;',
    ].join('\n')
  );
  writeFileSync(join(yjsDirectory, 'dist', 'index.js'), 'export {};');
  writeFileSync(
    join(consumerDirectory, 'consumer.ts'),
    "import type { Probe } from '@platejs/yjs'; declare const probe: Probe; void probe;"
  );
  writeFileSync(
    join(consumerDirectory, 'package.json'),
    JSON.stringify({ name: 'consumer', type: 'module' })
  );
  writeFileSync(
    join(consumerDirectory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        noEmit: true,
        strict: true,
        types: [],
      },
      files: ['./consumer.ts'],
    })
  );

  assert.throws(
    () => runTypeScriptConsumer(consumerDirectory, 'tsconfig.json'),
    /TS2305: Module .*@platejs\/core.*MissingCoreSymbol/
  );
});

test('extracts runtime named exports and built external imports', () => {
  assert.deepEqual(
    parseRuntimeExportNames(
      'export const direct = 1; export { local, hidden as visible, ignored as default };'
    ),
    ['direct', 'local', 'visible']
  );
  assert.deepEqual(
    collectExternalImports(
      "import './local.js'; import value from 'dependency'; export { x } from '@platejs/plite/internal';"
    ),
    ['@platejs/plite/internal', 'dependency']
  );
});

test('accepts complete artifacts and enforced package directions', () => {
  assert.deepEqual(
    auditPackedPackage({
      allowedPlateRuntime: ['@platejs/plite'],
      files,
      packageJson,
    }),
    []
  );
});

test('rejects missing declarations, undeclared imports, and reversed layers', () => {
  const errors = auditPackedPackage({
    allowedPlateRuntime: [],
    files: files
      .filter(({ path }) => path !== 'dist/internal.d.ts')
      .map((file) =>
        file.path === 'dist/index.js'
          ? {
              ...file,
              source: `${file.source}\nimport 'undeclared-runtime';`,
            }
          : file.path === 'dist/index.d.ts'
            ? {
                ...file,
                source: "export type { PublicType } from './types';",
              }
            : file
      ),
    packageJson,
  });

  assert.ok(
    errors.includes('./internal types: missing packed file dist/internal.d.ts')
  );
  assert.ok(
    errors.includes(
      '@platejs/plite: violates the @platejs/example package direction'
    )
  );
  assert.ok(
    errors.includes(
      'undeclared-runtime: built runtime import is absent from dependencies/peerDependencies'
    )
  );
  assert.ok(
    errors.includes(
      'dist/index.d.ts: relative declaration import ./types needs an explicit runtime extension'
    )
  );
});

test('builds runtime, type, bare, and unused named consumer fixtures', () => {
  const sources = createConsumerSources([
    {
      publicExports: getPublicExports(packageJson).map((packageExport) => ({
        ...packageExport,
        runtimeExportNames:
          packageExport.subpath === './package.json' ? [] : ['publicValue'],
      })),
    },
  ]);

  assert.match(sources.types, /@platejs\/example\/internal/);
  assert.match(sources.types, /with \{ type: 'json' \}/);
  assert.match(sources.runtime, /@platejs\/example\/internal/);
  assert.match(sources.runtime, /with \{ type: 'json' \}/);
  assert.match(sources.bare, /import "@platejs\/example";/);
  assert.match(
    sources.named,
    /import \{ publicValue as unused0 \} from "@platejs\/example";/
  );
  assert.equal(sources.namedImportCount, 2);
  assert.equal(sources.baseline, `${sources.bare.split('\n').at(-2)}\n`);
});
