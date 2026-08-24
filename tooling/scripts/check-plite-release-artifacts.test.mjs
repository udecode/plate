import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
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
  getPlitePackageBoundaryContracts,
  materializeResolvedDependencyClosure,
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
    readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
  );
  const releaseBuild = rootPackageJson.scripts['plite:packages:build'];

  for (const { directory } of PLITE_RELEASE_PACKAGES) {
    assert.match(releaseBuild, new RegExp(`--filter=\\./${directory}(?: |$)`));
  }
});

test('owns focused packed proof for Plite package boundaries', () => {
  const rootPackageJson = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
  );
  const boundaryContracts = getPlitePackageBoundaryContracts();
  const boundaryBuild = rootPackageJson.scripts['plite:release:boundaries'];

  assert.deepEqual(
    boundaryContracts.map(({ name }) => name),
    [
      '@platejs/plite',
      '@platejs/plite-dom',
      '@platejs/plite-react',
      '@platejs/plite-layout',
      '@platejs/core',
      '@platejs/yjs',
    ]
  );

  for (const { directory } of boundaryContracts) {
    assert.match(boundaryBuild, new RegExp(`--filter=\\./${directory}(?: |$)`));
  }

  assert.match(boundaryBuild, /--package-boundaries-only/);
});

test('proves each Yjs entrypoint in an isolated packed consumer', () => {
  const source = readFileSync(
    new URL('check-plite-release-artifacts.mjs', import.meta.url),
    'utf-8'
  );

  for (const specifier of [
    "specifiers: ['@platejs/yjs']",
    "specifiers: ['@platejs/yjs/react']",
    "specifiers: ['@platejs/yjs/plate']",
  ]) {
    assert.equal(source.includes(specifier), true, specifier);
  }
});

test('materializes an isolated dependency closure and rejects forbidden transitives', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'plite-boundary-fixture-'));
  const sourceNodeModules = join(fixture, 'source', 'node_modules');
  const destinationNodeModules = join(fixture, 'consumer', 'node_modules');

  try {
    for (const [name, manifest] of [
      ['allowed', { dependencies: { forbidden: '1.0.0' }, name: 'allowed' }],
      ['forbidden', { name: 'forbidden' }],
    ]) {
      const directory = join(sourceNodeModules, name);
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(directory, 'package.json'),
        `${JSON.stringify({ version: '1.0.0', ...manifest })}\n`
      );
    }

    assert.throws(
      () =>
        materializeResolvedDependencyClosure({
          destinationNodeModules,
          forbiddenPackages: ['forbidden'],
          requests: [
            { fromDirectory: join(fixture, 'source'), name: 'allowed' },
          ],
        }),
      /forbidden is reachable through the isolated dependency closure/
    );

    writeFileSync(
      join(sourceNodeModules, 'allowed', 'package.json'),
      `${JSON.stringify({ name: 'allowed', version: '1.0.0' })}\n`
    );
    materializeResolvedDependencyClosure({
      destinationNodeModules,
      forbiddenPackages: ['forbidden'],
      requests: [{ fromDirectory: join(fixture, 'source'), name: 'allowed' }],
    });

    assert.equal(
      readFileSync(
        join(destinationNodeModules, 'allowed', 'package.json'),
        'utf-8'
      ),
      `${JSON.stringify({ name: 'allowed', version: '1.0.0' })}\n`
    );
  } finally {
    rmSync(fixture, { force: true, recursive: true });
  }
});

test('nests requested optional peer versions in isolated consumers', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'plite-boundary-versions-'));
  const sourceNodeModules = join(fixture, 'source', 'node_modules');
  const destinationNodeModules = join(fixture, 'consumer', 'node_modules');

  try {
    for (const [directory, manifest] of [
      [
        join(sourceNodeModules, 'parent'),
        {
          name: 'parent',
          peerDependencies: { shared: '2.0.0' },
          peerDependenciesMeta: { shared: { optional: true } },
          version: '1.0.0',
        },
      ],
      [join(sourceNodeModules, 'shared'), { name: 'shared', version: '1.0.0' }],
      [
        join(sourceNodeModules, 'node_modules', 'shared'),
        { name: 'shared', version: '2.0.0' },
      ],
    ]) {
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(directory, 'package.json'),
        `${JSON.stringify(manifest)}\n`
      );
    }

    materializeResolvedDependencyClosure({
      destinationNodeModules,
      forbiddenPackages: [],
      requests: [
        { fromDirectory: join(fixture, 'source'), name: 'shared' },
        { fromDirectory: join(fixture, 'source'), name: 'parent' },
      ],
      requiredOptionalPackages: ['shared'],
    });

    assert.equal(
      JSON.parse(
        readFileSync(
          join(destinationNodeModules, 'shared', 'package.json'),
          'utf-8'
        )
      ).version,
      '1.0.0'
    );
    assert.equal(
      JSON.parse(
        readFileSync(
          join(
            destinationNodeModules,
            'parent',
            'node_modules',
            'shared',
            'package.json'
          ),
          'utf-8'
        )
      ).version,
      '2.0.0'
    );
  } finally {
    rmSync(fixture, { force: true, recursive: true });
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
    'node_modules/@platejs/core/dist/index.d.ts(7,12): error TS2304: Dependency noise.',
    '../../../node_modules/playwright/types.d.ts(4,17): error TS1540: External syntax.',
    '../../../packages/core/dist/index.d.ts(4,15): error TS2834: Linked dependency.',
    'error TS2688: Cannot find type definition file for node.',
  ].join('\n');

  assert.equal(
    filterTypeScriptConsumerDiagnostics(output, consumerDirectory),
    [
      'node_modules/@platejs/yjs/dist/index.d.ts(3,10): error TS2305: Missing export.',
      'node_modules/@platejs/core/dist/index.d.ts(7,12): error TS2304: Dependency noise.',
      'error TS2688: Cannot find type definition file for node.',
    ].join('\n')
  );
  assert.equal(
    filterTypeScriptConsumerDiagnostics(output, consumerDirectory, [
      '@platejs/yjs',
    ]),
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
          runtimeExportNames: ['createEditor'],
          specifier: '@platejs/plite',
          subpath: '.',
        },
      ],
    },
  ]);

  for (const source of [sources.types, sources.runtime]) {
    assert.match(source, /defineEditorSchema/);
    assert.match(source, /createEditor/);
    assert.match(source, /read\.schema\.identity\(\)/);
    assert.match(source, /read\.schema\.create/);
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
    assert.match(source, /defineBasePlugin/);
    assert.match(source, /api: \(\{ store \}\) => \(\{/);
    assert.match(source, /schema: \{/);
    assert.match(source, /key: 'release-artifact-strong'/);
    assert.match(source, /property: releasePlateProperty\.boolean/);
    assert.match(source, /ReleaseParentPlugin/);
    assert.match(source, /releaseHeldPlugin\.store\.set/);
    assert.match(source, /releasePlateIdentityAfter/);
    assert.doesNotMatch(source, /\.extend\(\(\{ store \}\) =>/);
  }

  assert.match(sources.types, /releaseCreatedElementType/);
  assert.match(sources.types, /releaseNestedElementName/);
  assert.doesNotMatch(sources.types, /@ts-expect-error/);
  assert.doesNotMatch(sources.runtime, /@ts-expect-error/);
  assert.match(
    sources.runtime,
    /ReleaseElementPlugin\.initialState\.label, 'draft'/
  );
  assert.match(
    sources.runtime,
    /releaseHeldPlugin\.api\.readConfiguredLabel\(\), 'published'/
  );

  for (const source of [sources.baseline, sources.bare, sources.named]) {
    assert.doesNotMatch(source, /release-consumer-plate-schema/);
  }
});
