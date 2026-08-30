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

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

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
].sort(compareStrings);

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
  const plan = createAffectedPlan(['packages/plitejs/src/index.ts']);
  const steps = createCheckSteps('dev', plan);

  for (const step of steps.filter(({ id }) =>
    ['package-tests', 'typecheck'].includes(id)
  )) {
    assert.ok(step.args.includes('--workspace-concurrency=8'));
    assert.equal(step.args.includes('--parallel'), false);
  }
  for (const step of steps.filter(({ id }) =>
    ['entrypoint-tests', 'entrypoint-typecheck'].includes(id)
  )) {
    assert.ok(step.args.includes('--concurrency=8'));
    assert.equal(step.args.includes('--parallel'), false);
  }
});

test('a proof source change runs the test package entrypoint tasks', () => {
  const plan = createAffectedPlan(['packages/test/src/proof/index.ts']);
  const steps = createCheckSteps('dev', plan);

  assert.deepEqual(ids(steps), [
    'entrypoint-typecheck',
    'entrypoint-tests',
    'browser-smoke',
  ]);
  assert.deepEqual(steps.find(({ id }) => id === 'entrypoint-tests')?.args, [
    'turbo',
    'run',
    'test',
    '--filter=@platejs/test',
    '--concurrency=8',
  ]);
});

test('a core source change invalidates every dependent Plite package', () => {
  const plan = createAffectedPlan(['packages/plitejs/src/index.ts']);

  assert.deepEqual(plan.packageNames, ['plitejs', 'platejs', '@platejs/test']);
  assert.deepEqual(plan.adopterPackageNames, adopterNames);
  assert.deepEqual(plan.adopterTestPackageNames, []);
  assert.deepEqual(plan.typecheckPackageNames, [
    ...plan.packageNames,
    ...adopterNames,
    'plite',
  ]);
  assert.deepEqual(plan.testPackageNames, plan.packageNames);
  assert.equal(plan.packageNames.includes('@platejs/test'), true);
  assert.equal(plan.browserSmoke, true);
});

test('a leaf test change stays package-local and skips browser preparation', () => {
  const plan = createAffectedPlan([
    'packages/plitejs/test/page-layout/layout-contract.test.ts',
  ]);
  const steps = createCheckSteps('dev', plan);

  assert.deepEqual(plan.packageNames, ['plitejs']);
  assert.deepEqual(plan.typecheckPackageNames, ['plitejs']);
  assert.equal(plan.appTypecheck, false);
  assert.equal(plan.browserSmoke, false);
  assert.deepEqual(ids(steps), ['entrypoint-typecheck', 'entrypoint-tests']);
});

test('Plite-family test edits do not invalidate runtime dependents', () => {
  const coreTest = createAffectedPlan([
    'packages/plitejs/test/document-change-laws.test.ts',
  ]);
  const domTest = createAffectedPlan([
    'packages/plitejs/test/dom/host-codec.test.ts',
  ]);

  assert.deepEqual(coreTest.packageNames, ['plitejs']);
  assert.deepEqual(coreTest.typecheckPackageNames, ['plitejs']);
  assert.equal(coreTest.browserSmoke, false);
  assert.deepEqual(domTest.packageNames, ['plitejs']);
  assert.deepEqual(domTest.typecheckPackageNames, ['plitejs']);
  assert.equal(domTest.browserSmoke, false);
});

test('fixture JSX config maps to the consolidated package proof', () => {
  for (const input of [
    'config/plite-test-jsx.js',
    'config/plite-test-jsx-globals.d.ts',
  ]) {
    const plan = createAffectedPlan([input]);

    assert.deepEqual(plan.packageNames, ['plitejs'], input);
    assert.deepEqual(plan.typecheckPackageNames, plan.packageNames, input);
    assert.deepEqual(plan.testPackageNames, plan.packageNames, input);
    assert.equal(plan.appTypecheck, false, input);
    assert.equal(plan.browserSmoke, false, input);
    assert.equal(plan.contracts, false, input);
    assert.deepEqual(
      ids(createCheckSteps('dev', plan)),
      ['entrypoint-typecheck', 'entrypoint-tests'],
      input
    );
  }
});

test('a Plite DOM runtime edit reaches consolidated dependents', () => {
  const plan = createAffectedPlan(['packages/plitejs/src/dom/index.ts']);

  assert.deepEqual(plan.packageNames, ['plitejs', 'platejs', '@platejs/test']);
  assert.deepEqual(plan.adopterPackageNames, adopterNames);
  assert.deepEqual(plan.adopterTestPackageNames, []);
});

test('reviewed Plate adopters map to package-local source-first proof', () => {
  for (const { name, root } of plateAdopterPackages) {
    if (name === 'platejs') continue;

    const plan = createAffectedPlan([`${root}/src/index.ts`]);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(repoRoot, root, 'package.json'), 'utf-8')
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

test('Plate runtime invalidates integration owners while Plate tests stay local', () => {
  const runtime = createAffectedPlan([
    'packages/platejs/src/lib/editor/index.ts',
  ]);
  const testOnly = createAffectedPlan([
    'packages/platejs/src/lib/editor/Editor.spec.ts',
  ]);

  assert.deepEqual(runtime.adopterPackageNames, adopterNames);
  assert.deepEqual(runtime.adopterTestPackageNames, []);
  assert.deepEqual(runtime.packageNames, ['platejs', '@platejs/test']);
  assert.deepEqual(runtime.typecheckPackageNames, [
    'platejs',
    '@platejs/test',
    ...adopterNames,
    'plite',
  ]);
  assert.deepEqual(runtime.testPackageNames, ['platejs', '@platejs/test']);
  assert.equal(runtime.browserSmoke, true);
  assert.deepEqual(testOnly.adopterPackageNames, []);
  assert.deepEqual(testOnly.adopterTestPackageNames, []);
  assert.deepEqual(testOnly.packageNames, ['platejs']);
  assert.deepEqual(testOnly.typecheckPackageNames, ['platejs']);
  assert.deepEqual(testOnly.testPackageNames, ['platejs']);
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
    'tooling/scripts/entrypoint-turbo.slow.test.mjs',
    'tooling/scripts/entrypoint-turbo.test.mjs',
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
    'packages/platejs/bunfig.toml',
    'tooling/scripts/run-with-pkg-dir.cjs',
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
    'utf-8'
  );
  const plan = createAffectedPlan(['bunfig.toml']);

  assert.equal(plan.contracts, true);
  assert.equal(plan.relevant, true);
  assert.equal(workflow.match(/^\s+- ['"]bunfig\.toml['"]$/gmu)?.length, 2);
  assert.equal(workflow.match(/^\s+- ['"]config\/\*\*['"]$/gmu)?.length, 2);
});

test('Plite CI watches and typechecks the bounded www adopter surface', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );
  const config = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'apps/www/tsconfig.package-integration.json'),
      'utf-8'
    )
  );

  assert.equal(
    workflow.match(
      /^\s+- ['"]apps\/www\/src\/app\/dev\/editor-perf\/\*\*['"]$/gmu
    )?.length,
    2
  );
  assert.doesNotMatch(workflow, /check:plite:adopters/u);
  assert.ok(config.include.includes('src/app/dev/editor-perf/**/*.ts'));
  assert.ok(config.include.includes('src/app/dev/editor-perf/**/*.tsx'));
  assert.ok(config.include.includes('src/types/**/*.d.ts'));
  assert.ok(config.include.includes('../../packages/*/src/**/*.d.ts'));
  assert.ok(
    config.include.includes('src/__tests__/package-integration/**/*.ts')
  );
  for (const extension of ['ts', 'tsx']) {
    const input = `apps/www/src/registry/components/editor/**/*.${extension}`;

    assert.equal(
      workflow.match(
        new RegExp(
          `^\\s+- ['"]${input.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]$`,
          'gmu'
        )
      )?.length,
      2,
      input
    );
    assert.ok(
      config.include.includes(
        `src/registry/components/editor/**/*.${extension}`
      )
    );
  }
});

test('Plite CI cache action inputs do not duplicate their exact key', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );
  const restore = workflow.match(
    /- name: Restore Chromium browser proof state(?<block>[\s\S]*?)(?=\n\s+- name:)/u
  )?.groups?.block;

  assert.ok(restore, 'missing Chromium proof-state restore step');
  assert.equal(restore.match(/^\s+key:/gmu)?.length, 1);
});

test('Plite CI browser containers use a root-owned home', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );

  assert.match(workflow, /project: \[firefox, mobile\]/u);
  assert.equal(workflow.match(/^\s+HOME: \/root$/gmu)?.length, 2);
});

test('Plite workflows route benchmark authorities to one package-check owner', () => {
  const pliteWorkflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );
  const packageWorkflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/ci.yml'),
    'utf-8'
  );

  for (const input of [
    'benchmarks/editor/benchmarks/plite-*',
    'benchmarks/slate-v2/donor/core/current/**',
    'benchmarks/slate-v2/donor/shared/**',
    'packages/plitejs/**',
    'tooling/entrypoints/**',
    'tooling/scripts/entrypoint-turbo*.mjs',
    'tooling/scripts/run-entrypoint-*.mjs',
  ]) {
    const escaped = input.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

    assert.equal(
      pliteWorkflow.match(new RegExp(`^\\s+- ['"]${escaped}['"]$`, 'gmu'))
        ?.length,
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
    'tooling/scripts/generate-entrypoint-turbo.mjs',
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
      pliteWorkflow.match(new RegExp(`^\\s+- ['"]${escaped}['"]$`, 'gmu'))
        ?.length,
      2,
      input
    );
  }

  assert.match(packageWorkflow, /name: 🧪 Check Plate and Plite packages/u);
  assert.match(packageWorkflow, /pnpm plite:test/u);
  assert.match(packageWorkflow, /pnpm plite:bench:targets:check/u);
  assert.match(packageWorkflow, /pnpm plite:public-types/u);
  assert.doesNotMatch(pliteWorkflow, /^ {2}packages:$/mu);
  assert.doesNotMatch(pliteWorkflow, /plite:bench:targets:run/u);
});

test('Plite runtime has no redundant package-adopter lane', () => {
  const runtime = createAffectedPlan(['packages/plitejs/src/index.ts']);

  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );
  const sourceTypecheck = fs.readFileSync(
    path.join(repoRoot, 'tooling/scripts/typecheck-package-source.mjs'),
    'utf-8'
  );

  assert.deepEqual(runtime.adopterPackageNames, []);
  assert.doesNotMatch(workflow, /^ {2}plite-adopters:$/mu);
  assert.doesNotMatch(workflow, /check:plite:adopters/u);
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

test('Plate runtime fans out to all adopters', () => {
  const core = createAffectedPlan(['packages/platejs/src/index.ts']);

  assert.deepEqual(core.packageNames, ['platejs', '@platejs/test']);
  assert.deepEqual(core.adopterPackageNames, adopterNames);
  assert.deepEqual(core.typecheckPackageNames, [
    'platejs',
    '@platejs/test',
    ...adopterNames,
    'plite',
  ]);
  assert.deepEqual(core.testPackageNames, ['platejs', '@platejs/test']);
  assert.equal(core.browserSmoke, true);
});

test('root scripts keep source-first typecheck and strict browser closure separate', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );
  const { scripts } = packageJson;

  assert.equal(
    scripts['check:plite'],
    'node tooling/scripts/check-plite.mjs strict'
  );
  assert.equal(scripts['check:plite:adopters'], undefined);
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
    'tooling/scripts/entrypoint-turbo.slow.test.mjs',
    'tooling/scripts/entrypoint-turbo.test.mjs',
    'tooling/scripts/plite-source-aliases.test.mjs',
    'tooling/scripts/plite-source-aliases.slow.test.mjs',
    'tooling/scripts/run-bounded-process.test.mjs',
    'tooling/scripts/run-bounded-process.slow.test.mjs',
    'tooling/scripts/test-suite-routing.test.mjs',
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
    'pnpm plite:packages:build && tsc --project packages/plitejs/test/tsconfig.public-package-types.json --noEmit'
  );
  assert.match(
    scripts['plite:typecheck'],
    /^turbo run typecheck --filter=plitejs --filter=platejs --filter=@platejs\/test --concurrency=8/u
  );
  assert.doesNotMatch(scripts['plite:typecheck'], /\bbuild\b/u);
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
      'utf-8'
    )
  );

  assert.equal(config.extends, './tsconfig.json');
  assert.equal(config.compilerOptions?.paths, undefined);
});

test('root CI owns Plate and Plite package proof without workflow duplication', () => {
  const workflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/ci.yml'),
    'utf-8'
  );
  const pliteWorkflow = fs.readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );
  const packageProof = workflow.match(
    /- name: 🧪 Check Plate and Plite packages(?<body>[\s\S]*?)(?=\n\s+- name:)/u
  )?.groups?.body;

  assert.ok(packageProof, 'missing root package proof step');
  assert.ok(
    packageProof.indexOf('pnpm plite:browser:install chromium') <
      packageProof.indexOf('pnpm plite:test'),
    'root package proof must install Chromium before browser-backed tests'
  );
  assert.doesNotMatch(pliteWorkflow, /^ {2}packages:$/mu);
  assert.doesNotMatch(pliteWorkflow, /pnpm plite:test/u);
});

test('workflows contain no retired Plite package owners', () => {
  const workflows = ['ci.yml', 'plite-ci.yml']
    .map((filename) =>
      fs.readFileSync(
        path.join(repoRoot, '.github/workflows', filename),
        'utf-8'
      )
    )
    .join('\n');

  for (const retiredPath of [
    'packages/plite/',
    'packages/plite-dom/',
    'packages/plite-history/',
    'packages/plite-hyperscript/',
    'packages/plite-layout/',
    'packages/plite-react/',
  ]) {
    assert.equal(workflows.includes(retiredPath), false, retiredPath);
  }
  assert.equal(
    fs.existsSync(path.join(repoRoot, '.github/workflows/plite-deps-pr.yml')),
    false
  );
});

test('every declared Plite-family dependency resolves to source during typecheck', () => {
  for (const { dependencies, root } of plitePackages) {
    const config = JSON.parse(
      fs.readFileSync(path.join(repoRoot, root, 'tsconfig.json'), 'utf-8')
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
