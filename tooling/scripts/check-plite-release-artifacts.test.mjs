import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  auditPackedPackage,
  collectExternalImports,
  createConsumerSources,
  filterTypeScriptConsumerDiagnostics,
  getPublicExports,
  parseRuntimeExportNames,
  PLITE_RELEASE_PACKAGES,
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

test('builds every package before packing its release artifact', () => {
  const rootPackageJson = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
  );
  const releaseBuild = rootPackageJson.scripts['plite:packages:build'];

  for (const { directory } of PLITE_RELEASE_PACKAGES) {
    assert.match(releaseBuild, new RegExp(`--filter=\\./${directory}(?: |$)`));
  }
});

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

test('builds an executable typed Plite schema consumer without changing DCE fixtures', () => {
  const sources = createConsumerSources([
    {
      publicExports: [
        {
          runtimeExportNames: ['createEditorRuntime'],
          specifier: '@platejs/plite',
          subpath: '.',
        },
      ],
    },
  ]);

  for (const source of [sources.types, sources.runtime]) {
    assert.match(source, /defineEditorSchema/);
    assert.match(source, /createEditorRuntime/);
    assert.match(source, /read\.schema\.identity\(\)/);
    assert.match(source, /read\.schema\.createAndFill/);
    assert.match(source, /release-consumer-schema/);
  }

  assert.match(sources.types, /SchemaElementFor/);

  for (const source of [sources.baseline, sources.bare, sources.named]) {
    assert.doesNotMatch(source, /release-consumer-schema/);
  }
});

test('packs Core and builds an executable final Plate schema consumer', () => {
  const coreContract = PLITE_RELEASE_PACKAGES.find(
    ({ name }) => name === '@platejs/core'
  );
  const utilsContract = PLITE_RELEASE_PACKAGES.find(
    ({ name }) => name === '@udecode/utils'
  );
  const sources = createConsumerSources([
    {
      publicExports: [
        {
          runtimeExportNames: ['createBaseEditor'],
          specifier: '@platejs/core',
          subpath: '.',
        },
      ],
    },
  ]);

  assert.deepEqual(coreContract, {
    allowedPlateRuntime: [
      '@platejs/plite',
      '@platejs/plite-dom',
      '@platejs/plite-history',
      '@platejs/plite-hyperscript',
      '@platejs/plite-react',
    ],
    directory: 'packages/core',
    name: '@platejs/core',
  });
  assert.deepEqual(utilsContract, {
    allowedPlateRuntime: [],
    directory: 'packages/udecode/utils',
    name: '@udecode/utils',
  });

  for (const source of [sources.types, sources.runtime]) {
    assert.match(source, /createBaseEditor/);
    assert.match(source, /createBasePlugin/);
    assert.match(source, /schema: \(\{ initialState \}\)/);
    assert.match(source, /mark: releasePlateProperty\.boolean/);
    assert.match(source, /ReleaseParentPlugin/);
    assert.match(source, /releaseHeldPlugin\.store\.set/);
    assert.match(source, /releasePlateIdentityAfter/);
  }

  assert.match(sources.types, /releaseExactElementType/);
  assert.match(sources.types, /releaseNestedElementKey/);
  assert.doesNotMatch(sources.types, /@ts-expect-error/);
  assert.doesNotMatch(sources.runtime, /@ts-expect-error/);
  assert.match(
    sources.runtime,
    /releaseHeldPlugin\.plugin\.initialState\.label, 'draft'/
  );
  assert.match(
    sources.runtime,
    /releaseHeldPlugin\.api\.readConfiguredLabel\(\), 'published'/
  );

  for (const source of [sources.baseline, sources.bare, sources.named]) {
    assert.doesNotMatch(source, /release-consumer-plate-schema/);
  }
});
