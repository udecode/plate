import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, extname, join, matchesGlob } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BUN_TEST_TIMEOUT_MS,
  TEST_FAST_IGNORE_PATTERNS,
  TEST_FILE_PATTERNS,
} from '../config/test-suites.mjs';
import { freshRun, openCache } from './check-cache.mjs';
import { mentionsOutsideComments } from './import-graph.mjs';
import { FROZEN, indexPatterns } from './knowledge/knowledge.mjs';
import { hasPrivateHalf, trackedFiles } from './private-files.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

const touches =
  (...prefixes) =>
  (files) =>
    files.some((file) => prefixes.some((prefix) => file.startsWith(prefix)));
const never = () => false;
const matches = (path, file) =>
  path.endsWith('/') ? file.startsWith(path) : file === path;

const UNLINTED_PATHS = [
  '.agents/',
  '.claude/',
  '.codex/',
  'AGENTS.md',
  'docs/',
  'skills/',
];
const PROSE = /\.(?:md|mdc|tsv)$/u;
const unlinted = (file) =>
  PROSE.test(file) && UNLINTED_PATHS.some((path) => matches(path, file));
export const isProse = (file) =>
  PROSE.test(file) && (!file.includes('/') || unlinted(file));
const FORMATTER_ONLY = new Set(['skills-lock.json']);
const formatted = (files) => files.some((file) => !unlinted(file));
const CODE = /\.(?:[cm]?[jt]sx?|sh)$/u;
const RESOLVER_CONFIG = /(?:^|\/)(?:tsconfig[^/]*|package)\.json$/u;
const canRetargetImports = (files, retargeted) =>
  retargeted.length > 0 ||
  touches(
    '.gitprivate',
    'tooling/scripts/import-graph.mjs',
    'tooling/scripts/private-files.mjs'
  )(files) ||
  files.some((file) => RESOLVER_CONFIG.test(file));
const TEST = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;
const BUILD_CONFIG = /(?:^|\/)(?:package|turbo|tsconfig[\w.-]*)\.json$/u;
const inTestSuite = (file) =>
  TEST_FILE_PATTERNS.some((pattern) => matchesGlob(file, pattern)) &&
  !TEST_FAST_IGNORE_PATTERNS.some((pattern) => matchesGlob(file, pattern));
const isToolingScript = (file) =>
  CODE.test(file) &&
  (file.startsWith('tooling/scripts/') || file.startsWith('.agents/'));
const isAgentFile = (file) => file.startsWith('.agents/') && !isProse(file);

const CLASSIFIED = new RegExp(`(?:${CODE.source}|${BUILD_CONFIG.source})`, 'u');
let reachSources;
const sources = () =>
  (reachSources ??= trackedFiles(root, { untracked: true }).flatMap((file) => {
    if (file.startsWith('docs/') || !CLASSIFIED.test(file)) return [];
    try {
      return [{ bytes: readFileSync(join(root, file)), file, text: null }];
    } catch {
      return [];
    }
  }));
const latin1Text = (source) =>
  (source.text ??= source.bytes.toString('latin1'));
const mayName = (source, extensions) =>
  extensions.some((extension) => source.bytes.includes(extension));
const toolingReaches = new Map();
const toolingReach = (file) => {
  if (!isToolingScript(file) && !isAgentFile(file)) return null;
  if (toolingReaches.has(file)) return toolingReaches.get(file);
  const reach = {
    product: false,
    scripts: new Set([file]),
    tests: new Set(TEST.test(file) ? [file] : []),
  };
  let level = [file];
  while (level.length > 0) {
    const names = `(?<![\\w.-])(?:${level
      .map((path) => basename(path).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
      .join('|')})`;
    const pattern = new RegExp(names, 'u');
    const extensions = [...new Set(level.map((path) => extname(path)))].map(
      (extension) => Buffer.from(extension)
    );
    const hits = sources()
      .filter(
        (source) =>
          mayName(source, extensions) && pattern.test(latin1Text(source))
      )
      .map((source) => source.file);
    const named = (hit) => mentionsOutsideComments(join(root, hit), pattern);
    level = [];
    for (const hit of hits) {
      if (TEST.test(hit)) {
        if (!reach.tests.has(hit) && named(hit)) reach.tests.add(hit);
      } else if (isToolingScript(hit)) {
        if (!reach.scripts.has(hit) && named(hit)) {
          reach.scripts.add(hit);
          level.push(hit);
        }
      } else if (
        !reach.product &&
        hit !== 'package.json' &&
        (CODE.test(hit) || BUILD_CONFIG.test(hit))
      ) {
        reach.product = named(hit);
      }
    }
  }
  toolingReaches.set(file, reach);
  return reach;
};
const reachesProduct = (file) => toolingReach(file)?.product ?? true;
const source = (files) =>
  files.some(
    (file) =>
      !isProse(file) && !FORMATTER_ONLY.has(file) && reachesProduct(file)
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

// ci-workflow.test.mjs lists tooling/scripts to find check scripts that no
// step runs, so it reaches each one without naming it.
const CHECK_SCRIPT = /^tooling\/scripts\/(?:check-.*|.*-check)\.mjs$/u;

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
  {
    name: 'lint',
    run: 'pnpm lint',
    fix: 'pnpm lint:fix',
    affected: formatted,
    key: ['date'],
    filesOnly: true,
  },
  {
    name: 'lint-type-aware',
    run: 'pnpm lint:type-aware',
    affected: source,
    key: ['date'],
    filesOnly: true,
  },
  {
    name: 'lint-baseline',
    run: 'node tooling/oxlint/plate-baseline.mjs --check',
    fix: 'pnpm lint:baseline',
    affected: source,
    key: ['date'],
  },
  {
    name: 'typecheck',
    run: 'pnpm typecheck && node tooling/scripts/check-source-declaration-leaks.mjs',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    // tsc reads the route types in the ignored apps/plite/.next/types, so the
    // step writes them from the app's source first.
    name: 'plite-app-typecheck',
    run: 'pnpm --filter plite exec next typegen && pnpm --filter plite typecheck',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'plite-device-typecheck',
    private: true,
    run: 'pnpm --filter plite typecheck:device',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'type-tests',
    private: true,
    run: 'pnpm test:types',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'test',
    private: true,
    run: 'pnpm test',
    key: [],
    // Bun ignores the www Playwright specs, so editing one cannot change this step.
    affected: (files) =>
      touches(
        '.agents/rules/',
        '.github/workflows/',
        'apps/',
        'benchmarks/',
        'content/',
        'packages/',
        'tooling/'
      )(
        files.filter(
          (file) =>
            reachesProduct(file) && !file.startsWith('apps/www/tests/browser/')
        )
      ) ||
      [
        ...new Set(
          files.flatMap((file) =>
            [
              ...(toolingReach(file)?.tests ?? []),
              ...(CHECK_SCRIPT.test(file)
                ? ['tooling/scripts/ci-workflow.test.mjs']
                : []),
            ].filter(inTestSuite)
          )
        ),
      ].filter((test) => existsSync(join(root, test))),
  },
  {
    name: 'plite-browser',
    private: true,
    run: 'pnpm --filter plite test:plite-browser:chromium',
    optIn: '--browser',
  },
  {
    name: 'plite-test',
    private: true,
    run: 'pnpm plite:test',
    affected: touches(
      'content/docs/',
      'packages/platejs/',
      'packages/plitejs/',
      'packages/test/',
      'tooling/entrypoints/'
    ),
    key: [],
  },
  {
    name: 'authored-order',
    private: true,
    run: 'pnpm check:authored-order && pnpm check:authored-order --schema=generated-elements --family=quotes --blocks=1',
    affected: touches(
      'packages/plitejs/',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'autoformat-rules',
    private: true,
    run: 'pnpm check:autoformat-rules',
    affected: touches(
      'apps/www/scripts/autoformat-input-rules',
      'apps/www/src/registry/components/editor/',
      'packages/platejs/src/',
      'packages/plitejs/src/',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'bench-targets',
    private: true,
    run: 'pnpm plite:bench:targets:check',
    affected: touches('benchmarks/targets/slate-v2.json'),
    key: [],
  },
  {
    name: 'public-types',
    private: true,
    run: 'pnpm plite:public-types',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'cli-test',
    private: true,
    run: `pnpm --filter @platejs/cli run test --timeout=${BUN_TEST_TIMEOUT_MS}`,
    // The CLI tests compile editors against platejs source, which builds on plitejs.
    affected: touches(
      'packages/cli/',
      'packages/platejs/',
      'packages/plitejs/'
    ),
    key: [],
  },
  {
    name: 'core-audits',
    private: true,
    run: 'pnpm check:core',
    affected: source,
    key: [],
  },
  {
    name: 'plite-docs',
    private: true,
    run: 'node tooling/scripts/check-plite-docs.mjs',
    affected: (files) =>
      source(files) ||
      touches(
        '.agents/rules/',
        '.agents/skills/',
        'AGENTS.md',
        'docs/plite/'
      )(files),
    key: [],
  },
  {
    name: 'plite-bridge',
    run: 'node tooling/scripts/check-plite-bridge.mjs',
    affected: source,
    key: [],
  },
  {
    name: 'selection-writes',
    run: 'node tooling/scripts/check-selection-writes.mjs',
    affected: touches('packages/'),
    key: [],
  },
  {
    name: 'browser-test-imports',
    run: 'node tooling/scripts/check-browser-test-imports.mjs',
    fix: 'node tooling/scripts/check-browser-test-imports.mjs --fix',
    affected: touches(
      'apps/plite/tests/plite-browser/',
      'apps/www/tests/browser/',
      'tooling/scripts/check-browser-test-imports'
    ),
    key: [],
  },
  {
    name: 'yjs-element-deletes',
    run: 'node tooling/scripts/check-yjs-element-deletes.mjs',
    affected: touches('packages/plitejs/'),
    key: [],
  },
  {
    name: 'hook-generics',
    run: 'node tooling/scripts/check-hook-generics.mjs --check',
    fix: 'node tooling/scripts/check-hook-generics.mjs',
    affected: source,
    key: [],
  },
  {
    name: 'value-records',
    run: 'node tooling/scripts/check-value-records.mjs',
    affected: source,
    key: [],
  },
  {
    name: 'entrypoint-graph',
    private: true,
    run: 'pnpm entrypoint:turbo:check',
    write: 'pnpm entrypoint:turbo:generate',
    affected: source,
    key: [],
  },
  {
    name: 'registry-changelog',
    run: 'node tooling/scripts/generate-ui-changelog-entries.mjs --check',
    write: 'node tooling/scripts/generate-ui-changelog-entries.mjs --write',
    affected: touches(
      '.changeset/',
      'apps/www/src/generated/release-index.json',
      'apps/www/src/registry/',
      'oxfmt.config.ts'
    ),
    key: [],
  },
  {
    name: 'bench-report',
    private: true,
    run: 'node tooling/scripts/bench-targets.mjs report --check',
    write: 'node tooling/scripts/bench-targets.mjs report',
  },
  {
    name: 'skill-mirrors',
    run: 'node .agents/rules/plate-next/scripts/sync-resources.mjs --check',
    fix: 'pnpm install',
    affected: touches(
      '.agents/rules/',
      '.agents/skills/',
      '.claude/skills/',
      'skills-lock.json'
    ),
    key: [],
  },
  {
    // It judges every plan, so another session's open plan can turn it red;
    // the daily full check runs it instead of each landing.
    name: 'review-ledger',
    private: true,
    run: 'node tooling/scripts/review-ledger.mjs check',
    affected: never,
    key: [],
  },
  {
    name: 'removed-api-teaching',
    run: 'node tooling/scripts/check-removed-api-teaching.mjs',
    key: [],
  },
  {
    name: 'knowledge',
    private: true,
    run: 'node tooling/scripts/knowledge/kb.mjs check',
    fix: 'node tooling/scripts/knowledge/kb.mjs check --lower',
    // A deleted file can break a citation in any page, and a file added to a
    // frozen folder fails K17.
    affected: (files) =>
      files.some(
        (file) =>
          file.startsWith('tooling/scripts/knowledge/') ||
          FROZEN.some((dir) => file.startsWith(dir)) ||
          indexPatterns.some((pattern) => matchesGlob(file, pattern)) ||
          !existsSync(join(root, file))
      ),
    key: ['refs'],
  },
  {
    name: 'triage',
    private: true,
    run: 'node tooling/scripts/triage.mjs check',
    affected: touches('.agents/pstack.json', 'docs/triage/issues.tsv'),
    key: [],
  },
  {
    name: 'private',
    run: 'node tooling/scripts/git-private.mjs check',
  },
  {
    name: 'private-imports',
    run: 'node tooling/scripts/git-private.mjs imports',
    affected: (files, retargeted) =>
      canRetargetImports(files, retargeted) ||
      files.filter((file) => CODE.test(file)),
    key: [],
  },
  {
    name: 'manifests',
    run: 'pnpm test:manifests',
    affected: touches('.changeset/', 'packages/'),
    key: [],
  },
  {
    name: 'toolbar-variants',
    run: 'pnpm --filter www check:toolbar-variants',
    affected: source,
    key: [],
  },
  {
    name: 'barrels',
    run: 'pnpm brl',
    unchangedFiles: packageDiff,
    write: 'pnpm brl',
    affected: source,
    key: [],
  },
  {
    name: 'www',
    run: 'pnpm turbo run build --filter=@platejs/cli && pnpm --filter www typecheck',
    // next.config.ts imports docs/plite/reference/public-route-map.json.
    affected: touches(
      'apps/www/',
      'content/',
      'docs/plite/reference/',
      'packages/'
    ),
    key: [],
    filesOnly: true,
    write:
      'pnpm turbo run build --filter=@platejs/cli && pnpm --filter www editor:generate && pnpm --filter www api-reference && pnpm --filter www build:registry',
  },
  {
    name: 'www-build',
    run: 'pnpm build:www:ci',
    optIn: '--build',
  },
];

export const manualOnly = {
  'bench:editor:check':
    'Checks the separate benchmarks/editor npm project, which needs its own npm install.',
  'check:docs':
    'Runs commands that the www-typecheck step already runs through www typecheck.',
  'check:plate-feature':
    'Validates the feature plan passed as its argument; the Build playbook runs it on that plan.',
  'check:plite':
    'Plans and runs Plite browser proof, which the plite-browser step covers.',
  'check:plite:browser-matrix':
    'Runs the full browser matrix across every engine; run it by hand before a release.',
  'check:plite:contracts':
    'Runs tooling contract tests that the test step already runs.',
  'check:plite:dev': 'Plans Plite proof from changed paths, for local use.',
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
  'test:plite:browser':
    'Runs Plite browser proof, which the plite-browser step covers.',
  'test:plite:full':
    'Runs plite:test and Plite browser proof, which the plite-test and plite-browser steps cover.',
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
  const names = args.filter((arg) => !arg.startsWith('--'));
  return steps.filter(
    (step) =>
      ((names.length === 0 ? !step.optIn : names.includes(step.name)) ||
        args.includes(step.optIn)) &&
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

/**
 * @returns {(step: object) => null | true | string[]} what a change to
 *   `files` needs from a step: nothing, its whole run, or the files to run
 *   it on
 */
const needs = (files, retargeted) => {
  const everything = files.some((file) =>
    GLOBAL_PATHS.some((path) => matches(path, file))
  );
  const called = new Set(
    files.flatMap((file) =>
      [...(toolingReach(file)?.scripts ?? [])].map((script) => basename(script))
    )
  );
  const calls = (step) =>
    expand(step.run)
      .split(/[\s"'`;&|()]+/u)
      .some((token) => called.has(basename(token)));
  return (step) => {
    if (!step.affected) return true;
    if (files.length === 0 || step.affected === never) return null;
    if (everything || calls(step)) return true;
    const hit = step.affected(files, retargeted);
    if (!Array.isArray(hit)) return hit ? true : null;
    return hit.length > 0 ? hit : null;
  };
};
const commandFor = (step, need) =>
  Array.isArray(need)
    ? `${step.run} ${need.map((file) => `'${file}'`).join(' ')}`
    : step.run;

/** The base that covers `step`, or else the narrowest need its bases leave. */
const planStep = (step, bases) => {
  let need = true;
  for (const base of bases) {
    if (base.kind === 'exact') return { cover: base };
    const needed = needs(base.files, base.retargeted)(step);
    if (needed === null) return { cover: base };
    if (
      Array.isArray(needed) &&
      (!Array.isArray(need) || needed.length < need.length)
    ) {
      need = needed;
    }
  }
  return { need };
};

/** Each default step with the command a change to `files` needs, or null. */
export const planAffected = (files, retargeted = []) => {
  const need = needs(files, retargeted);
  return steps
    .filter((step) => !step.optIn)
    .map((step) => {
      const needed = need(step);
      return {
        step,
        command: needed === null ? null : commandFor(step, needed),
      };
    });
};

const FRESH_ENV = {
  PLITE_BROWSER_FORCE_PROOF: '1',
  PLITE_PROOF_FORCE_BUILD: '1',
};

const runStep = (step, command, { fresh, writing }) => {
  const started = Date.now();
  const watch = !writing && step.unchangedFiles;
  const before = watch && step.unchangedFiles();
  const result = spawnSync('bash', ['-o', 'pipefail', '-c', command], {
    cwd: root,
    env: fresh ? { ...process.env, ...FRESH_ENV } : process.env,
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
  const flags = ['--affected', '--browser', '--build', '--list', '--write'];
  const unknownFlags = args.filter(
    (arg) => arg.startsWith('--') && !flags.includes(arg)
  );
  if (unknownFlags.length > 0) {
    console.error(
      `[check] unknown flag: ${unknownFlags.join(', ')}. Flags: ${flags.join(', ')}.`
    );
    return 1;
  }
  const writing = args.includes('--write');
  const names = args.filter((arg) => !arg.startsWith('--'));
  if (args.includes('--list')) {
    for (const step of steps) {
      console.info(
        `${step.name}\t${step.run}${step.optIn ? `\t(opt-in: ${step.optIn} or by name)` : ''}`
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
  const optIns = args.filter((arg) => steps.some((step) => step.optIn === arg));
  if (writing && optIns.length > 0) {
    console.error(
      `[check] ${optIns.join(' and ')} runs a step with no writer; run it without --write.`
    );
    return 1;
  }
  const affected = args.includes('--affected');
  if (affected && (writing || optIns.length > 0 || names.length > 0)) {
    console.error(
      '[check] --affected picks its own steps; run it without step names, --write, --build or --browser.'
    );
    return 1;
  }

  let chosen = affected
    ? steps.filter((step) => !step.optIn)
    : selectSteps(args);
  if (!hasPrivateHalf(root)) {
    const asked = chosen.filter(
      (step) =>
        step.private && (names.includes(step.name) || args.includes(step.optIn))
    );
    if (asked.length > 0) {
      console.error(
        `[check] ${asked.map((step) => step.name).join(', ')} reads udecode/plate-private's files, which this checkout does not have; in a team clone, node tooling/scripts/git-private.mjs start puts them on disk.`
      );
      return 1;
    }
    for (const step of chosen.filter((entry) => entry.private)) {
      console.info(
        `  skip ${step.name}: it reads udecode/plate-private's files`
      );
    }
    chosen = chosen.filter((step) => !step.private);
  }
  const fresh = freshRun(process.env);
  const cache = openCache(root, { fresh: writing || fresh });
  const selected = [];
  for (const step of chosen) {
    const scope = {
      command: expand(step.run),
      filesOnly: step.filesOnly,
      key: step.key,
      name: step.name,
    };
    const { cover: covered, need } = planStep(
      step,
      cache.bases(scope, { mergeBase: affected, near: affected })
    );
    const ran = Array.isArray(need) ? { ...scope, tests: need } : scope;
    const cover =
      covered ??
      (ran === scope
        ? null
        : planStep(step, cache.bases(ran, { near: affected })).cover);
    if (cover) {
      console.info(
        `  skip ${step.name}: ${cover.label}${cover.files.length > 0 ? `, and none of the ${cover.files.length} files changed since reaches it` : ''}`
      );
      continue;
    }
    selected.push({
      command: writing ? step.write : commandFor(step, need),
      scope: ran,
      step,
    });
  }
  const group = Boolean(process.env.GITHUB_ACTIONS);
  const results = new Map();

  for (const { step, command, scope } of selected) {
    console.info(
      group ? `::group::${step.name}` : `\n[check] ${step.name}: ${command}`
    );
    const result = runStep(step, command, { fresh, writing });
    results.set(step.name, result);
    if (result.status === 0) cache.record(scope, result.seconds);
    if (group) console.info('::endgroup::');
  }
  const { dropped } = cache.flush();
  if (dropped) console.info(`[check] ${dropped}.`);

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
  const covered = chosen.length - selected.length;
  console.info(
    `[check] all ${selected.length} steps passed${covered > 0 ? `; ${covered} skipped on an earlier pass` : ''}.`
  );
  return 0;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(main());
}
