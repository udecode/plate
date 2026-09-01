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
  assertPlateEntrypointSizes,
  auditPackedPackage,
  collectExternalImports,
  collectPublicExportOptionalPeers,
  createConsumerSources,
  createPackedHeadlessRuntimeProofs,
  createPackedPublicExportPeerProofs,
  filterTypeScriptConsumerDiagnostics,
  getPublicExports,
  getPlitePackageBoundaryContracts,
  getPlateEntrypointSizeSpecifiers,
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
  name: '@fixture/example',
  peerDependencies: {
    platejs: '>=54.0.0',
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
      "import { createEditor } from 'platejs';",
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
    ['plitejs', 'platejs']
  );

  for (const { directory } of boundaryContracts) {
    assert.match(boundaryBuild, new RegExp(`--filter=\\./${directory}(?: |$)`));
  }

  assert.match(boundaryBuild, /--package-boundaries-only/);
});

test('tracks root and every public Plate feature entrypoint bundle size', () => {
  const specifiers = getPlateEntrypointSizeSpecifiers();

  assert.equal(specifiers.length, 29);
  assert.equal(new Set(specifiers).size, specifiers.length);
  assert.equal(specifiers[0], 'platejs');
  assert.ok(specifiers.includes('platejs/media'));
  assert.ok(specifiers.includes('platejs/media/react'));
  assert.ok(specifiers.includes('platejs/resizable/react'));

  assert.doesNotThrow(() =>
    assertPlateEntrypointSizes(
      { platejs: 100, 'platejs/media': 200 },
      { platejs: 100, 'platejs/media': 200 }
    )
  );
  assert.throws(
    () =>
      assertPlateEntrypointSizes(
        { platejs: 101, 'platejs/media': 200 },
        { platejs: 100, 'platejs/media': 200 }
      ),
    /platejs: 100 -> 101 bytes \(\+1\)/
  );
});

test('proves every JavaScript public export in isolated packed consumers', () => {
  const source = readFileSync(
    new URL('check-plite-release-artifacts.mjs', import.meta.url),
    'utf-8'
  );

  assert.match(source, /createPackedPublicExportPeerProofs\(packedPackages\)/);
  assert.match(
    source,
    /for \(const \[index, proof\] of peerProofs\.entries\(\)\)/
  );
});

test('derives exact optional peers from each packed public export graph', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'packed-peer-graph-'));
  const facadeDirectory = join(fixture, 'facade');
  const substrateDirectory = join(fixture, 'substrate');

  try {
    mkdirSync(join(facadeDirectory, 'dist'), { recursive: true });
    mkdirSync(join(substrateDirectory, 'dist'), { recursive: true });
    mkdirSync(join(facadeDirectory, 'dist', 'runtime'), { recursive: true });
    mkdirSync(join(facadeDirectory, 'dist', 'types'), { recursive: true });
    writeFileSync(
      join(facadeDirectory, 'dist', 'index.js'),
      "import './runtime'; import 'substrate/react';\n"
    );
    writeFileSync(
      join(facadeDirectory, 'dist', 'runtime', 'index.js'),
      "import 'runtime-peer';\n"
    );
    writeFileSync(
      join(facadeDirectory, 'dist', 'index.d.ts'),
      "export type {} from './types';\n"
    );
    writeFileSync(
      join(facadeDirectory, 'dist', 'types', 'index.d.ts'),
      "export type {} from 'type-peer';\n"
    );
    writeFileSync(
      join(substrateDirectory, 'dist', 'react.js'),
      "import 'react';\n"
    );
    writeFileSync(join(substrateDirectory, 'dist', 'react.d.ts'), '');

    const facade = {
      packageDirectory: facadeDirectory,
      packageJson: {
        name: 'facade',
        peerDependencies: {
          '@types/runtime-peer': '1.0.0',
          'runtime-peer': '1.0.0',
          'type-peer': '1.0.0',
          unrelated: '1.0.0',
        },
        peerDependenciesMeta: {
          '@types/runtime-peer': { optional: true },
          'runtime-peer': { optional: true },
          'type-peer': { optional: true },
          unrelated: { optional: true },
        },
      },
      publicExports: [
        {
          importTarget: './dist/index.js',
          runtime: 'headless',
          specifier: 'facade',
          subpath: '.',
          typesTarget: './dist/index.d.ts',
        },
      ],
    };
    const substrate = {
      packageDirectory: substrateDirectory,
      packageJson: {
        name: 'substrate',
        peerDependencies: { react: '1.0.0' },
        peerDependenciesMeta: { react: { optional: true } },
      },
      publicExports: [
        {
          importTarget: './dist/react.js',
          runtime: 'client',
          specifier: 'substrate/react',
          subpath: './react',
          typesTarget: './dist/react.d.ts',
        },
      ],
    };

    assert.deepEqual(
      collectPublicExportOptionalPeers({
        packageExport: facade.publicExports[0],
        packedPackage: facade,
        packedPackages: [facade, substrate],
      }),
      ['@types/runtime-peer', 'react', 'runtime-peer', 'type-peer']
    );
  } finally {
    rmSync(fixture, { force: true, recursive: true });
  }
});

test('groups public exports only when their optional peers match', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'packed-peer-groups-'));
  const packageDirectory = join(fixture, 'package');

  try {
    mkdirSync(join(packageDirectory, 'dist'), { recursive: true });
    writeFileSync(join(packageDirectory, 'dist', 'index.js'), '');
    writeFileSync(
      join(packageDirectory, 'dist', 'index.d.ts'),
      "import type {} from 'react';\n"
    );
    writeFileSync(
      join(packageDirectory, 'dist', 'react.js'),
      "import 'react';\n"
    );
    writeFileSync(
      join(packageDirectory, 'dist', 'react.d.ts'),
      "import type {} from 'react';\n"
    );

    const packedPackage = {
      packageDirectory,
      packageJson: {
        name: 'fixture',
        peerDependenciesMeta: {
          react: { optional: true },
          unused: { optional: true },
        },
      },
      publicExports: [
        {
          importTarget: './dist/index.js',
          runtime: 'headless',
          specifier: 'fixture',
          subpath: '.',
          typesTarget: './dist/index.d.ts',
        },
        {
          importTarget: './dist/react.js',
          runtime: 'client',
          specifier: 'fixture/react',
          subpath: './react',
          typesTarget: './dist/react.d.ts',
        },
      ],
    };

    assert.deepEqual(createPackedPublicExportPeerProofs([packedPackage]), [
      {
        declarationPackageNames: ['fixture'],
        forbiddenPackages: ['unused'],
        packageNames: ['fixture'],
        requiredOptionalPackages: ['react'],
        runtime: 'headless',
        specifiers: ['fixture'],
        typePackages: ['@types/node', '@types/react'],
      },
      {
        declarationPackageNames: ['fixture'],
        forbiddenPackages: ['unused'],
        packageNames: ['fixture'],
        requiredOptionalPackages: ['react'],
        runtime: 'client',
        specifiers: ['fixture/react'],
        typePackages: ['@types/node', '@types/react'],
      },
    ]);
    assert.deepEqual(createPackedHeadlessRuntimeProofs([packedPackage]), [
      {
        declarationPackageNames: ['fixture'],
        forbiddenPackages: ['react', 'unused'],
        packageNames: ['fixture'],
        requiredOptionalPackages: [],
        runtime: 'headless',
        runtimeProofs: [null],
        specifiers: ['fixture'],
        typecheck: false,
        typePackages: [],
      },
    ]);
  } finally {
    rmSync(fixture, { force: true, recursive: true });
  }
});

test('proves Plite and Plate cross-subpath runtime identity', () => {
  const source = readFileSync(
    new URL('check-plite-release-artifacts.mjs', import.meta.url),
    'utf-8'
  );

  assert.match(
    source,
    /releaseIdentityEqual\(releaseRoot\.defineExtension, releaseReact\.defineExtension\)/
  );
  assert.match(
    source,
    /releaseLayout\.createPlitePageLayout,[\s\S]*releaseLayoutReact\.createPlitePageLayout/
  );
  assert.match(
    source,
    /releaseReactExtension\.dependencies\[0\],[\s\S]*releaseDOMExtension/
  );
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

test('allows sibling peers only when a required optional peer brings them transitively', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'plite-peer-overlap-fixture-'));
  const sourceNodeModules = join(fixture, 'source', 'node_modules');
  const destinationNodeModules = join(fixture, 'consumer', 'node_modules');

  try {
    for (const [name, manifest] of [
      [
        'required-peer',
        { dependencies: { sibling: '1.0.0' }, name: 'required-peer' },
      ],
      ['sibling', { name: 'sibling' }],
    ]) {
      const directory = join(sourceNodeModules, name);
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(directory, 'package.json'),
        `${JSON.stringify({ version: '1.0.0', ...manifest })}\n`
      );
    }

    assert.deepEqual(
      materializeResolvedDependencyClosure({
        destinationNodeModules,
        forbiddenPackages: ['sibling'],
        requests: [
          {
            allowForbiddenTransitives: true,
            fromDirectory: join(fixture, 'source'),
            name: 'required-peer',
          },
        ],
      }),
      { transitivePeerOverlaps: ['sibling'] }
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
        specifier: '@fixture/example',
        subpath: '.',
        typesTarget: './dist/index.d.ts',
      },
      {
        importTarget: './dist/internal.js',
        specifier: '@fixture/example/internal',
        subpath: './internal',
        typesTarget: './dist/internal.d.ts',
      },
      {
        importTarget: './package.json',
        specifier: '@fixture/example/package.json',
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
      name: '@fixture/generated',
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
    'node_modules/@fixture/optional-peer/dist/index.d.ts(3,10): error TS2305: Missing export.',
    'node_modules/platejs/dist/index.d.ts(7,12): error TS2304: Dependency noise.',
    '../../../node_modules/playwright/types.d.ts(4,17): error TS1540: External syntax.',
    '../../../packages/platejs/dist/index.d.ts(4,15): error TS2834: Linked dependency.',
    'error TS2688: Cannot find type definition file for node.',
  ].join('\n');

  assert.equal(
    filterTypeScriptConsumerDiagnostics(output, consumerDirectory),
    [
      'node_modules/@fixture/optional-peer/dist/index.d.ts(3,10): error TS2305: Missing export.',
      'node_modules/platejs/dist/index.d.ts(7,12): error TS2304: Dependency noise.',
      'error TS2688: Cannot find type definition file for node.',
    ].join('\n')
  );
  assert.equal(
    filterTypeScriptConsumerDiagnostics(output, consumerDirectory, [
      '@fixture/optional-peer',
    ]),
    [
      'node_modules/@fixture/optional-peer/dist/index.d.ts(3,10): error TS2305: Missing export.',
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
      "import './local.js'; import value from 'dependency'; export { x } from 'platejs/react';"
    ),
    ['dependency', 'platejs/react']
  );
});

test('accepts complete artifacts and enforced package directions', () => {
  assert.deepEqual(
    auditPackedPackage({
      allowedPlateRuntime: ['platejs'],
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
    errors.includes('platejs: violates the @fixture/example package direction')
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
          packageExport.subpath === './package.json'
            ? []
            : ['publicValue', 'secondPublicValue'],
      })),
    },
  ]);

  assert.match(sources.types, /@fixture\/example\/internal/);
  assert.match(
    sources.types,
    /import \{ publicValue as packageExport0Runtime0 \} from "@fixture\/example";/
  );
  assert.match(
    sources.types,
    /import \{ secondPublicValue as packageExport0Runtime1 \} from "@fixture\/example";/
  );
  assert.match(sources.types, /with \{ type: 'json' \}/);
  assert.match(sources.runtime, /@fixture\/example\/internal/);
  assert.match(sources.runtime, /with \{ type: 'json' \}/);
  assert.match(sources.bare, /import "@fixture\/example";/);
  assert.match(
    sources.named,
    /import \{ publicValue as unused0 \} from "@fixture\/example";/
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
          specifier: 'plitejs',
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
  assert.match(sources.runtime, /releaseIdentityEqual/);
  assert.match(sources.runtime, /plitejs\/pagination\/react/);

  for (const source of [sources.baseline, sources.bare, sources.named]) {
    assert.doesNotMatch(source, /release-consumer-schema/);
  }
});

test('packs Plate and builds an executable final Plate schema consumer', () => {
  const plateContract = PLITE_RELEASE_PACKAGES.find(
    ({ name }) => name === 'platejs'
  );
  const sources = createConsumerSources([
    {
      publicExports: [
        {
          runtimeExportNames: ['createEditor'],
          specifier: 'platejs',
          subpath: '.',
        },
      ],
    },
  ]);

  assert.deepEqual(plateContract, {
    allowedPlateRuntime: ['plitejs'],
    directory: 'packages/platejs',
    name: 'platejs',
  });
  for (const source of [sources.types, sources.runtime]) {
    assert.match(source, /createEditor/);
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

test('builds a DOM-free SSR consumer from runtime proof metadata', () => {
  const sources = createConsumerSources([
    {
      publicExports: [
        {
          importTarget: './dist/static.js',
          runtime: 'ssr',
          runtimeExportNames: ['renderStaticHtml'],
          runtimeProof: 'plate-static-html',
          specifier: 'platejs/static',
          subpath: './static',
        },
      ],
    },
  ]);

  assert.match(sources.runtime, /platejs\/static/);
  assert.match(sources.ssr, /typeof globalThis\.document/);
  assert.match(sources.ssr, /renderSsrHtml0/);
  assert.match(sources.ssr, /SSR entrypoint 0/);
  assert.deepEqual(sources.runtimeRows, [
    {
      runtime: 'ssr',
      runtimeProof: 'plate-static-html',
      specifier: 'platejs/static',
    },
  ]);
});
