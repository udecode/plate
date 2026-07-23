import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  assertPackageBuildArtifacts,
  getPackageBuildArtifacts,
} from './check-package-build-artifacts.mjs';

const directPackageDirectories = [
  'browser',
  'core',
  'plite',
  'plite-dom',
  'plite-history',
  'plite-hyperscript',
  'plite-layout',
  'plite-react',
  'udecode/utils',
  'yjs',
];

test('derives runtime and declaration artifacts from public exports', () => {
  assert.deepEqual(
    getPackageBuildArtifacts({
      exports: {
        '.': './dist/index.js',
        './internal': {
          default: './dist/internal/index.js',
          import: './dist/internal/index.js',
          node: './dist/internal/index.cjs',
          types: './dist/internal/index.d.ts',
        },
        './package.json': './package.json',
      },
    }),
    [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/internal/index.js',
      'dist/internal/index.cjs',
      'dist/internal/index.d.ts',
    ]
  );
});

test('rejects public artifacts outside dist', () => {
  assert.throws(
    () =>
      getPackageBuildArtifacts({
        exports: { '.': './src/index.js' },
      }),
    /must live in \.\/dist/u
  );
});

test('asserts every public runtime and declaration artifact', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => rmSync(packageRoot, { force: true, recursive: true }));

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({ exports: { '.': './dist/index.js' } })}\n`
  );
  writeFileSync(path.join(packageRoot, 'dist/index.js'), 'export {};\n');

  assert.throws(
    () => assertPackageBuildArtifacts(packageRoot),
    /dist\/index\.d\.ts/u
  );

  writeFileSync(path.join(packageRoot, 'dist/index.d.ts'), 'export {};\n');
  assert.doesNotThrow(() => assertPackageBuildArtifacts(packageRoot));
});

test('shared package config builds from the invoking package root', async () => {
  const packageRoot = path.resolve(import.meta.dirname, '../../packages/media');
  const repositoryRoot = path.resolve(import.meta.dirname, '../..');
  const previousInitCwd = process.env.INIT_CWD;

  process.env.INIT_CWD = packageRoot;

  try {
    const { default: buildConfig, resolvePlatePackageRoot } = await import(
      `../config/tsdown.config.ts?test=${Date.now()}`
    );
    const resolvedBuildConfig = await buildConfig({});

    assert.equal(
      resolvePlatePackageRoot({
        cwd: packageRoot,
        initCwd: repositoryRoot,
      }),
      packageRoot
    );
    assert.equal(
      resolvePlatePackageRoot({
        cwd: path.join(repositoryRoot, 'tooling/config'),
        initCwd: packageRoot,
      }),
      packageRoot
    );

    for (const config of Array.isArray(resolvedBuildConfig)
      ? resolvedBuildConfig
      : [resolvedBuildConfig]) {
      assert.equal(config.cwd, packageRoot);
      assert.ok(
        config.entry.every((entry) => entry.startsWith(packageRoot)),
        config.entry
      );
    }
  } finally {
    if (previousInitCwd === undefined) {
      delete process.env.INIT_CWD;
    } else {
      process.env.INIT_CWD = previousInitCwd;
    }
  }
});

test('all Plite release packages use one direct tsdown build', async () => {
  for (const packageDirectory of directPackageDirectories) {
    const packageRoot = path.resolve(
      import.meta.dirname,
      `../../packages/${packageDirectory}`
    );
    const previousInitCwd = process.env.INIT_CWD;

    process.env.INIT_CWD = packageRoot;

    const { default: buildConfig } = await import(
      `../../packages/${packageDirectory}/tsdown.config.mts`
    ).finally(() => {
      if (previousInitCwd === undefined) {
        delete process.env.INIT_CWD;
      } else {
        process.env.INIT_CWD = previousInitCwd;
      }
    });
    const resolvedBuildConfig =
      typeof buildConfig === 'function' ? await buildConfig({}) : buildConfig;
    const packageJson = JSON.parse(
      await readFile(
        new URL(
          `../../packages/${packageDirectory}/package.json`,
          import.meta.url
        ),
        'utf8'
      )
    );

    assert.equal(
      packageJson.scripts.build,
      'tsdown --config tsdown.config.mts --log-level warn',
      packageDirectory
    );
    assert.ok(
      getPackageBuildArtifacts(packageJson).length > 0,
      packageDirectory
    );
    for (const config of Array.isArray(resolvedBuildConfig)
      ? resolvedBuildConfig
      : [resolvedBuildConfig]) {
      assert.equal(config.tsconfig, 'tsconfig.build.json', packageDirectory);
    }
  }
});
