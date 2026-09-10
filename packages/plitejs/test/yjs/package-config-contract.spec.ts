import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  exports?: Record<string, unknown>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  scripts?: Record<string, string>;
};

type TypeScriptConfig = {
  compilerOptions: {
    paths: Record<string, string[]>;
  };
};

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf-8')) as T;

const rootPackagePath = '../../../../package.json';
const platePackagePath = '../../../platejs/package.json';
const plitePackagePath = '../../package.json';
const publicYjsDocsPath =
  '../../../../content/docs/plite/libraries/plite-yjs.mdx';
const yjsCollaborationBenchmarkPath =
  '../../../../benchmarks/slate-v2/donor/core/current/yjs-collaboration.mjs';
const benchmarkStatsPath =
  '../../../../benchmarks/slate-v2/donor/core/shared/stats.mjs';
const manualYjsSoakRunnerSignals = [
  'scripts/proof/yjs-collaboration-soak.mjs',
  'scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs',
  'scripts/proof/persistent-browser-soak.mjs',
  'scripts/proof/yjs-hocuspocus-production-soak.mjs',
];
const yjsSoakScriptAliases = [
  'test:yjs-collaboration-soak',
  'test:yjs-hocuspocus-persistent-room-soak',
  'test:persistent-soak',
  'test:yjs-hocuspocus-production-soak',
];

describe('plitejs/yjs package config contract', () => {
  it('keeps Yjs opt-in and supplied by its consumers', () => {
    const rootPackage = readJson<PackageManifest>(rootPackagePath);
    assert.equal(rootPackage.devDependencies?.yjs, undefined);
    for (const path of [plitePackagePath, platePackagePath]) {
      const manifest = readJson<PackageManifest>(path);

      assert.equal(manifest.dependencies?.yjs, undefined);
      assert.equal(manifest.devDependencies?.yjs, '13.6.30');
    }
    const plitePackage = readJson<PackageManifest>(plitePackagePath);
    const platePackage = readJson<PackageManifest>(platePackagePath);

    assert.equal(plitePackage.peerDependencies?.yjs, '>=13.6.30');
    assert.deepEqual(plitePackage.peerDependenciesMeta?.yjs, {
      optional: true,
    });
    assert.equal(platePackage.peerDependencies?.yjs, undefined);
    assert.equal(platePackage.peerDependenciesMeta?.yjs, undefined);
  });

  it('keeps provider integrations supplied by applications', () => {
    for (const path of [plitePackagePath, platePackagePath]) {
      const manifest = readJson<PackageManifest>(path);

      for (const section of [
        manifest.dependencies,
        manifest.devDependencies,
        manifest.peerDependencies,
        manifest.optionalDependencies,
      ]) {
        assert.equal(section?.['@hocuspocus/provider'], undefined);
        assert.equal(section?.['y-websocket'], undefined);
      }
    }
  });

  it('resolves application and package entrypoints directly to source', () => {
    const site = readJson<TypeScriptConfig>(
      '../../../../apps/www/tsconfig.json'
    );
    const plate = readJson<TypeScriptConfig>('../../../platejs/tsconfig.json');
    const plite = readJson<TypeScriptConfig>('../../tsconfig.json');

    assert.deepEqual(site.compilerOptions.paths['platejs/yjs'], [
      '../../packages/platejs/src/yjs/index.tsx',
    ]);
    assert.deepEqual(site.compilerOptions.paths['platejs/yjs/react'], [
      '../../packages/platejs/src/yjs/react/index.tsx',
    ]);
    assert.deepEqual(plate.compilerOptions.paths['platejs/yjs'], [
      './src/yjs/index.tsx',
    ]);
    assert.deepEqual(plate.compilerOptions.paths['platejs/yjs/react'], [
      './src/yjs/react/index.tsx',
    ]);
    for (const suffix of ['', '/react']) {
      assert.deepEqual(plate.compilerOptions.paths[`plitejs/yjs${suffix}`], [
        `../plitejs/src/yjs${suffix}/index.ts`,
      ]);
      assert.deepEqual(plite.compilerOptions.paths[`plitejs/yjs${suffix}`], [
        `./src/yjs${suffix}/index.ts`,
      ]);
    }
  });

  it('publishes only the current Yjs entrypoints', () => {
    for (const path of [plitePackagePath, platePackagePath]) {
      const { exports } = readJson<PackageManifest>(path);

      assert.ok(exports);

      assert.deepEqual(exports['./yjs'], {
        default: './dist/yjs/index.js',
        import: './dist/yjs/index.js',
        types: './dist/yjs/index.d.ts',
      });
      assert.deepEqual(exports['./yjs/react'], {
        default: './dist/yjs/react/index.js',
        import: './dist/yjs/react/index.js',
        types: './dist/yjs/react/index.d.ts',
      });
      assert.equal(exports['./yjs/plate'], undefined);
    }
  });

  it('does not publish archived Yjs soak aliases', () => {
    const scripts = readJson<PackageManifest>(rootPackagePath).scripts ?? {};

    for (const alias of yjsSoakScriptAliases) {
      assert.equal(scripts[alias], undefined);
    }
    for (const script of Object.values<string>(scripts)) {
      for (const signal of manualYjsSoakRunnerSignals) {
        assert.equal(script.includes(signal), false);
      }
    }
  });

  it('documents only executable Yjs proof owners', () => {
    const docs = readFileSync(
      new URL(publicYjsDocsPath, import.meta.url),
      'utf-8'
    );
    const pliteApp = readJson<PackageManifest>(
      '../../../../apps/plite/package.json'
    );

    for (const signal of [
      ...manualYjsSoakRunnerSignals,
      ...yjsSoakScriptAliases,
    ]) {
      assert.equal(docs.includes(signal), false);
    }

    for (const [name, path] of [
      ['plitejs', plitePackagePath],
      ['platejs', platePackagePath],
    ]) {
      assert.equal(
        readJson<PackageManifest>(path).scripts?.['test:partition:yjs'],
        `node ../../tooling/scripts/run-entrypoint-task.mjs test ${name} yjs`
      );
    }
    assert.equal(
      pliteApp.scripts?.['test:plite-browser:chromium'],
      'node scripts/run-plite-browser.mjs chromium'
    );
    assert.match(docs, /pnpm --filter plitejs test:partition:yjs/);
    assert.match(docs, /pnpm --filter plite test:plite-browser:chromium/);
  });

  it('keeps fast checks free of long-running proof gates', () => {
    const scripts = readJson<PackageManifest>(rootPackagePath).scripts ?? {};
    const forbidden = [
      'test:integration',
      'test:release-proof',
      'test:persistent-soak',
      'test:mobile-device-proof',
      'test:yjs-collaboration-soak',
      'scripts/proof/',
      'playwright test playwright/integration',
    ];

    for (const scriptName of ['check', 'test', 'plite:test']) {
      const script = scripts[scriptName];

      assert.equal(typeof script, 'string', `${scriptName} script must exist.`);
      for (const fragment of forbidden) {
        assert.equal(script?.includes(fragment), false);
      }
    }
  });

  it('keeps Yjs collaboration benchmark phase metrics explicit', () => {
    const scripts = readJson<PackageManifest>(rootPackagePath).scripts ?? {};
    const benchmarkUrl = new URL(
      yjsCollaborationBenchmarkPath,
      import.meta.url
    );

    if (!existsSync(benchmarkUrl)) {
      assert.equal(typeof scripts['plite:bench:targets:check'], 'string');
      assert.equal(typeof scripts['plite:bench:targets:run'], 'string');
      return;
    }

    const source = readFileSync(benchmarkUrl, 'utf-8');
    const metrics = [
      'yjs_collaboration_worst_p95_ms',
      'yjs_collaboration_worst_work_p95_ms',
      'yjs_collaboration_worst_verification_p95_ms',
      'yjs_large_doc_local_edit_p95_ms',
      'yjs_large_doc_remote_apply_p95_ms',
      'yjs_large_doc_remote_encode_p95_ms',
      'yjs_large_doc_remote_sync_p95_ms',
      'yjs_correctness_failures',
    ];

    for (const metric of metrics) {
      assert.match(source, new RegExp(`\\b${metric}:`));
    }
    assert.match(source, /phaseLanes:\s*\{/);
    assert.match(source, /METRIC \$\{name\}=\$\{value\}/);
  });

  it('keeps Yjs benchmark artifacts diagnostic enough for decisions', () => {
    const benchmarkUrl = new URL(
      yjsCollaborationBenchmarkPath,
      import.meta.url
    );
    const statsUrl = new URL(benchmarkStatsPath, import.meta.url);

    if (!existsSync(benchmarkUrl) || !existsSync(statsUrl)) return;

    const benchmark = readFileSync(benchmarkUrl, 'utf-8');
    const stats = readFileSync(statsUrl, 'utf-8');

    for (const field of [
      'samples',
      'mean',
      'median',
      'p75',
      'p95',
      'p99',
      'min',
      'max',
    ]) {
      assert.match(stats, new RegExp(`\\b${field}:`));
    }
    assert.match(benchmark, /artifactVersion:\s*1/);
    assert.match(benchmark, /releaseGate:\s*false/);
    assert.match(benchmark, /repeatRunsRequiredBeforeEnforcement:\s*3/);
  });
});
