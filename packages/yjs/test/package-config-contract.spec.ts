import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { isRecord } from '../src/core/record';

type JsonRecord = Readonly<Record<string, unknown>>;

type DependencyMap = Readonly<Record<string, string>>;

type PackageExport =
  | {
      readonly default?: string;
      readonly import?: string;
      readonly types?: string;
    }
  | string;

type PackageExports = Readonly<Record<string, PackageExport>>;

type PackageJson = {
  readonly dependencies?: DependencyMap;
  readonly devDependencies?: DependencyMap;
  readonly exports?: PackageExports;
  readonly optionalDependencies?: DependencyMap;
  readonly peerDependencies?: DependencyMap;
  readonly scripts?: DependencyMap;
};

type TsConfigJson = {
  readonly compilerOptions?: {
    readonly paths?: JsonRecord;
  };
};

const readJsonRecord = (path: string): JsonRecord => {
  const value = JSON.parse(
    readFileSync(new URL(path, import.meta.url), 'utf-8')
  );

  if (!isRecord(value)) {
    throw new Error(`${path} must contain a JSON object.`);
  }

  return value;
};

const readOptionalRecord = (
  record: JsonRecord,
  key: string
): JsonRecord | undefined => {
  const value = record[key];

  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error(`${key} must be a JSON object.`);
  }

  return value;
};

const readOptionalString = (
  record: JsonRecord,
  key: string
): string | undefined => {
  const value = record[key];

  if (value === undefined || typeof value === 'string') {
    return value;
  }

  throw new Error(`${key} must be a string.`);
};

const readDependencyMap = (
  record: JsonRecord,
  key: string
): DependencyMap | undefined => {
  const dependencies = readOptionalRecord(record, key);

  if (dependencies === undefined) {
    return undefined;
  }

  const map: Record<string, string> = {};

  for (const [name, version] of Object.entries(dependencies)) {
    if (typeof version !== 'string') {
      throw new Error(`${key}.${name} must be a string.`);
    }

    map[name] = version;
  }

  return map;
};

const readPackageExports = (record: JsonRecord): PackageExports | undefined => {
  const rawExports = readOptionalRecord(record, 'exports');

  if (rawExports === undefined) {
    return undefined;
  }

  const exports: Record<string, PackageExport> = {};

  for (const [key, value] of Object.entries(rawExports)) {
    if (typeof value === 'string') {
      exports[key] = value;
      continue;
    }

    if (!isRecord(value)) {
      throw new Error(`exports.${key} must be a JSON object.`);
    }

    exports[key] = {
      default: readOptionalString(value, 'default'),
      import: readOptionalString(value, 'import'),
      types: readOptionalString(value, 'types'),
    };
  }

  return exports;
};

const readPackageJson = (path: string): PackageJson => {
  const record = readJsonRecord(path);

  return {
    dependencies: readDependencyMap(record, 'dependencies'),
    devDependencies: readDependencyMap(record, 'devDependencies'),
    exports: readPackageExports(record),
    optionalDependencies: readDependencyMap(record, 'optionalDependencies'),
    peerDependencies: readDependencyMap(record, 'peerDependencies'),
    scripts: readDependencyMap(record, 'scripts'),
  };
};

const yjsCollaborationBenchmarkPath =
  '../../../scripts/benchmarks/core/current/yjs-collaboration.mjs';
const benchmarkStatsPath = '../../../scripts/benchmarks/shared/stats.mjs';
const publicYjsDocsPath = '../../../content/docs/plite/libraries/plite-yjs.mdx';
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

const readTsConfigJson = (path: string): TsConfigJson => {
  const record = readJsonRecord(path);
  const compilerOptions = readOptionalRecord(record, 'compilerOptions');
  const paths =
    compilerOptions === undefined
      ? undefined
      : readOptionalRecord(compilerOptions, 'paths');

  return {
    compilerOptions: compilerOptions === undefined ? undefined : { paths },
  };
};

describe('@platejs/yjs package config contract', () => {
  it('uses the public Yjs API compatibility range', () => {
    const rootPackage = readPackageJson('../../../package.json');
    const yjsPackage = readPackageJson('../package.json');

    assert.equal(rootPackage.devDependencies?.yjs, undefined);
    assert.equal(yjsPackage.dependencies?.yjs, undefined);
    assert.equal(yjsPackage.devDependencies?.yjs, '13.6.30');
    assert.equal(yjsPackage.peerDependencies?.yjs, '>=13.6.30');
  });

  it('keeps Plate and React peers optional for root consumers', () => {
    const packageRecord = readJsonRecord('../package.json');
    const peerDependenciesMeta = readOptionalRecord(
      packageRecord,
      'peerDependenciesMeta'
    );
    const yjsPackage = readPackageJson('../package.json');

    assert.equal(yjsPackage.dependencies?.['@platejs/core'], undefined);
    assert.equal(yjsPackage.devDependencies?.['@platejs/core'], 'workspace:^');
    assert.equal(
      yjsPackage.peerDependencies?.['@platejs/core'],
      '>=54.0.0-beta.1'
    );

    for (const dependency of [
      '@platejs/core',
      '@platejs/plite-react',
      'react',
    ]) {
      assert.deepEqual(peerDependenciesMeta?.[dependency], { optional: true });
    }
  });

  it('does not resolve site Yjs imports through package-local node_modules', () => {
    const tsconfig = readTsConfigJson('../../../apps/www/tsconfig.json');
    const yjsAlias = tsconfig.compilerOptions?.paths?.yjs;
    const yjsPlateAlias =
      tsconfig.compilerOptions?.paths?.['@platejs/yjs/plate'];
    const yjsReactAlias =
      tsconfig.compilerOptions?.paths?.['@platejs/yjs/react'];

    assert.equal(yjsAlias, undefined);
    assert.deepEqual(yjsPlateAlias, ['../../packages/yjs/src/plate']);
    assert.deepEqual(yjsReactAlias, ['../../packages/yjs/src/react']);
  });

  it('typechecks Plate adapters against Core source instead of stale build output', () => {
    const tsconfig = readTsConfigJson('../tsconfig.json');
    const paths = tsconfig.compilerOptions?.paths;

    assert.deepEqual(paths?.['@platejs/core'], ['../core/src/index.ts']);
    assert.deepEqual(paths?.['@platejs/core/react'], [
      '../core/src/react/index.ts',
    ]);
  });

  it('keeps provider integrations supplied by applications', () => {
    const yjsPackage = readPackageJson('../package.json');
    const sections = [
      yjsPackage.dependencies,
      yjsPackage.devDependencies,
      yjsPackage.peerDependencies,
      yjsPackage.optionalDependencies,
    ];

    for (const dependencies of sections) {
      assert.equal(dependencies?.['@hocuspocus/provider'], undefined);
      assert.equal(dependencies?.['y-websocket'], undefined);
    }
  });

  it('does not publish archived Yjs soak aliases', () => {
    const rootPackage = readPackageJson('../../../package.json');
    const scripts = rootPackage.scripts ?? {};

    for (const alias of yjsSoakScriptAliases) {
      assert.equal(scripts[alias], undefined);
    }

    for (const script of Object.values(scripts)) {
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
    const pliteApp = readPackageJson('../../../apps/plite/package.json');
    const yjsPackage = readPackageJson('../package.json');

    for (const signal of [
      ...manualYjsSoakRunnerSignals,
      ...yjsSoakScriptAliases,
    ]) {
      assert.equal(docs.includes(signal), false);
    }

    assert.equal(
      yjsPackage.scripts?.test,
      "bun test --preload ../../config/plite-source-test-setup.ts ./src ./test --path-ignore-patterns ''"
    );
    assert.equal(
      pliteApp.scripts?.['test:plite-browser:chromium'],
      'node scripts/run-plite-browser.mjs chromium'
    );
    assert.match(docs, /pnpm --filter @platejs\/yjs test/);
    assert.match(docs, /pnpm --filter plite test:plite-browser:chromium/);
  });

  it('keeps fast checks free of long-running proof gates', () => {
    const rootPackage = readPackageJson('../../../package.json');
    const scripts = rootPackage.scripts ?? {};
    const fastScriptNames = [
      'check',
      'test',
      'plite:test',
      'plite:browser:test',
    ];
    const forbiddenFastCheckFragments = [
      'test:integration',
      'test:integration-local',
      'test:release-proof',
      'test:persistent-soak',
      'test:mobile-device-proof',
      'test:yjs-collaboration-soak',
      'test:yjs-hocuspocus-persistent-room-soak',
      'scripts/proof/',
      'playwright test playwright/integration',
    ];

    for (const scriptName of fastScriptNames) {
      const script = scripts[scriptName];

      assert.equal(typeof script, 'string', `${scriptName} script must exist.`);

      for (const fragment of forbiddenFastCheckFragments) {
        assert.equal(
          script.includes(fragment),
          false,
          `${scriptName} must not include ${fragment}.`
        );
      }
    }

    assert.equal(typeof scripts['plite:browser:test:proof'], 'string');
  });

  it('keeps Yjs collaboration benchmark phase metrics explicit', () => {
    const rootPackage = readPackageJson('../../../package.json');
    const scripts = rootPackage.scripts ?? {};
    const benchmarkUrl = new URL(
      yjsCollaborationBenchmarkPath,
      import.meta.url
    );

    if (!existsSync(benchmarkUrl)) {
      assert.equal(
        scripts['plite:bench:targets:check'],
        'node tooling/scripts/bench-targets.mjs check'
      );
      assert.equal(
        scripts['plite:bench:targets:list'],
        'node tooling/scripts/bench-targets.mjs list'
      );
      assert.equal(
        scripts['plite:bench:targets:run'],
        'node tooling/scripts/bench-targets.mjs run'
      );
      assert.equal(scripts['bench:core:yjs-collaboration:local'], undefined);
      return;
    }

    const benchmarkSource = readFileSync(benchmarkUrl, 'utf-8');
    const requiredMetricNames = [
      'yjs_collaboration_worst_p95_ms',
      'yjs_collaboration_worst_work_p95_ms',
      'yjs_collaboration_worst_verification_p95_ms',
      'yjs_large_doc_local_edit_p95_ms',
      'yjs_large_doc_remote_apply_p95_ms',
      'yjs_large_doc_remote_encode_p95_ms',
      'yjs_large_doc_remote_sync_p95_ms',
      'yjs_correctness_failures',
    ];

    assert.equal(
      scripts['bench:core:yjs-collaboration:local'],
      'bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs'
    );

    for (const metricName of requiredMetricNames) {
      assert.match(benchmarkSource, new RegExp(`\\b${metricName}:`));
    }

    assert.match(benchmarkSource, /phaseLanes:\s*\{/);
    assert.match(
      benchmarkSource,
      /for \(const \[name, value\] of Object\.entries\(metrics\)\)/
    );
    assert.match(benchmarkSource, /METRIC \$\{name\}=\$\{value\}/);
  });

  it('keeps Yjs benchmark artifacts diagnostic enough for perf decisions', () => {
    const benchmarkUrl = new URL(
      yjsCollaborationBenchmarkPath,
      import.meta.url
    );
    const statsUrl = new URL(benchmarkStatsPath, import.meta.url);

    if (!existsSync(benchmarkUrl) || !existsSync(statsUrl)) {
      const rootPackage = readPackageJson('../../../package.json');
      const scripts = rootPackage.scripts ?? {};

      assert.equal(typeof scripts['plite:bench:targets:check'], 'string');
      assert.equal(typeof scripts['plite:bench:targets:run'], 'string');
      return;
    }

    const benchmarkSource = readFileSync(benchmarkUrl, 'utf-8');
    const statsSource = readFileSync(statsUrl, 'utf-8');
    const requiredSummaryFields = [
      'samples',
      'mean',
      'median',
      'p75',
      'p95',
      'p99',
      'min',
      'max',
    ];

    for (const field of requiredSummaryFields) {
      assert.match(statsSource, new RegExp(`\\b${field}:`));
    }

    assert.match(benchmarkSource, /artifactVersion:\s*1/);
    assert.match(benchmarkSource, /thresholdPolicy:\s*\{/);
    assert.match(benchmarkSource, /releaseGate:\s*false/);
    assert.match(benchmarkSource, /repeatRunsRequiredBeforeEnforcement:\s*3/);
    assert.match(
      benchmarkSource,
      /tmp\/plite-yjs-collaboration-benchmark\.json/
    );
  });

  it('keeps package exports aligned with built entrypoints', () => {
    const yjsPackage = readPackageJson('../package.json');

    assert.deepEqual(Object.keys(yjsPackage.exports ?? {}).sort(), [
      '.',
      './package.json',
      './plate',
      './react',
    ]);
    assert.deepEqual(yjsPackage.exports?.['.'], {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    });
    assert.deepEqual(yjsPackage.exports?.['./plate'], {
      default: './dist/plate/index.js',
      import: './dist/plate/index.js',
      types: './dist/plate/index.d.ts',
    });
    assert.deepEqual(yjsPackage.exports?.['./react'], {
      default: './dist/react/index.js',
      import: './dist/react/index.js',
      types: './dist/react/index.d.ts',
    });
    assert.equal(yjsPackage.exports?.['./package.json'], './package.json');
  });
});
