import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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
  name: '@fixture/example',
  peerDependencies: {
    platejs: '>=54.0.0',
  },
  sideEffects: false,
  type: 'module',
  types: './dist/index.d.ts',
};

const runConsumer = (directory, filename, source, nodeArguments = []) => {
  writeFileSync(join(directory, filename), source);

  return spawnSync(process.execPath, [...nodeArguments, filename], {
    cwd: directory,
    encoding: 'utf-8',
  });
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

  assert.equal(specifiers.length, 30);
  assert.equal(new Set(specifiers).size, specifiers.length);
  assert.equal(specifiers[0], 'platejs');
  assert.ok(specifiers.includes('platejs/comments'));
  assert.ok(specifiers.includes('platejs/find'));
  assert.ok(specifiers.includes('platejs/media'));
  assert.ok(specifiers.includes('platejs/media/react'));
  assert.ok(specifiers.includes('platejs/resizable/react'));
  assert.ok(specifiers.includes('platejs/suggestion/react'));
  assert.ok(specifiers.includes('platejs/upload'));
  assert.ok(specifiers.includes('platejs/upload/react'));

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

test('rejects a packed declaration that imports a missing Plate symbol', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'plite-release-types-'));
  const consumerDirectory = join(root, 'consumer');
  const plateDirectory = join(consumerDirectory, 'node_modules', 'platejs');
  const yjsDirectory = join(plateDirectory, 'yjs');

  t.after(() => {
    rmSync(root, { force: true, recursive: true });
  });
  mkdirSync(plateDirectory, { recursive: true });
  mkdirSync(yjsDirectory, { recursive: true });
  mkdirSync(join(consumerDirectory, 'node_modules'), { recursive: true });
  writeFileSync(
    join(plateDirectory, 'package.json'),
    JSON.stringify({
      exports: {
        '.': {
          default: './index.js',
          types: './index.d.ts',
        },
        './yjs': {
          default: './yjs/index.js',
          types: './yjs/index.d.ts',
        },
      },
      name: 'platejs',
      type: 'module',
    })
  );
  writeFileSync(
    join(plateDirectory, 'index.d.ts'),
    'export type Present = true;'
  );
  writeFileSync(join(plateDirectory, 'index.js'), 'export {};');
  writeFileSync(
    join(yjsDirectory, 'index.d.ts'),
    [
      "import type { MissingCoreSymbol } from 'platejs';",
      'export type Probe = MissingCoreSymbol;',
    ].join('\n')
  );
  writeFileSync(join(yjsDirectory, 'index.js'), 'export {};');
  writeFileSync(
    join(consumerDirectory, 'consumer.ts'),
    "import type { Probe } from 'platejs/yjs'; declare const probe: Probe; void probe;"
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

  assert.throws(() => {
    runTypeScriptConsumer(consumerDirectory, 'tsconfig.json');
  }, /TS2305: Module .*platejs.*MissingCoreSymbol/);
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

test('rejects a package that marks stylesheets as side effects', () => {
  assert.ok(
    auditPackedPackage({
      allowedPlateRuntime: ['platejs'],
      files,
      packageJson: { ...packageJson, sideEffects: ['./x.css'] },
    }).includes('package sideEffects must be false')
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

test('runtime, bare and unused named consumers load every packed JavaScript export', () => {
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
  const consumerDirectory = mkdtempSync(
    join(tmpdir(), 'release-consumer-fixture-')
  );
  const packageDirectory = join(
    consumerDirectory,
    'node_modules',
    '@fixture',
    'example'
  );

  try {
    mkdirSync(join(packageDirectory, 'dist'), { recursive: true });
    writeFileSync(
      join(packageDirectory, 'package.json'),
      JSON.stringify(packageJson)
    );
    for (const entry of ['index', 'internal']) {
      writeFileSync(
        join(packageDirectory, 'dist', `${entry}.js`),
        `console.log('loaded ${entry}');\nexport const publicValue = 1;\nexport const secondPublicValue = 2;\n`
      );
    }

    const loaded = Object.fromEntries(
      ['baseline', 'bare', 'named', 'runtime'].map((name) => {
        const { status, stderr, stdout } = runConsumer(
          consumerDirectory,
          `${name}.mjs`,
          sources[name]
        );

        return [
          name,
          status === 0 ? stdout.split('\n').filter(Boolean) : stderr,
        ];
      })
    );

    assert.deepEqual(loaded, {
      bare: ['loaded index', 'loaded internal'],
      baseline: [],
      named: ['loaded index', 'loaded internal'],
      runtime: ['loaded index', 'loaded internal'],
    });
  } finally {
    rmSync(consumerDirectory, { force: true, recursive: true });
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
  const consumerDirectory = mkdtempSync(join(tmpdir(), 'release-ssr-fixture-'));
  const plateDirectory = join(consumerDirectory, 'node_modules', 'platejs');

  try {
    mkdirSync(plateDirectory, { recursive: true });
    writeFileSync(
      join(plateDirectory, 'package.json'),
      JSON.stringify({
        exports: { '.': './index.js', './static': './static.js' },
        name: 'platejs',
        type: 'module',
      })
    );
    writeFileSync(
      join(plateDirectory, 'index.js'),
      'export const BaseParagraphPlugin = {};\nexport const createEditor = ({ initialValue }) => ({ initialValue });\n'
    );
    writeFileSync(
      join(plateDirectory, 'static.js'),
      [
        'export const renderStaticHtml = async ({ initialValue }) => {',
        '  const text = initialValue[0].children[0].text;',
        '  console.log(`rendered ${text}`);',
        '  return { data: `<p>${text}</p>`, diagnostics: [] };',
        '};',
        '',
      ].join('\n')
    );
    writeFileSync(
      join(consumerDirectory, 'dom.mjs'),
      'globalThis.document = {};\n'
    );

    const ssr = runConsumer(consumerDirectory, 'ssr.mjs', sources.ssr);
    const ssrWithDOM = runConsumer(consumerDirectory, 'ssr.mjs', sources.ssr, [
      '--import',
      './dom.mjs',
    ]);

    assert.deepEqual(
      { status: ssr.status, stdout: ssr.stdout },
      { status: 0, stdout: 'rendered SSR entrypoint 0\n' },
      ssr.stderr
    );
    assert.match(
      ssrWithDOM.stderr,
      /actual: 'object',\s+expected: 'undefined'/
    );
    assert.deepEqual(sources.runtimeRows, [
      {
        runtime: 'ssr',
        runtimeProof: 'plate-static-html',
        specifier: 'platejs/static',
      },
    ]);
  } finally {
    rmSync(consumerDirectory, { force: true, recursive: true });
  }
});
