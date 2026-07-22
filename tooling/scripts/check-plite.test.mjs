import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  createAffectedPlan,
  createCheckSteps,
  getComparisonBase,
  plateAdopterPackages,
  plitePackages,
  repoRoot,
} from './check-plite.mjs';

const ids = (steps) => steps.map(({ id }) => id);
const adopterNames = plateAdopterPackages.map(({ name }) => name);
const collectFiles = (root) => {
  const files = [];

  for (const entry of fs.readdirSync(path.join(repoRoot, root), {
    withFileTypes: true,
  })) {
    const file = `${root}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...collectFiles(file));
    } else {
      files.push(file);
    }
  }

  return files;
};

const benchmarkAuthorityInputs = [
  ...collectFiles('benchmarks/editor/benchmarks').filter((file) =>
    path.basename(file).startsWith('plite-')
  ),
  ...collectFiles('benchmarks/slate-v2/donor/core/current'),
  ...collectFiles('benchmarks/slate-v2/donor/shared'),
].sort();

test('strict and package checks compose each proof owner exactly once', () => {
  const strict = createCheckSteps('strict');
  const packages = createCheckSteps('packages');

  assert.deepEqual(ids(strict), [
    'typecheck',
    'package-tests',
    'contracts',
    'browser-chromium',
  ]);
  assert.deepEqual(ids(packages), ['typecheck', 'package-tests', 'contracts']);
  assert.equal(strict.filter(({ id }) => id === 'browser-chromium').length, 1);
  assert.equal(
    strict.some(({ id }) => id === 'browser-smoke'),
    false
  );
});

test('affected package work uses bounded workspace concurrency', () => {
  const plan = createAffectedPlan(['packages/plite/src/index.ts']);
  const steps = createCheckSteps('dev', plan);

  for (const step of steps.filter(({ id }) =>
    ['package-tests', 'typecheck'].includes(id)
  )) {
    assert.ok(step.args.includes('--workspace-concurrency=8'));
    assert.equal(step.args.includes('--parallel'), false);
  }
});

test('development proof keeps Browser core tests out of browser-server proof', () => {
  const plan = createAffectedPlan(['packages/browser/src/core/index.ts']);
  const steps = createCheckSteps('dev', plan);

  assert.deepEqual(ids(steps), [
    'typecheck',
    'browser-core-tests',
    'browser-smoke',
  ]);
  assert.deepEqual(steps.find(({ id }) => id === 'browser-core-tests')?.args, [
    '--filter',
    '@platejs/browser',
    'test:core',
  ]);
});

test('a core source change invalidates every dependent Plite package', () => {
  const plan = createAffectedPlan(['packages/plite/src/index.ts']);

  assert.deepEqual(plan.packageNames, [
    '@platejs/plite',
    '@platejs/plite-dom',
    '@platejs/plite-history',
    '@platejs/plite-hyperscript',
    '@platejs/plite-react',
    '@platejs/plite-layout',
    '@platejs/yjs',
  ]);
  assert.deepEqual(plan.adopterPackageNames, adopterNames);
  assert.deepEqual(plan.adopterTestPackageNames, []);
  assert.deepEqual(plan.typecheckPackageNames, [
    ...plan.packageNames,
    ...adopterNames,
    'plite',
  ]);
  assert.deepEqual(plan.testPackageNames, plan.packageNames);
  assert.equal(plan.packageNames.includes('@platejs/browser'), false);
  assert.equal(plan.browserSmoke, true);
});

test('a leaf test change stays package-local and skips browser preparation', () => {
  const plan = createAffectedPlan([
    'packages/plite-layout/test/layout-contract.test.ts',
  ]);
  const steps = createCheckSteps('dev', plan);

  assert.deepEqual(plan.packageNames, ['@platejs/plite-layout']);
  assert.deepEqual(plan.typecheckPackageNames, ['@platejs/plite-layout']);
  assert.equal(plan.appTypecheck, false);
  assert.equal(plan.browserSmoke, false);
  assert.deepEqual(ids(steps), ['typecheck', 'package-tests']);
});

test('Plite-family test edits do not invalidate runtime dependents', () => {
  const coreTest = createAffectedPlan([
    'packages/plite/test/document-change-laws.test.ts',
  ]);
  const domTest = createAffectedPlan([
    'packages/plite-dom/test/host-codec.test.ts',
  ]);

  assert.deepEqual(coreTest.packageNames, ['@platejs/plite']);
  assert.deepEqual(coreTest.typecheckPackageNames, ['@platejs/plite']);
  assert.equal(coreTest.browserSmoke, false);
  assert.deepEqual(domTest.packageNames, ['@platejs/plite-dom']);
  assert.deepEqual(domTest.typecheckPackageNames, ['@platejs/plite-dom']);
  assert.equal(domTest.browserSmoke, false);
});

test('fixture JSX config maps to its three consuming package proofs', () => {
  for (const input of [
    'config/plite-test-jsx.js',
    'config/plite-test-jsx-globals.d.ts',
  ]) {
    const plan = createAffectedPlan([input]);

    assert.deepEqual(
      plan.packageNames,
      [
        '@platejs/plite',
        '@platejs/plite-history',
        '@platejs/plite-hyperscript',
      ],
      input
    );
    assert.deepEqual(plan.typecheckPackageNames, plan.packageNames, input);
    assert.deepEqual(plan.testPackageNames, plan.packageNames, input);
    assert.equal(plan.appTypecheck, false, input);
    assert.equal(plan.browserSmoke, false, input);
    assert.equal(plan.contracts, false, input);
    assert.deepEqual(
      ids(createCheckSteps('dev', plan)),
      ['typecheck', 'package-tests'],
      input
    );
  }
});

test('a Plite DOM runtime edit reaches React, Layout, and Yjs', () => {
  const plan = createAffectedPlan(['packages/plite-dom/src/index.ts']);

  assert.deepEqual(plan.packageNames, [
    '@platejs/plite-dom',
    '@platejs/plite-react',
    '@platejs/plite-layout',
    '@platejs/yjs',
  ]);
  assert.deepEqual(plan.adopterPackageNames, adopterNames);
  assert.deepEqual(plan.adopterTestPackageNames, []);
});

test('reviewed Plate adopters map to package-local source-first proof', () => {
  for (const { name, root } of plateAdopterPackages) {
    if (name === '@platejs/core') continue;

    const plan = createAffectedPlan([`${root}/src/index.ts`]);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(repoRoot, root, 'package.json'), 'utf8')
    );

    assert.equal(manifest.name, name, root);
    assert.equal(manifest.scripts?.typecheck, 'plate-pkg p:typecheck', root);
    assert.equal(typeof manifest.scripts?.test, 'string', root);
    assert.deepEqual(plan.packageNames, [], root);
    assert.deepEqual(plan.adopterPackageNames, [name], root);
    assert.deepEqual(plan.adopterTestPackageNames, [name], root);
    assert.deepEqual(plan.typecheckPackageNames, [name], root);
    assert.deepEqual(plan.testPackageNames, [name], root);
    assert.equal(plan.relevant, true, root);
    assert.equal(plan.appTypecheck, false, root);
    assert.equal(plan.browserSmoke, false, root);
    assert.deepEqual(ids(createCheckSteps('dev', plan)), [
      'typecheck',
      'package-tests',
    ]);
  }
});

test('Core runtime invalidates integration owners while Core tests stay local', () => {
  const runtime = createAffectedPlan(['packages/core/src/lib/editor/index.ts']);
  const testOnly = createAffectedPlan([
    'packages/core/src/lib/editor/BaseEditor.spec.ts',
  ]);

  assert.deepEqual(runtime.adopterPackageNames, adopterNames);
  assert.deepEqual(runtime.adopterTestPackageNames, ['@platejs/core']);
  assert.deepEqual(runtime.packageNames, ['@platejs/yjs']);
  assert.deepEqual(runtime.typecheckPackageNames, [
    '@platejs/yjs',
    ...adopterNames,
    'plite',
  ]);
  assert.deepEqual(runtime.testPackageNames, ['@platejs/yjs', '@platejs/core']);
  assert.equal(runtime.browserSmoke, true);
  assert.deepEqual(testOnly.adopterPackageNames, ['@platejs/core']);
  assert.deepEqual(testOnly.adopterTestPackageNames, ['@platejs/core']);
  assert.deepEqual(testOnly.packageNames, []);
  assert.deepEqual(testOnly.typecheckPackageNames, ['@platejs/core']);
  assert.deepEqual(testOnly.testPackageNames, ['@platejs/core']);
  assert.equal(testOnly.appTypecheck, false);
  assert.equal(testOnly.browserSmoke, false);
});

test('runner and route changes invalidate only their real proof owners', () => {
  const runner = createAffectedPlan([
    'apps/plite/scripts/plite-browser-runner.mjs',
  ]);
  const route = createAffectedPlan([
    'apps/www/src/app/(app)/examples/plite/richtext/page.tsx',
  ]);
  const browserSpec = createAffectedPlan([
    'apps/plite/tests/plite-browser/plite-examples.spec.ts',
  ]);
  const playwrightConfig = createAffectedPlan([
    'apps/plite/playwright.config.ts',
  ]);
  const appManifest = createAffectedPlan(['apps/plite/package.json']);
  const packageIntegrationConfig = createAffectedPlan([
    'apps/www/tsconfig.package-integration.json',
  ]);

  assert.deepEqual(ids(createCheckSteps('dev', runner)), [
    'contracts',
    'browser-smoke',
  ]);
  assert.deepEqual(ids(createCheckSteps('dev', route)), [
    'typecheck',
    'browser-smoke',
  ]);
  assert.deepEqual(route.typecheckPackageNames, ['plite']);
  assert.deepEqual(ids(createCheckSteps('dev', browserSpec)), [
    'contracts',
    'browser-smoke',
  ]);
  assert.deepEqual(ids(createCheckSteps('dev', playwrightConfig)), [
    'typecheck',
    'contracts',
    'browser-smoke',
  ]);
  assert.deepEqual(ids(createCheckSteps('dev', appManifest)), [
    'typecheck',
    'contracts',
    'browser-smoke',
  ]);
  assert.deepEqual(ids(createCheckSteps('dev', packageIntegrationConfig)), [
    'typecheck',
    'www-typecheck',
    'browser-smoke',
  ]);
});

test('Plite benchmark authority inputs run only bounded proof contracts', () => {
  assert.ok(benchmarkAuthorityInputs.length > 20);

  for (const input of benchmarkAuthorityInputs) {
    const plan = createAffectedPlan([input]);

    assert.equal(plan.relevant, true, input);
    assert.deepEqual(plan.typecheckPackageNames, [], input);
    assert.deepEqual(plan.testPackageNames, [], input);
    assert.deepEqual(ids(createCheckSteps('dev', plan)), ['contracts'], input);
  }
});

test('split tooling contracts remain in affected Plite proof', () => {
  for (const input of [
    'tooling/scripts/bench-targets.test.mjs',
    'tooling/scripts/bench-targets.slow.test.mjs',
    'tooling/scripts/check-plite-release-artifacts.test.mjs',
    'tooling/scripts/check-plite-release-artifacts.slow.test.mjs',
    'tooling/scripts/plite-source-aliases.test.mjs',
    'tooling/scripts/plite-source-aliases.slow.test.mjs',
    'tooling/scripts/run-bounded-process.test.mjs',
    'tooling/scripts/run-bounded-process.slow.test.mjs',
    'tooling/scripts/test-suite-routing.test.mjs',
  ]) {
    const plan = createAffectedPlan([input]);

    assert.equal(plan.relevant, true, input);
    assert.deepEqual(ids(createCheckSteps('dev', plan)), ['contracts'], input);
  }
});

test('the editor performance route runs only the www source typecheck', () => {
  const plan = createAffectedPlan([
    'apps/www/src/app/dev/editor-perf/page.tsx',
  ]);

  assert.equal(plan.relevant, true);
  assert.equal(plan.wwwTypecheck, true);
  assert.equal(plan.appTypecheck, false);
  assert.equal(plan.browserSmoke, false);
  assert.deepEqual(plan.typecheckPackageNames, []);
  assert.deepEqual(plan.testPackageNames, []);
  const steps = createCheckSteps('dev', plan);

  assert.deepEqual(ids(steps), ['www-typecheck']);
  assert.deepEqual(steps[0], {
    args: [
      '--filter',
      'www',
      'exec',
      'tsc',
      '--noEmit',
      '-p',
      'tsconfig.package-integration.json',
    ],
    command: 'pnpm',
    id: 'www-typecheck',
  });
});

test('registry editor plugins run only the bounded www source typecheck', () => {
  const plan = createAffectedPlan([
    'apps/www/src/registry/components/editor/plugins/table-kit.tsx',
  ]);

  assert.equal(plan.relevant, true);
  assert.equal(plan.wwwTypecheck, true);
  assert.equal(plan.appTypecheck, false);
  assert.equal(plan.browserSmoke, false);
  assert.deepEqual(plan.typecheckPackageNames, []);
  assert.deepEqual(plan.testPackageNames, []);
  assert.deepEqual(ids(createCheckSteps('dev', plan)), ['www-typecheck']);
});

test('shared config fails closed while unrelated docs are a no-op', () => {
  const sharedInputs = [
    'tooling/config/tsconfig.base.json',
    'bunfig.toml',
    'config/plite-source-aliases.ts',
    'config/workspace-source-entries.mjs',
    'packages/core/bunfig.toml',
    'packages/plate-scripts/run-with-pkg-dir.cjs',
    'tooling/scripts/typecheck-package-source.mjs',
  ];
  const docs = createAffectedPlan(['docs/plite/agent-start.md']);

  for (const input of sharedInputs) {
    const shared = createAffectedPlan([input]);

    assert.deepEqual(
      shared.packageNames,
      plitePackages.map(({ name }) => name),
      input
    );
    assert.equal(shared.appTypecheck, true, input);
    assert.equal(shared.browserSmoke, true, input);
    assert.equal(shared.contracts, true, input);
  }
  assert.equal(docs.relevant, false);
  assert.deepEqual(createCheckSteps('dev', docs), []);
});

test('Plite CI watches the root Bun config used by affected proof', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf8'
  );
  const plan = createAffectedPlan(['bunfig.toml']);

  assert.equal(plan.contracts, true);
  assert.equal(plan.relevant, true);
  assert.equal(workflow.match(/^\s+- "bunfig\.toml"$/gmu)?.length, 2);
  assert.equal(workflow.match(/^\s+- "config\/\*\*"$/gmu)?.length, 2);
});

test('Plite CI watches and typechecks the bounded www adopter surface', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf8'
  );
  const config = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'apps/www/tsconfig.package-integration.json'),
      'utf8'
    )
  );

  assert.equal(
    workflow.match(/^\s+- "apps\/www\/src\/app\/dev\/editor-perf\/\*\*"$/gmu)
      ?.length,
    2
  );
  assert.equal(
    workflow.match(
      /^\s+run: pnpm --filter www exec tsc --noEmit -p tsconfig\.package-integration\.json$/gmu
    )?.length,
    1
  );
  assert.ok(config.include.includes('src/app/dev/editor-perf/**/*.ts'));
  assert.ok(config.include.includes('src/app/dev/editor-perf/**/*.tsx'));
  assert.ok(config.include.includes('src/types/**/*.d.ts'));
  assert.ok(config.include.includes('../../packages/*/src/**/*.d.ts'));
  assert.ok(config.include.includes('../../packages/udecode/*/src/**/*.d.ts'));
  assert.ok(
    config.include.includes('src/__tests__/package-integration/**/*.ts')
  );
  for (const extension of ['ts', 'tsx']) {
    const input = `apps/www/src/registry/components/editor/plugins/**/*.${extension}`;

    assert.equal(
      workflow.match(
        new RegExp(
          `^\\s+- "${input.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}"$`,
          'gmu'
        )
      )?.length,
      2,
      input
    );
    assert.ok(
      config.include.includes(
        `src/registry/components/editor/plugins/**/*.${extension}`
      )
    );
  }
});

test('Plite CI cache action inputs do not duplicate their exact key', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf8'
  );
  const restore = workflow.match(
    /- name: Restore Chromium browser proof state(?<block>[\s\S]*?)(?=\n\s+- name:)/u
  )?.groups?.block;

  assert.ok(restore, 'missing Chromium proof-state restore step');
  assert.equal(restore.match(/^\s+key:/gmu)?.length, 1);
});

test('Plite CI watches every benchmark authority root through cheap contracts', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf8'
  );

  for (const input of [
    'benchmarks/editor/benchmarks/plite-*',
    'benchmarks/slate-v2/donor/core/current/**',
    'benchmarks/slate-v2/donor/shared/**',
  ]) {
    const escaped = input.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

    assert.equal(
      workflow.match(new RegExp(`^\\s+- "${escaped}"$`, 'gmu'))?.length,
      2,
      input
    );
  }

  for (const input of [
    'benchmarks/editor/benchmarks/benchmark-artifact.test.ts',
    'benchmarks/editor/benchmarks/benchmark-artifact.ts',
    'benchmarks/targets/slate-v2.json',
    'tooling/scripts/bench-targets.mjs',
    'tooling/scripts/bench-targets.test.mjs',
    'tooling/scripts/bench-targets.slow.test.mjs',
    'tooling/scripts/check-plite-release-artifacts.mjs',
    'tooling/scripts/check-plite-release-artifacts.test.mjs',
    'tooling/scripts/check-plite-release-artifacts.slow.test.mjs',
    'tooling/scripts/plite-source-aliases.test.mjs',
    'tooling/scripts/plite-source-aliases.slow.test.mjs',
    'tooling/scripts/run-bounded-process.mjs',
    'tooling/scripts/run-bounded-process.test.mjs',
    'tooling/scripts/run-bounded-process.slow.test.mjs',
    'tooling/scripts/test-fast.mjs',
    'tooling/scripts/test-slow.mjs',
    'tooling/scripts/test-slowest.mjs',
    'tooling/scripts/test-suite-routing.test.mjs',
  ]) {
    const escaped = input.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

    assert.equal(
      workflow.match(new RegExp(`^\\s+- "${escaped}"$`, 'gmu'))?.length,
      2,
      input
    );
  }

  assert.equal(
    workflow.match(/^\s+run: pnpm check:plite:contracts$/gmu)?.length,
    1
  );
  assert.doesNotMatch(workflow, /plite:bench:targets:run/u);
});

test('Plite runtime uses one source-first adopter typecheck lane', () => {
  const runtime = createAffectedPlan(['packages/plite/src/index.ts']);
  const testOnly = createAffectedPlan([
    'packages/plite/test/document-change-laws.test.ts',
  ]);
  const [step] = createCheckSteps('adopters', runtime);

  assert.equal(step.id, 'typecheck');
  assert.equal(step.command, 'pnpm');
  assert.deepEqual(
    step.args.filter((argument) => adopterNames.includes(argument)),
    adopterNames
  );
  assert.deepEqual(createCheckSteps('adopters', testOnly), []);

  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf8'
  );
  const sourceTypecheck = fs.readFileSync(
    path.join(repoRoot, 'tooling/scripts/typecheck-package-source.mjs'),
    'utf8'
  );

  assert.match(workflow, /^ {2}plite-adopters:$/mu);
  assert.match(workflow, /run: pnpm check:plite:adopters/u);
  assert.match(workflow, /PLITE_CHECK_BASE:/u);
  assert.doesNotMatch(sourceTypecheck, /\bbuild\b/u);
});

test('local affected proof uses working changes unless CI supplies a base', () => {
  assert.equal(getComparisonBase({}), null);
  assert.equal(
    getComparisonBase({ GITHUB_BASE_SHA: 'github-base' }),
    'github-base'
  );
  assert.equal(
    getComparisonBase({
      GITHUB_BASE_SHA: 'github-base',
      PLITE_CHECK_BASE: 'explicit-base',
    }),
    'explicit-base'
  );
});

test('Plate Core runtime fans out to all adopters while app dependencies stay bounded', () => {
  const core = createAffectedPlan(['packages/core/src/index.ts']);
  const appDependency = createAffectedPlan([
    'packages/udecode/utils/src/index.ts',
  ]);

  assert.deepEqual(core.packageNames, ['@platejs/yjs']);
  assert.deepEqual(core.adopterPackageNames, adopterNames);
  assert.deepEqual(core.typecheckPackageNames, [
    '@platejs/yjs',
    ...adopterNames,
    'plite',
  ]);
  assert.deepEqual(core.testPackageNames, ['@platejs/yjs', '@platejs/core']);
  assert.equal(core.browserSmoke, true);
  assert.deepEqual(appDependency.packageNames, []);
  assert.deepEqual(appDependency.typecheckPackageNames, ['plite']);
  assert.equal(appDependency.browserSmoke, true);
});

test('root scripts keep source-first typecheck and strict browser closure separate', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
  );
  const scripts = packageJson.scripts;

  assert.equal(
    scripts['check:plite'],
    'node tooling/scripts/check-plite.mjs strict'
  );
  assert.equal(
    scripts['check:plite:adopters'],
    'node tooling/scripts/check-plite.mjs adopters'
  );
  assert.equal(
    scripts['check:plite:packages'],
    'node tooling/scripts/check-plite.mjs packages'
  );
  assert.equal(
    scripts['check:plite:dev'],
    'node tooling/scripts/check-plite.mjs dev'
  );
  for (const requiredContract of [
    'tooling/scripts/bench-targets.test.mjs',
    'tooling/scripts/bench-targets.slow.test.mjs',
    'tooling/scripts/check-plite-release-artifacts.test.mjs',
    'tooling/scripts/check-plite-release-artifacts.slow.test.mjs',
    'tooling/scripts/plite-source-aliases.test.mjs',
    'tooling/scripts/plite-source-aliases.slow.test.mjs',
    'tooling/scripts/run-bounded-process.test.mjs',
    'tooling/scripts/run-bounded-process.slow.test.mjs',
    'tooling/scripts/test-suite-routing.test.mjs',
    'packages/plite/test/slice-fit-contract.test.ts',
    'benchmarks/editor/benchmarks/benchmark-artifact.test.ts',
    'benchmarks/editor/benchmarks/plite-clipboard-large-payload-benchmark.test.ts',
    'benchmarks/editor/benchmarks/plite-content-slice-value-benchmark.test.ts',
    'benchmarks/editor/benchmarks/plite-fit-content-locality-benchmark.test.ts',
    'benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.test.ts',
    'pnpm plite:bench:targets:check',
    'pnpm plite:public-types',
  ]) {
    assert.match(
      scripts['check:plite:contracts'],
      new RegExp(requiredContract.replaceAll('.', '\\.'))
    );
  }
  assert.doesNotMatch(
    scripts['check:plite:contracts'],
    /plite:bench:targets:run/u
  );
  assert.equal(
    scripts['plite:public-types'],
    'pnpm plite:packages:build && tsc --project packages/plite/test/tsconfig.public-package-types.json --noEmit'
  );
  assert.doesNotMatch(scripts['plite:typecheck'], /\b(?:build|turbo)\b/);
  assert.equal(scripts['test:plite'], 'pnpm plite:test');
  assert.equal(scripts['check:plite'].includes('browser-matrix'), false);
  assert.equal(
    scripts['check:plite:browser-matrix'],
    'pnpm --filter plite test:plite-browser'
  );
  assert.equal(
    scripts['test:plite:browser'],
    'pnpm --filter plite test:plite-browser'
  );
  assert.doesNotMatch(
    `${scripts['check:plite:browser-matrix']} ${scripts['test:plite:browser']}`,
    /playwright install|plite:browser:install/u
  );
});

test('www package integration inherits the complete source map', () => {
  const config = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'apps/www/tsconfig.package-integration.json'),
      'utf8'
    )
  );

  assert.equal(config.extends, './tsconfig.json');
  assert.equal(config.compilerOptions?.paths, undefined);
});

test('affected dependency graph matches Plite-family package manifests', () => {
  const familyNames = new Set(plitePackages.map(({ name }) => name));

  for (const { dependencies, root } of plitePackages) {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(repoRoot, root, 'package.json'), 'utf8')
    );
    const actual = new Set(
      Object.keys({
        ...manifest.dependencies,
        ...manifest.devDependencies,
        ...manifest.peerDependencies,
      }).filter((name) => familyNames.has(name))
    );

    assert.deepEqual([...actual].sort(), [...dependencies].sort(), root);
  }
});

test('every declared Plite-family dependency resolves to source during typecheck', () => {
  for (const { dependencies, root } of plitePackages) {
    const config = JSON.parse(
      fs.readFileSync(path.join(repoRoot, root, 'tsconfig.json'), 'utf8')
    );
    const aliases = config.compilerOptions?.paths ?? {};

    for (const [specifier, targets] of Object.entries(aliases)) {
      if (!specifier.startsWith('@platejs/')) continue;

      assert.ok(targets.length > 0, `${root} has an empty ${specifier} alias`);
      assert.ok(
        targets.every((target) => target.includes('/src/')),
        `${root} resolves ${specifier} outside source`
      );
    }

    for (const dependency of dependencies) {
      assert.ok(
        aliases[dependency],
        `${root} does not source-map ${dependency}`
      );
    }
  }
});
