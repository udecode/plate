import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';
import { plitePackages, repoRoot } from './check-plite.mjs';
import { createTypeAwareLintSteps } from './lint-type-aware.mjs';

const require = createRequire(import.meta.url);
const {
  createBunTestArgs,
} = require('../../tooling/scripts/bun-test-args.cjs');

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
    'platejs/react',
    'plitejs/react',
    'platejs/yjs',
    'platejs/yjs/react',
  ]) {
    assert.equal(specifiers.has(specifier), true, specifier);
  }
});

test('www does not expose Plite runtime aliases to application code', () => {
  const appRoot = path.join(repoRoot, 'apps/www');
  const appConfig = JSON.parse(
    readFileSync(path.join(appRoot, 'tsconfig.json'), 'utf-8')
  );
  const { paths } = appConfig.compilerOptions;

  assert.deepEqual(
    Object.keys(paths).filter((specifier) => specifier.startsWith('plitejs')),
    []
  );
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

test('Core proof preserves generated partition dependencies', () => {
  const source = readFileSync(
    path.join(repoRoot, 'tooling/scripts/check-core.mjs'),
    'utf-8'
  );

  assert.doesNotMatch(source, /run\('build /);
  assert.match(
    source,
    /run\(`lint \$\{packageSlugs\.length\} Core and reviewed packages`, 'pnpm', \[\s*'turbo',\s*'lint'/s
  );
  assert.doesNotMatch(source, /['"]--only['"]/u);
});

test('ordinary package tests use the root source-first Bun config', () => {
  assert.deepEqual(
    createBunTestArgs({
      packageCwd: path.join(repoRoot, 'packages/plitejs'),
      projectCwd: repoRoot,
    }),
    [
      `--config=${path.join(repoRoot, 'bunfig.toml')}`,
      `--cwd=${repoRoot}`,
      'test',
      'packages/plitejs/',
    ]
  );
});

test('package typecheck gets source paths without exposing them to Bun', () => {
  const packageRunner = readFileSync(
    path.join(repoRoot, 'tooling/scripts/run-with-pkg-dir.cjs'),
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
    /^turbo run typecheck --filter=plitejs --filter=platejs --filter=@platejs\/test --concurrency=8/u
  );
  assert.doesNotMatch(rootManifest.scripts['plite:typecheck'], /--parallel/);
});

test('type-aware lint prepares exact package declarations before Oxlint', () => {
  const rootManifest = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );
  const steps = createTypeAwareLintSteps({ root: repoRoot });

  assert.equal(
    rootManifest.scripts['lint:type-aware'],
    'node tooling/scripts/lint-type-aware.mjs'
  );
  assert.deepEqual(steps[0].args, ['g:build']);
  assert.deepEqual(steps[1].args, [
    '--type-aware',
    '--report-unused-disable-directives-severity=error',
    '.',
  ]);
  assert.equal(
    steps[1].args.some((arg) => arg.startsWith('--tsconfig')),
    false
  );

  const windowsSteps = createTypeAwareLintSteps({
    platform: 'win32',
    root: repoRoot,
  });

  assert.equal(windowsSteps[0].command, 'pnpm.cmd');
  assert.equal(windowsSteps[0].shell, true);
  assert.match(windowsSteps[1].command, /oxlint\.cmd$/);
  assert.equal(windowsSteps[1].shell, true);
  assert.equal(
    steps.every((step) => !step.shell),
    true
  );
});

test('every Plite package typechecks against workspace source', () => {
  for (const { name, root } of plitePackages) {
    const manifest = JSON.parse(
      readFileSync(path.join(repoRoot, root, 'package.json'), 'utf-8')
    );
    const entrypointTypecheckScripts = {
      '@platejs/test':
        'node ../../tooling/scripts/run-entrypoint-package-task.mjs @platejs/test typecheck',
      platejs:
        'node ../../tooling/scripts/run-entrypoint-package-task.mjs platejs typecheck',
      plitejs:
        'node ../../tooling/scripts/run-entrypoint-package-task.mjs plitejs typecheck',
    };
    const entrypointTypecheck = entrypointTypecheckScripts[name];

    if (entrypointTypecheck) {
      assert.equal(manifest.scripts?.typecheck, entrypointTypecheck, root);
    } else {
      assert.match(
        manifest.scripts?.typecheck ?? '',
        /^node \.\.\/\.\.\/tooling\/scripts\/plate-pkg\.cjs p:typecheck(?:\s|$)/u,
        root
      );
    }
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

test('Plate type-test fixtures resolve Plate and Plite from source', () => {
  const config = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'tooling/config/tsconfig.type-tests.json'),
      'utf-8'
    )
  );

  assert.deepEqual(config.compilerOptions.paths['platejs/react'], [
    '../../packages/platejs/src/react/index.tsx',
  ]);
  assert.deepEqual(config.compilerOptions.paths['plitejs/react'], [
    '../../packages/plitejs/src/react/index.ts',
  ]);
  assert.equal(config.compilerOptions.paths['plitejs/internal'], undefined);
  assert.equal(
    config.compilerOptions.paths['plitejs/react/internal'],
    undefined
  );
  assert.equal(config.compilerOptions.paths['@udecode/*'], undefined);
});
