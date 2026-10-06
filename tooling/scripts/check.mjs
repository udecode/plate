import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

const packageDiff = () =>
  spawnSync(
    'bash',
    [
      '-c',
      'git diff --no-ext-diff -- packages; git ls-files --others --exclude-standard -- packages',
    ],
    { cwd: root, encoding: 'utf-8', maxBuffer: 1024 * 1024 * 256 }
  ).stdout;

export const steps = [
  { name: 'lint', run: 'pnpm lint', fix: 'pnpm lint:fix' },
  { name: 'lint-type-aware', run: 'pnpm lint:type-aware' },
  {
    name: 'lint-baseline',
    run: 'node tooling/oxlint/plate-baseline.mjs --check',
    fix: 'pnpm lint:baseline',
  },
  { name: 'typecheck', run: 'pnpm typecheck' },
  { name: 'plite-app-typecheck', run: 'pnpm --filter plite typecheck' },
  { name: 'type-tests', run: 'pnpm test:types' },
  { name: 'test', run: 'pnpm test' },
  { name: 'test-slow', run: 'pnpm test:slow' },
  { name: 'plite-test', run: 'pnpm plite:test' },
  { name: 'bench-targets', run: 'pnpm plite:bench:targets:check' },
  { name: 'public-types', run: 'pnpm plite:public-types' },
  { name: 'cli-test', run: 'pnpm --filter @platejs/cli test' },
  { name: 'core-audits', run: 'pnpm check:core' },
  { name: 'plite-bridge', run: 'node tooling/scripts/check-plite-bridge.mjs' },
  {
    name: 'entrypoint-graph',
    run: 'pnpm entrypoint:turbo:check',
    write: 'pnpm entrypoint:turbo:generate',
  },
  {
    name: 'registry-changelog',
    run: 'node tooling/scripts/generate-ui-changelog-entries.mjs --check',
    write: 'node tooling/scripts/generate-ui-changelog-entries.mjs --write',
  },
  {
    name: 'bench-report',
    run: 'node tooling/scripts/bench-targets.mjs report --check',
    write: 'node tooling/scripts/bench-targets.mjs report',
  },
  {
    name: 'skill-mirrors',
    run: 'node .agents/rules/plate-next/scripts/sync-resources.mjs --check',
    fix: 'pnpm install',
  },
  {
    name: 'review-ledger',
    run: 'node tooling/scripts/review-ledger.mjs check',
  },
  { name: 'manifests', run: 'pnpm test:manifests' },
  {
    name: 'toolbar-variants',
    run: 'pnpm --filter www check:toolbar-variants',
  },
  {
    name: 'barrels',
    run: 'pnpm brl',
    unchangedFiles: packageDiff,
    write: 'pnpm brl',
  },
  {
    // www typecheck and its generators run the plate CLI from packages/cli/dist.
    name: 'www',
    run: 'pnpm --filter @platejs/cli build && pnpm --filter www typecheck && pnpm build:www:ci',
    write:
      'pnpm --filter @platejs/cli build && pnpm --filter www editor:generate && pnpm --filter www api-reference && pnpm --filter www build:registry',
  },
];

export const manualOnly = {
  'bench:editor:check':
    'Checks the separate benchmarks/editor npm project, which needs its own npm install.',
  'check:docs':
    'Runs commands that the www-typecheck step already runs through www typecheck.',
  'check:plate-feature':
    'Validates the feature plan passed as its argument; the Build playbook runs it on that plan.',
  'check:plite': 'Plans and runs Plite browser proof, which plite-ci.yml owns.',
  'check:plite:browser-matrix':
    'Runs the full browser matrix, which plite-ci.yml runs on workflow_dispatch.',
  'check:plite:contracts':
    'Runs tooling contract tests that the test and test-slow steps already run.',
  'check:plite:dev': 'Plans Plite proof from changed paths for plite-ci.yml.',
  'check:plite:packages':
    'Runs plite:typecheck, plite:test and check:plite:contracts, which other steps cover.',
  'deps:check': 'Lists available dependency updates; it gates nothing.',
  'g:typecheck:all':
    'Typechecks every workspace, which the typecheck, plite-app-typecheck and www-typecheck steps cover.',
  'p:test': 'Template that each package test script calls.',
  'p:typecheck': 'Template that each package typecheck script calls.',
  'plite:browser:test':
    'Runs the @platejs/test package tests, which the plite-test step runs.',
  'plite:browser:test:proof':
    'Runs two @platejs/test proof files that the plite-test step runs.',
  'plite:browser:test:selection':
    'Runs the vitest browser selection suite, which needs a browser runner; no CI job runs it.',
  'plite:typecheck':
    'Typechecks plitejs, platejs and @platejs/test, which the typecheck step covers.',
  'templates:check':
    'templates/** is CI-generated output; ci-templates.yml builds it.',
  'templates:test':
    'Installs registry items into templates/**, which CI generates.',
  'test:all': 'Runs the test and test-slow steps as one command.',
  'test:coverage': 'Reports coverage for the fast suite; it gates nothing.',
  'test:deferred':
    'Runs quarantined __deferred__ specs, which are kept out of every gate.',
  'test:mobile-device-proof': 'Needs a connected phone or emulator.',
  'test:mobile-device-proof:raw': 'Needs a connected phone or emulator.',
  'test:plite:browser': 'Runs Plite browser proof, which plite-ci.yml owns.',
  'test:plite:full':
    'Runs plite:test and Plite browser proof, which the plite-test step and plite-ci.yml cover.',
  'test:profile':
    'Timing report; the owner keeps aggregate timing out of the gate.',
  'test:slowest':
    'Timing report; the owner keeps aggregate timing out of the gate.',
  'test:watch': 'Watch mode.',
  'test:create-install':
    'Installs registry items into disposable workspaces over the network.',
  'test:www-browser:chromium':
    'Runs www Playwright specs against a running www server.',
  'test:www-browser:firefox':
    'Runs www Playwright specs against a running www server.',
  'test:www-browser:webkit':
    'Runs www Playwright specs against a running www server.',
  'typecheck:all': 'Runs g:typecheck:all.',
  'typecheck:watch': 'Watch mode.',
};

const runStep = (step, command, writing) => {
  const started = Date.now();
  const watch = !writing && step.unchangedFiles;
  const before = watch && step.unchangedFiles();
  const result = spawnSync('bash', ['-o', 'pipefail', '-c', command], {
    cwd: root,
    stdio: 'inherit',
  });
  let status = result.status ?? 1;
  if (status === 0 && watch && step.unchangedFiles() !== before) {
    console.error(`[check] ${step.name} changed files under packages/.`);
    status = 1;
  }
  return { seconds: Math.round((Date.now() - started) / 1000), status };
};

const main = () => {
  const args = process.argv.slice(2);
  const writing = args.includes('--write');
  const names = args.filter((arg) => !arg.startsWith('--'));
  if (args.includes('--list')) {
    for (const step of steps) console.info(`${step.name}\t${step.run}`);
    return 0;
  }
  const unknown = names.filter(
    (name) => !steps.some((step) => step.name === name)
  );
  if (unknown.length > 0) {
    console.error(
      `[check] unknown step: ${unknown.join(', ')}. Run pnpm check --list.`
    );
    return 1;
  }

  const selected = steps.filter(
    (step) =>
      (names.length === 0 || names.includes(step.name)) &&
      (!writing || step.write)
  );
  const group = Boolean(process.env.GITHUB_ACTIONS);
  const results = new Map();

  for (const step of selected) {
    const command = writing ? step.write : step.run;
    console.info(
      group ? `::group::${step.name}` : `\n[check] ${step.name}: ${command}`
    );
    results.set(step.name, runStep(step, command, writing));
    if (group) console.info('::endgroup::');
  }

  console.info('\n[check] summary');
  let failed = 0;
  for (const step of selected) {
    const { seconds, status } = results.get(step.name);
    const fix = writing ? null : step.write ? 'pnpm generate' : step.fix;
    if (status !== 0) failed += 1;
    const state =
      status === 0
        ? 'ok'
        : `failed (exit ${status})${fix ? `; fix: ${fix}` : ''}`;
    console.info(
      `  ${step.name.padEnd(20)} ${String(seconds).padStart(4)}s  ${state}`
    );
  }
  if (failed > 0) {
    console.error(`[check] ${failed} of ${selected.length} steps failed.`);
    return 1;
  }
  console.info(`[check] all ${selected.length} steps passed.`);
  return 0;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(main());
}
