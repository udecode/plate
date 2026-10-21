import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, matchesGlob } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BUN_TEST_TIMEOUT_MS,
  TEST_FAST_IGNORE_PATTERNS,
  TEST_FILE_PATTERNS,
} from '../config/test-suites.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

const touches =
  (...prefixes) =>
  (files) =>
    files.some((file) => prefixes.some((prefix) => file.startsWith(prefix)));
const never = () => false;
const matches = (path, file) =>
  path.endsWith('/') ? file.startsWith(path) : file === path;

const PROSE_PATHS = [
  '.agents/',
  '.claude/',
  '.codex/',
  'AGENTS.md',
  'docs/',
  'skills/',
];
const isProse = (file) =>
  /\.(?:md|mdc|tsv)$/u.test(file) &&
  PROSE_PATHS.some((path) => matches(path, file));
const FORMATTER_ONLY = new Set(['skills-lock.json']);
const formatted = (files) => files.some((file) => !isProse(file));
const CODE = /\.(?:[cm]?[jt]sx?|sh)$/u;
const TEST = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;
const BUILD_CONFIG = /(?:^|\/)(?:package|turbo|tsconfig[\w.-]*)\.json$/u;
const inTestSuite = (file) =>
  TEST_FILE_PATTERNS.some((pattern) => matchesGlob(file, pattern)) &&
  !TEST_FAST_IGNORE_PATTERNS.some((pattern) => matchesGlob(file, pattern));
const isToolingScript = (file) =>
  CODE.test(file) &&
  (file.startsWith('tooling/scripts/') || file.startsWith('.agents/'));

const toolingOnlyReaches = new Map();
const toolingOnlyReach = (file) => {
  if (!isToolingScript(file)) return null;
  if (toolingOnlyReaches.has(file)) return toolingOnlyReaches.get(file);
  const scripts = new Set([file]);
  const tests = new Set(TEST.test(file) ? [file] : []);
  const queue = [file];
  while (queue.length > 0) {
    const name = basename(queue.pop()).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
    const { stdout } = spawnSync(
      'git',
      ['grep', '-l', '-P', `(?<![\\w.-])${name}`, '--', ':!docs'],
      { cwd: root, encoding: 'utf-8' }
    );
    for (const hit of stdout.split('\n').filter(Boolean)) {
      if (TEST.test(hit)) {
        tests.add(hit);
      } else if (isToolingScript(hit)) {
        if (scripts.has(hit)) continue;
        scripts.add(hit);
        queue.push(hit);
      } else if (
        hit !== 'package.json' &&
        (CODE.test(hit) || BUILD_CONFIG.test(hit))
      ) {
        toolingOnlyReaches.set(file, null);
        return null;
      }
    }
  }
  const reach = { scripts, tests };
  toolingOnlyReaches.set(file, reach);
  return reach;
};
const source = (files) =>
  files.some(
    (file) =>
      !isProse(file) && !FORMATTER_ONLY.has(file) && !toolingOnlyReach(file)
  );

// A change to one of these can reach every step, so --affected runs them all.
const GLOBAL_PATHS = [
  'bunfig.toml',
  'config/',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tooling/config/',
  'tsconfig.json',
  'turbo.json',
];

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
  { name: 'lint', run: 'pnpm lint', fix: 'pnpm lint:fix', affected: formatted },
  { name: 'lint-type-aware', run: 'pnpm lint:type-aware', affected: source },
  {
    name: 'lint-baseline',
    run: 'node tooling/oxlint/plate-baseline.mjs --check',
    fix: 'pnpm lint:baseline',
    affected: source,
  },
  { name: 'typecheck', run: 'pnpm typecheck', affected: source },
  {
    name: 'plite-app-typecheck',
    run: 'pnpm --filter plite typecheck',
    affected: source,
  },
  { name: 'type-tests', run: 'pnpm test:types', affected: source },
  {
    name: 'test',
    run: 'pnpm test',
    // Bun ignores the www Playwright specs, so editing one cannot change this step.
    affected: (files) =>
      touches(
        '.agents/rules/',
        'apps/',
        'benchmarks/',
        'content/',
        'packages/',
        'tooling/'
      )(
        files.filter(
          (file) =>
            !toolingOnlyReach(file) &&
            !file.startsWith('apps/www/tests/browser/')
        )
      ) || [
        ...new Set(
          files.flatMap((file) =>
            [...(toolingOnlyReach(file)?.tests ?? [])].filter(inTestSuite)
          )
        ),
      ],
  },
  {
    name: 'plite-test',
    run: 'pnpm plite:test',
    affected: touches(
      'packages/platejs/',
      'packages/plitejs/',
      'packages/test/',
      'tooling/entrypoints/'
    ),
  },
  { name: 'bench-targets', run: 'pnpm plite:bench:targets:check' },
  { name: 'public-types', run: 'pnpm plite:public-types', affected: source },
  {
    name: 'cli-test',
    run: `pnpm --filter @platejs/cli run test --timeout=${BUN_TEST_TIMEOUT_MS}`,
    // The CLI tests compile editors against platejs source, which builds on plitejs.
    affected: touches(
      'packages/cli/',
      'packages/platejs/',
      'packages/plitejs/'
    ),
  },
  { name: 'core-audits', run: 'pnpm check:core', affected: source },
  {
    name: 'plite-bridge',
    run: 'node tooling/scripts/check-plite-bridge.mjs',
    affected: source,
  },
  {
    name: 'selection-writes',
    run: 'node tooling/scripts/check-selection-writes.mjs',
  },
  {
    name: 'hook-generics',
    run: 'node tooling/scripts/check-hook-generics.mjs --check',
    fix: 'node tooling/scripts/check-hook-generics.mjs',
    affected: source,
  },
  {
    name: 'value-records',
    run: 'node tooling/scripts/check-value-records.mjs',
    affected: source,
  },
  {
    name: 'entrypoint-graph',
    run: 'pnpm entrypoint:turbo:check',
    write: 'pnpm entrypoint:turbo:generate',
    affected: source,
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
    // Both docs checks judge every plan, so another session's open plan can
    // turn them red; the daily full check runs them instead of each landing.
    name: 'review-ledger',
    run: 'node tooling/scripts/review-ledger.mjs check',
    affected: never,
  },
  {
    name: 'removed-api-teaching',
    run: 'node tooling/scripts/check-removed-api-teaching.mjs',
  },
  {
    name: 'knowledge',
    run: 'node tooling/scripts/knowledge/kb.mjs check',
    fix: 'node tooling/scripts/knowledge/kb.mjs check --lower',
    affected: never,
  },
  { name: 'manifests', run: 'pnpm test:manifests' },
  {
    name: 'toolbar-variants',
    run: 'pnpm --filter www check:toolbar-variants',
    affected: source,
  },
  {
    name: 'barrels',
    run: 'pnpm brl',
    unchangedFiles: packageDiff,
    write: 'pnpm brl',
    affected: source,
  },
  {
    // www typecheck and its generators run the plate CLI from packages/cli/dist.
    name: 'www',
    run: 'pnpm --filter @platejs/cli build && pnpm --filter www typecheck',
    affected: touches('apps/www/', 'content/', 'packages/'),
    write:
      'pnpm --filter @platejs/cli build && pnpm --filter www editor:generate && pnpm --filter www api-reference && pnpm --filter www build:registry',
  },
  {
    name: 'www-build',
    run: 'pnpm build:www:ci',
    optIn: true,
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
    'Runs tooling contract tests that the test step already runs.',
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
  'test:coverage': 'Reports coverage for the root suite; it gates nothing.',
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

export const selectSteps = (args) => {
  const writing = args.includes('--write');
  const building = args.includes('--build');
  const names = args.filter((arg) => !arg.startsWith('--'));
  return steps.filter(
    (step) =>
      ((names.length === 0 ? !step.optIn : names.includes(step.name)) ||
        (building && step.optIn)) &&
      (!writing || step.write)
  );
};

const rootScripts = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
).scripts;
const expand = (command, seen = new Set()) => {
  const parts = [command];
  for (const [, name] of command.matchAll(/pnpm (?:run )?([\w:.-]+)/gu)) {
    if (!rootScripts[name] || seen.has(name)) continue;
    seen.add(name);
    parts.push(expand(rootScripts[name], seen));
  }
  return parts.join('\n');
};

/** Each default step with the command a change to `files` needs, or null. */
export const planAffected = (files) => {
  const everything = files.some((file) =>
    GLOBAL_PATHS.some((path) => matches(path, file))
  );
  const called = new Set(
    files.flatMap((file) =>
      [...(toolingOnlyReach(file)?.scripts ?? [])].map((script) =>
        basename(script)
      )
    )
  );
  const calls = (step) =>
    expand(step.run)
      .split(/[\s"'`;&|()]+/u)
      .some((token) => called.has(basename(token)));
  return steps
    .filter((step) => !step.optIn)
    .map((step) => {
      if (!step.affected) return { step, command: step.run };
      if (step.affected === never) return { step, command: null };
      if (everything || calls(step)) return { step, command: step.run };
      const hit = step.affected(files);
      if (!Array.isArray(hit)) return { step, command: hit ? step.run : null };
      return {
        step,
        command:
          hit.length > 0
            ? `${step.run} ${hit.map((file) => `'${file}'`).join(' ')}`
            : null,
      };
    });
};

const changedFiles = () => {
  const { branch } = JSON.parse(
    readFileSync(new URL('../../.agents/pstack.json', import.meta.url), 'utf-8')
  );
  const git = (...args) =>
    spawnSync('git', args, {
      cwd: root,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 64,
    });
  const base = git('merge-base', `origin/${branch}`, 'HEAD');
  if (base.status !== 0) {
    throw new Error(
      `[check] no merge base with origin/${branch}; run git fetch origin ${branch}.`
    );
  }
  const lines = (result) => result.stdout.split('\n').filter(Boolean);
  return [
    ...new Set([
      ...lines(git('diff', '--name-only', base.stdout.trim())),
      ...lines(git('ls-files', '--others', '--exclude-standard')),
    ]),
  ];
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
    for (const step of steps) {
      console.info(
        `${step.name}\t${step.run}${step.optIn ? '\t(opt-in: --build or by name)' : ''}`
      );
    }
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
  if (writing && args.includes('--build')) {
    console.error(
      '[check] --build runs a step with no writer; run it without --write.'
    );
    return 1;
  }
  const affected = args.includes('--affected');
  if (affected && (writing || args.includes('--build') || names.length > 0)) {
    console.error(
      '[check] --affected picks its own steps; run it without step names, --write or --build.'
    );
    return 1;
  }

  let selected;
  if (affected) {
    const files = changedFiles();
    const plan = planAffected(files);
    console.info(
      `[check] --affected: ${files.length} changed files since the merge base`
    );
    for (const { step, command } of plan) {
      if (!command) console.info(`  skip ${step.name}`);
    }
    selected = plan.filter(({ command }) => command);
  } else {
    selected = selectSteps(args).map((step) => ({
      step,
      command: writing ? step.write : step.run,
    }));
  }
  const group = Boolean(process.env.GITHUB_ACTIONS);
  const results = new Map();

  for (const { step, command } of selected) {
    console.info(
      group ? `::group::${step.name}` : `\n[check] ${step.name}: ${command}`
    );
    results.set(step.name, runStep(step, command, writing));
    if (group) console.info('::endgroup::');
  }

  console.info('\n[check] summary');
  let failed = 0;
  for (const { step } of selected) {
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
