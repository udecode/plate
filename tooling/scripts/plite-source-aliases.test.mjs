import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';
import { plitePackages, repoRoot } from './check-plite.mjs';

const require = createRequire(import.meta.url);
const {
  createBunTestArgs,
} = require('../../packages/plate-scripts/bun-test-args.cjs');

test('workspace source entries cover every public runtime entry exactly once', () => {
  const entries = getWorkspaceSourceEntries(repoRoot);
  const specifiers = new Set(entries.map(({ specifier }) => specifier));
  const distEntries = new Set(entries.map(({ distEntry }) => distEntry));

  assert.equal(specifiers.size, entries.length);
  assert.equal(distEntries.size, entries.length);

  for (const { sourceEntry } of entries) {
    assert.equal(existsSync(sourceEntry), true, sourceEntry);
    assert.match(sourceEntry, /[/\\]src[/\\]/);
  }

  for (const specifier of [
    '@platejs/core/react',
    '@platejs/plite/internal',
    '@platejs/yjs/core',
    'platejs/react',
  ]) {
    assert.equal(specifiers.has(specifier), true, specifier);
  }
});

test('www maps every Plite public runtime entry to its exact source file', () => {
  const appRoot = path.join(repoRoot, 'apps/www');
  const appConfig = JSON.parse(
    readFileSync(path.join(appRoot, 'tsconfig.json'), 'utf-8')
  );
  const { paths } = appConfig.compilerOptions;

  for (const { sourceEntry, specifier } of getWorkspaceSourceEntries(
    repoRoot
  ).filter(({ specifier: innerSpecifier }) =>
    innerSpecifier.startsWith('@platejs/plite')
  )) {
    assert.deepEqual(paths[specifier], [
      path.relative(appRoot, sourceEntry).replaceAll(path.sep, '/'),
    ]);
  }
});

test('Plite CI runs the repository Bun version', () => {
  const rootManifest = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );
  const workflow = readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );
  const versions = [...workflow.matchAll(/bun-version:\s*(\S+)/g)].map(
    ([, version]) => version
  );

  assert.ok(versions.length > 0);
  assert.deepEqual([...new Set(versions)], [rootManifest.devDependencies.bun]);
});

test('Core proof does not build workspace artifacts or serialize package lint', () => {
  const source = readFileSync(
    path.join(repoRoot, 'tooling/scripts/check-core.mjs'),
    'utf-8'
  );

  assert.doesNotMatch(source, /run\('build /);
  assert.match(
    source,
    /run\(`lint \$\{packageSlugs\.length\} Core and reviewed packages`, 'pnpm', \[\s*'turbo',\s*'lint',\s*'--only'/s
  );
});

test('ordinary package tests use the root source-first Bun config', () => {
  assert.deepEqual(
    createBunTestArgs({
      packageCwd: path.join(repoRoot, 'packages/plite'),
      projectCwd: repoRoot,
    }),
    [
      `--config=${path.join(repoRoot, 'bunfig.toml')}`,
      `--cwd=${repoRoot}`,
      'test',
      'packages/plite/',
    ]
  );
});

test('package typecheck gets source paths without exposing them to Bun', () => {
  const packageRunner = readFileSync(
    path.join(repoRoot, 'packages/plate-scripts/run-with-pkg-dir.cjs'),
    'utf-8'
  );
  const baseConfig = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'tooling/config/tsconfig.base.json'),
      'utf-8'
    )
  );

  assert.match(packageRunner, /typecheck-package-source\.mjs/);
  assert.deepEqual(baseConfig.compilerOptions.paths, {});

  const rootManifest = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );

  assert.match(
    rootManifest.scripts['plite:typecheck'],
    /^pnpm --workspace-concurrency=8 /
  );
  assert.doesNotMatch(rootManifest.scripts['plite:typecheck'], /--parallel/);
});

test('every Plite package typechecks against workspace source', () => {
  for (const { root } of plitePackages) {
    const manifest = JSON.parse(
      readFileSync(path.join(repoRoot, root, 'package.json'), 'utf-8')
    );

    assert.match(
      manifest.scripts?.typecheck ?? '',
      /^plate-pkg p:typecheck(?:\s|$)/u,
      root
    );
  }
});

test('Playwright containers install Bun prerequisites before setup', () => {
  const workflow = readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );

  for (const jobName of ['browser-chromium', 'browser-matrix-linux']) {
    const job = workflow.match(
      new RegExp(
        `\\n  ${jobName}:(?<body>[\\s\\S]*?)(?=\\n  [a-z][a-z0-9-]*:|$)`,
        'u'
      )
    )?.groups?.body;

    assert.ok(job, `missing ${jobName} job`);
    assert.match(job, /container: mcr\.microsoft\.com\/playwright/u);
    assert.ok(
      job.indexOf('apt-get install --yes --no-install-recommends unzip') <
        job.indexOf('uses: oven-sh/setup-bun@v2'),
      `${jobName} must install unzip before setup-bun`
    );
  }
});

test('type-test fixtures resolve the Plite React internal entry from source', () => {
  const config = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'tooling/config/tsconfig.type-tests.json'),
      'utf-8'
    )
  );

  assert.deepEqual(
    config.compilerOptions.paths['@platejs/plite-react/internal'],
    ['../../packages/plite-react/src/internal/index.ts']
  );
});
