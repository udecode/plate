#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const commandPartPattern = /^[\w./:@=-]+$/;
const lineBreakPattern = /\r?\n/;
const leadingDotSlashPattern = /^\.\//;

export const repoRoot = path.resolve(scriptRoot, '../..');

export const plitePackages = Object.freeze([
  Object.freeze({
    dependencies: Object.freeze([]),
    name: '@platejs/plite',
    root: 'packages/plite',
  }),
  Object.freeze({
    dependencies: Object.freeze(['@platejs/plite']),
    name: '@platejs/plite-dom',
    root: 'packages/plite-dom',
  }),
  Object.freeze({
    dependencies: Object.freeze(['@platejs/plite']),
    name: '@platejs/plite-history',
    root: 'packages/plite-history',
  }),
  Object.freeze({
    dependencies: Object.freeze(['@platejs/plite']),
    name: '@platejs/plite-hyperscript',
    root: 'packages/plite-hyperscript',
  }),
  Object.freeze({
    dependencies: Object.freeze([
      '@platejs/plite',
      '@platejs/plite-dom',
      '@platejs/plite-history',
      '@platejs/plite-hyperscript',
    ]),
    name: '@platejs/plite-react',
    root: 'packages/plite-react',
  }),
  Object.freeze({
    dependencies: Object.freeze(['@platejs/plite', '@platejs/plite-react']),
    name: '@platejs/plite-layout',
    root: 'packages/plite-layout',
  }),
  Object.freeze({
    dependencies: Object.freeze([]),
    name: '@platejs/browser',
    root: 'packages/browser',
  }),
  Object.freeze({
    dependencies: Object.freeze([
      '@platejs/plite',
      '@platejs/plite-history',
      '@platejs/plite-react',
    ]),
    name: '@platejs/yjs',
    root: 'packages/yjs',
  }),
]);

export const plateAdopterPackages = Object.freeze(
  [
    ['core', '@platejs/core'],
    ['ai', '@platejs/ai'],
    ['basic-nodes', '@platejs/basic-nodes'],
    ['basic-styles', '@platejs/basic-styles'],
    ['callout', '@platejs/callout'],
    ['caption', '@platejs/caption'],
    ['code-block', '@platejs/code-block'],
    ['code-drawing', '@platejs/code-drawing'],
    ['combobox', '@platejs/combobox'],
    ['comment', '@platejs/comment'],
    ['csv', '@platejs/csv'],
    ['cursor', '@platejs/cursor'],
    ['date', '@platejs/date'],
    ['diff', '@platejs/diff'],
    ['dnd', '@platejs/dnd'],
    ['docx', '@platejs/docx'],
    ['docx-io', '@platejs/docx-io'],
    ['emoji', '@platejs/emoji'],
    ['excalidraw', '@platejs/excalidraw'],
    ['find-replace', '@platejs/find-replace'],
    ['floating', '@platejs/floating'],
    ['footnote', '@platejs/footnote'],
    ['indent', '@platejs/indent'],
    ['juice', '@platejs/juice'],
    ['layout', '@platejs/layout'],
    ['link', '@platejs/link'],
    ['list', '@platejs/list'],
    ['list-classic', '@platejs/list-classic'],
    ['markdown', '@platejs/markdown'],
    ['math', '@platejs/math'],
    ['media', '@platejs/media'],
    ['mention', '@platejs/mention'],
    ['plate', 'platejs'],
    ['resizable', '@platejs/resizable'],
    ['selection', '@platejs/selection'],
    ['slash-command', '@platejs/slash-command'],
    ['suggestion', '@platejs/suggestion'],
    ['tabbable', '@platejs/tabbable'],
    ['table', '@platejs/table'],
    ['tag', '@platejs/tag'],
    ['test-utils', '@platejs/test-utils'],
    ['toc', '@platejs/toc'],
    ['toggle', '@platejs/toggle'],
    ['utils', '@platejs/utils'],
  ].map(([slug, name]) => Object.freeze({ name, root: `packages/${slug}` }))
);

const packageByRoot = new Map(
  plitePackages.map((definition) => [definition.root, definition])
);
const packageOrder = new Map(
  plitePackages.map((definition, index) => [definition.name, index])
);
const adopterByRoot = new Map(
  plateAdopterPackages.map((definition) => [definition.root, definition])
);
const adopterOrder = new Map(
  plateAdopterPackages.map((definition, index) => [definition.name, index])
);
const allPackageNames = plitePackages.map(({ name }) => name);
const fixturePackageNames = Object.freeze([
  '@platejs/plite',
  '@platejs/plite-history',
  '@platejs/plite-hyperscript',
]);
const globalInputs = new Set([
  '.npmrc',
  'bunfig.toml',
  'config/plite-source-aliases.ts',
  'config/plite-source-test-setup.ts',
  'config/workspace-source-entries.mjs',
  'package.json',
  'packages/core/bunfig.toml',
  'packages/plate-scripts/run-with-pkg-dir.cjs',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'postcss.config.mjs',
  'tooling/scripts/typecheck-package-source.mjs',
  'tsconfig.json',
  'turbo.json',
]);
const sharedAppFiles = new Set([
  'apps/www/package.json',
  'apps/www/postcss.config.js',
  'apps/www/src/app/globals.css',
  'apps/www/src/components/icons.tsx',
  'apps/www/src/components/preview-dev-overlay-styles.tsx',
  'apps/www/src/components/themed-syntax-highlighter.tsx',
  'apps/www/src/hooks/use-copy-to-clipboard.ts',
  'apps/www/src/hooks/use-mobile.ts',
  'apps/www/src/lib/utils.ts',
  'apps/www/src/registry/hooks/use-mounted.ts',
  'apps/www/src/utils/cn.ts',
  'apps/www/tsconfig.package-integration.json',
  'apps/www/tsconfig.json',
]);
const proofContractInputs = new Set([
  'benchmarks/editor/benchmarks/benchmark-artifact.ts',
  'benchmarks/editor/benchmarks/benchmark-artifact.test.ts',
  'benchmarks/targets/slate-v2.json',
  'tooling/scripts/bench-targets.mjs',
  'tooling/scripts/bench-targets.test.mjs',
  'tooling/scripts/bench-targets.slow.test.mjs',
  'tooling/scripts/check-package-build-artifacts.test.mjs',
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
]);

const normalizePath = (file) =>
  file.replaceAll('\\', '/').replace(leadingDotSlashPattern, '').trim();

const isPathWithin = (file, root) =>
  file === root || file.startsWith(`${root}/`);

const isBenchmarkContractInput = (file) =>
  (isPathWithin(file, 'benchmarks/editor/benchmarks') &&
    path.basename(file).startsWith('plite-')) ||
  isPathWithin(file, 'benchmarks/slate-v2/donor/core/current') ||
  isPathWithin(file, 'benchmarks/slate-v2/donor/shared');

const testFilePattern = /\.(?:spec|test)\.[cm]?[jt]sx?$/;

const isTestPackageInput = (file, root) =>
  isPathWithin(file, `${root}/test`) || testFilePattern.test(file);

const isRuntimePackageInput = (file, root) =>
  !isTestPackageInput(file, root) &&
  (isPathWithin(file, `${root}/src`) ||
    file === `${root}/package.json` ||
    file === `${root}/tsconfig.json` ||
    file === `${root}/tsconfig.build.json` ||
    file === `${root}/tsdown.config.mts` ||
    file === `${root}/tsdown.config.ts`);

const addDownstreamPackages = (names) => {
  let changed = true;

  while (changed) {
    changed = false;

    for (const definition of plitePackages) {
      if (
        !names.has(definition.name) &&
        definition.dependencies.some((dependency) => names.has(dependency))
      ) {
        names.add(definition.name);
        changed = true;
      }
    }
  }
};

const orderedNames = (names) =>
  [...names].sort(
    (left, right) => packageOrder.get(left) - packageOrder.get(right)
  );

const orderedAdopterNames = (names) =>
  [...names].sort(
    (left, right) => adopterOrder.get(left) - adopterOrder.get(right)
  );

export const createAffectedPlan = (changedFiles) => {
  const normalizedFiles = [...new Set(changedFiles.map(normalizePath))].filter(
    Boolean
  );
  const affected = new Set();
  const affectedAdopterTests = new Set();
  const affectedAdopterTypechecks = new Set();
  const runtimeAffected = new Set();
  let adopterRuntimeImpact = false;
  let appTypecheck = false;
  let browserSmoke = false;
  let contracts = false;
  let relevant = false;
  let wwwTypecheck = false;

  for (const file of normalizedFiles) {
    if (
      file === 'config/plite-test-jsx.js' ||
      file === 'config/plite-test-jsx-globals.d.ts'
    ) {
      for (const name of fixturePackageNames) affected.add(name);
      relevant = true;
      continue;
    }

    if (
      globalInputs.has(file) ||
      isPathWithin(file, 'tooling/config') ||
      file === 'tooling/scripts/check-package-build-artifacts.mjs'
    ) {
      for (const name of allPackageNames) affected.add(name);
      for (const { name } of plateAdopterPackages) {
        affectedAdopterTypechecks.add(name);
      }
      appTypecheck = true;
      browserSmoke = true;
      contracts = true;
      relevant = true;
      continue;
    }

    if (
      file === 'tooling/scripts/check-plite.mjs' ||
      file === 'tooling/scripts/check-plite.test.mjs'
    ) {
      contracts = true;
      relevant = true;
      continue;
    }

    if (proofContractInputs.has(file) || isBenchmarkContractInput(file)) {
      contracts = true;
      relevant = true;
      if (file === 'tooling/scripts/run-bounded-process.mjs') {
        browserSmoke = true;
      }
      continue;
    }

    if (file === '.github/workflows/plite-ci.yml') {
      contracts = true;
      relevant = true;
      continue;
    }

    const packageEntry = [...packageByRoot.entries()].find(([root]) =>
      isPathWithin(file, root)
    );

    if (packageEntry) {
      const [root, definition] = packageEntry;

      affected.add(definition.name);
      relevant = true;

      if (isRuntimePackageInput(file, root)) {
        runtimeAffected.add(definition.name);
        if (
          definition.name !== '@platejs/browser' &&
          definition.name !== '@platejs/yjs'
        ) {
          adopterRuntimeImpact = true;
        }
        browserSmoke = true;
        if (definition.name !== '@platejs/browser') appTypecheck = true;
      }

      continue;
    }

    if (isPathWithin(file, 'packages/core')) {
      affectedAdopterTests.add('@platejs/core');
      affectedAdopterTypechecks.add('@platejs/core');
      relevant = true;

      if (isRuntimePackageInput(file, 'packages/core')) {
        for (const { name } of plateAdopterPackages) {
          affectedAdopterTypechecks.add(name);
        }
        affected.add('@platejs/yjs');
        appTypecheck = true;
        browserSmoke = true;
      }

      continue;
    }

    const adopterEntry = [...adopterByRoot.entries()].find(([root]) =>
      isPathWithin(file, root)
    );

    if (adopterEntry) {
      affectedAdopterTests.add(adopterEntry[1].name);
      affectedAdopterTypechecks.add(adopterEntry[1].name);
      relevant = true;
      continue;
    }

    if (isPathWithin(file, 'packages/udecode')) {
      appTypecheck = true;
      browserSmoke = true;
      relevant = true;
      continue;
    }

    if (isPathWithin(file, 'apps/plite/scripts')) {
      contracts = true;
      browserSmoke = true;
      relevant = true;
      continue;
    }

    if (
      isPathWithin(file, 'apps/www/src/app/dev/editor-perf') ||
      isPathWithin(file, 'apps/www/src/registry/components/editor/plugins')
    ) {
      relevant = true;
      wwwTypecheck = true;
      continue;
    }

    if (
      isPathWithin(file, 'apps/plite/src') ||
      file === 'apps/plite/next.config.ts' ||
      file === 'apps/plite/package.json' ||
      file === 'apps/plite/playwright.config.ts' ||
      file === 'apps/plite/tsconfig.json' ||
      isPathWithin(file, 'apps/www/src/app/(app)/examples/plite') ||
      isPathWithin(file, 'apps/www/src/components/ui') ||
      isPathWithin(file, 'apps/www/src/types') ||
      sharedAppFiles.has(file)
    ) {
      appTypecheck = true;
      browserSmoke = true;
      if (
        file === 'apps/plite/package.json' ||
        file === 'apps/plite/playwright.config.ts'
      ) {
        contracts = true;
      }
      if (
        file === 'apps/www/tsconfig.json' ||
        file === 'apps/www/tsconfig.package-integration.json'
      ) {
        wwwTypecheck = true;
      }
      relevant = true;
      continue;
    }

    if (isPathWithin(file, 'apps/plite/tests/plite-browser')) {
      browserSmoke = true;
      contracts = true;
      relevant = true;
    }
  }

  addDownstreamPackages(runtimeAffected);
  for (const name of runtimeAffected) affected.add(name);
  if (adopterRuntimeImpact) {
    for (const { name } of plateAdopterPackages) {
      affectedAdopterTypechecks.add(name);
    }
  }

  const packageNames = orderedNames(affected);
  const adopterPackageNames = orderedAdopterNames(affectedAdopterTypechecks);
  const adopterTestPackageNames = orderedAdopterNames(affectedAdopterTests);

  return Object.freeze({
    adopterPackageNames: Object.freeze(adopterPackageNames),
    adopterTestPackageNames: Object.freeze(adopterTestPackageNames),
    appTypecheck,
    browserSmoke,
    changedFiles: Object.freeze(normalizedFiles),
    contracts,
    packageNames: Object.freeze(packageNames),
    relevant,
    testPackageNames: Object.freeze([
      ...packageNames,
      ...adopterTestPackageNames,
    ]),
    typecheckPackageNames: Object.freeze([
      ...packageNames,
      ...adopterPackageNames,
      ...(appTypecheck ? ['plite'] : []),
    ]),
    wwwTypecheck,
  });
};

export const getComparisonBase = (environment = process.env) =>
  environment.PLITE_CHECK_BASE ?? environment.GITHUB_BASE_SHA ?? null;

const pnpmStep = (id, args) => Object.freeze({ args, command: 'pnpm', id });
const DEV_WORKSPACE_CONCURRENCY = '8';

const packageTypecheckStep = (packageNames) =>
  pnpmStep('typecheck', [
    `--workspace-concurrency=${DEV_WORKSPACE_CONCURRENCY}`,
    ...packageNames.flatMap((name) => ['--filter', name]),
    'typecheck',
  ]);

const packageTestStep = (packageNames) =>
  pnpmStep('package-tests', [
    `--workspace-concurrency=${DEV_WORKSPACE_CONCURRENCY}`,
    ...packageNames.flatMap((name) => ['--filter', name]),
    'test',
  ]);

const browserCoreTestStep = () =>
  pnpmStep('browser-core-tests', ['--filter', '@platejs/browser', 'test:core']);

export const createCheckSteps = (mode, affectedPlan) => {
  if (mode === 'strict' || mode === 'packages') {
    const steps = [
      pnpmStep('typecheck', ['plite:typecheck']),
      pnpmStep('package-tests', ['plite:test']),
      pnpmStep('contracts', ['check:plite:contracts']),
    ];

    if (mode === 'strict') {
      steps.push(
        pnpmStep('browser-chromium', [
          '--filter',
          'plite',
          'test:plite-browser:chromium',
        ])
      );
    }

    return Object.freeze(steps);
  }

  if (mode === 'adopters') {
    if (!affectedPlan) {
      throw new Error('Adopter mode requires an affected plan.');
    }

    return Object.freeze(
      affectedPlan.adopterPackageNames.length > 0
        ? [packageTypecheckStep(affectedPlan.adopterPackageNames)]
        : []
    );
  }

  if (mode !== 'dev') {
    throw new Error(`Unknown Plite check mode "${mode}".`);
  }
  if (!affectedPlan) {
    throw new Error('Dev mode requires an affected plan.');
  }

  const steps = [];

  if (affectedPlan.typecheckPackageNames.length > 0) {
    steps.push(packageTypecheckStep(affectedPlan.typecheckPackageNames));
  }
  if (affectedPlan.wwwTypecheck) {
    steps.push(
      pnpmStep('www-typecheck', [
        '--filter',
        'www',
        'exec',
        'tsc',
        '--noEmit',
        '-p',
        'tsconfig.package-integration.json',
      ])
    );
  }
  if (affectedPlan.testPackageNames.length > 0) {
    const packageNames = affectedPlan.testPackageNames.filter(
      (name) => name !== '@platejs/browser'
    );

    if (packageNames.length > 0) {
      steps.push(packageTestStep(packageNames));
    }
    if (packageNames.length !== affectedPlan.testPackageNames.length) {
      steps.push(browserCoreTestStep());
    }
  }
  if (affectedPlan.contracts) {
    steps.push(pnpmStep('contracts', ['check:plite:contracts']));
  }
  if (affectedPlan.browserSmoke) {
    steps.push(
      pnpmStep('browser-smoke', [
        '--filter',
        'plite',
        'test:plite-browser:smoke',
      ])
    );
  }

  return Object.freeze(steps);
};

const readGitLines = (args) => {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) return null;

  return result.stdout
    .split(lineBreakPattern)
    .map(normalizePath)
    .filter(Boolean);
};

export const collectChangedFiles = () => {
  if (process.env.PLITE_CHECK_CHANGED_FILES !== undefined) {
    return process.env.PLITE_CHECK_CHANGED_FILES.split(lineBreakPattern)
      .map(normalizePath)
      .filter(Boolean);
  }

  const files = new Set();
  const comparisonBase = getComparisonBase();
  const base = comparisonBase
    ? readGitLines(['merge-base', 'HEAD', comparisonBase])?.[0]
    : null;

  if (comparisonBase && !base) return null;

  const commands = [
    ...(base
      ? [['diff', '--name-only', '--diff-filter=ACMRD', `${base}...HEAD`]]
      : []),
    ['diff', '--name-only', '--diff-filter=ACMRD', 'HEAD'],
    ['ls-files', '--others', '--exclude-standard'],
  ];

  for (const args of commands) {
    const result = readGitLines(args);

    if (result === null) return null;
    for (const file of result) files.add(file);
  }

  return [...files].sort();
};

const formatCommand = ({ args, command }) =>
  [command, ...args]
    .map((part) =>
      commandPartPattern.test(part) ? part : JSON.stringify(part)
    )
    .join(' ');

const writeSummary = (summary) => {
  const outputDirectory = path.join(repoRoot, '.tmp/plite-check');

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(outputDirectory, `${summary.mode}.json`),
    `${JSON.stringify(summary, null, 2)}\n`
  );
  console.log(`PLITE_CHECK_SUMMARY ${JSON.stringify(summary)}`);
};

const run = () => {
  const mode = process.argv[2] ?? 'dev';
  const dryRun = process.argv.includes('--dry-run');
  const startedAt = performance.now();
  let changedFiles;
  let affectedPlan;

  if (mode === 'dev' || mode === 'adopters') {
    changedFiles =
      mode === 'adopters' &&
      process.env.GITHUB_EVENT_NAME === 'workflow_dispatch'
        ? ['packages/plite/src/index.ts']
        : collectChangedFiles();
    affectedPlan =
      changedFiles === null
        ? createAffectedPlan([...globalInputs])
        : createAffectedPlan(changedFiles);
  }

  const steps = createCheckSteps(mode, affectedPlan);
  const planSummary = {
    affected: affectedPlan,
    mode,
    steps: steps.map((step) => ({
      command: formatCommand(step),
      id: step.id,
    })),
  };

  if (dryRun) {
    console.log(JSON.stringify(planSummary, null, 2));
    return 0;
  }

  if (steps.length === 0) {
    const summary = {
      ...planSummary,
      durationMs: Math.round(performance.now() - startedAt),
      status: 'passed',
      timings: [],
    };

    console.log('No Plite development proof is affected by the current diff.');
    writeSummary(summary);
    return 0;
  }

  const timings = [];

  for (const step of steps) {
    const stepStartedAt = performance.now();

    console.log(`\n[plite:${mode}] ${step.id}: ${formatCommand(step)}`);
    const result = spawnSync(step.command, step.args, {
      cwd: repoRoot,
      env: process.env,
      stdio: 'inherit',
    });
    const durationMs = Math.round(performance.now() - stepStartedAt);

    const status = result.status ?? 1;

    timings.push({ durationMs, id: step.id, status });

    if (result.error || status !== 0) {
      writeSummary({
        ...planSummary,
        durationMs: Math.round(performance.now() - startedAt),
        error: result.error?.message,
        failedStep: step.id,
        status: 'failed',
        timings,
      });

      return status;
    }
  }

  writeSummary({
    ...planSummary,
    durationMs: Math.round(performance.now() - startedAt),
    status: 'passed',
    timings,
  });

  return 0;
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exit(run());
}
