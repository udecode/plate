import { spawn, spawnSync } from 'node:child_process';
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdtempSync,
  openSync,
  readFileSync,
  realpathSync,
  rmSync,
} from 'node:fs';
import { constants as osConstants, tmpdir } from 'node:os';
import {
  basename,
  dirname,
  extname,
  join,
  matchesGlob,
  relative,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TEST_TIMEOUT_MS,
  TEST_FAST_IGNORE_PATTERNS,
  TEST_FILE_PATTERNS,
} from '../config/test-suites.mjs';
import { packageTestFiles } from '../entrypoints/entrypoint-turbo.mjs';
import { freshRun, openCache } from './check-cache.mjs';
import { isPlateSchemaAdoptionSourcePath } from './check-plate-schema-adoption.mjs';
import {
  commonDir,
  installLockfile,
  INTERRUPTED,
  lockfileInstalled,
  stepLogger,
  typicalSeconds,
} from './check-steps.mjs';
import {
  mentionsOutsideComments,
  runtimeClosure,
  storedGraph,
} from './import-graph.mjs';
import { FROZEN, indexPatterns } from './knowledge/knowledge.mjs';
import { hasPrivateHalf, trackedFiles } from './private-files.mjs';
import { workerBudget } from './worker-budget.mjs';

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
// Resolution never tries a prose extension, and an import that names one by
// its full path could not resolve before the file was added.
const canRetargetImports = (files, retargeted) =>
  retargeted.some((file) => !PROSE.test(file)) ||
  touches(
    '.gitprivate',
    'tooling/scripts/import-graph.mjs',
    'tooling/scripts/private-files.mjs'
  )(files) ||
  files.some((file) => RESOLVER_CONFIG.test(file));
// A formal check is one Bun script under the source aliases, so a source file
// reaches it only through that script's runtime imports. A public checkout
// lacks the private scripts, and drops their steps before any runs.
const runsScript = (script, ...paths) => {
  let closure;
  return (files, retargeted) => {
    if (canRetargetImports(files, retargeted)) return true;
    if (touches(script, 'config/plite-source-aliases.ts', ...paths)(files)) {
      return true;
    }
    closure ??= existsSync(join(root, script))
      ? new Set(
          runtimeClosure([join(root, script)]).map((file) =>
            relative(root, file)
          )
        )
      : new Set();
    return files.some((file) => closure.has(file));
  };
};
const SCHEMA_ADOPTION_AUDIT = 'tooling/scripts/check-plate-schema-adoption.mjs';
let schemaAdoptionAuditClosure;
const schemaAdoptionFiles = (files) => {
  schemaAdoptionAuditClosure ??= new Set([
    'tooling/scripts/plate-schema-adoption-baseline.json',
    ...runtimeClosure([join(root, SCHEMA_ADOPTION_AUDIT)]).map((file) =>
      relative(root, file)
    ),
  ]);
  return files.some((file) => schemaAdoptionAuditClosure.has(file))
    ? true
    : files.filter(isPlateSchemaAdoptionSourcePath);
};
const TEST = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;
const PACKAGE_MANIFEST = /^packages\/[^/]+\/package\.json$/u;
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
const literal = (text) => text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
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
      .map((path) => literal(basename(path)))
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
// tsc, oxlint and the audits this rule gates read only scripts and JSON, so
// another file reaches them only once deleted, when code may still import it.
// A step that reads more, such as plite-docs, names those paths itself.
const TYPED = /\.(?:[cm]?[jt]sx?|json)$/u;
const source = (files) =>
  files.some(
    (file) =>
      !isProse(file) &&
      !FORMATTER_ONLY.has(file) &&
      (TYPED.test(file) || !existsSync(join(root, file))) &&
      reachesProduct(file)
  );

// A change to one of these can reach every step, so --affected runs them all.
const GLOBAL_PATHS = [
  'bunfig.toml',
  'config/',
  'package.json',
  'pnpm-workspace.yaml',
  'tooling/config/',
  'tsconfig.json',
  'turbo.json',
];

// pnpm-lock.yaml lists each workspace package's dependencies under
// `importers:` and the packages they resolve to under `packages:` and
// `snapshots:`. A change that edits only importers, and adds or drops whole
// resolved packages, reaches only those importers' manifests; any other
// change can reach every step.
const LOCKFILE = 'pnpm-lock.yaml';
const RESOLVED = new Set(['packages', 'snapshots']);
const LOCKFILE_KEY = /^ *("[^"]*"|'(?:[^']|'')*'|[^\s"':][^:]*?):(?: |$)/u;
/** Each top-level key's entries, keyed by name, or null on a line it cannot read. */
const lockfileSections = (text) => {
  const sections = new Map();
  let entries = null;
  let entry = '';
  for (const line of text.split('\n')) {
    const top = /^\S/u.test(line);
    if (top || (entries && /^ {2}\S/u.test(line))) {
      const key = LOCKFILE_KEY.exec(line);
      if (!key) return null;
      const value = line.slice(key[0].length);
      entry = top ? '' : key[1];
      if (top) {
        entries = new Map();
        sections.set(key[1], entries);
      }
      entries.set(entry, value ? `${value}\n` : '');
    } else if (entries && line.trim()) {
      entries.set(entry, `${entries.get(entry)}${line}\n`);
    }
  }
  return sections;
};
const lockfileChange = (before, after) => {
  const [was, now] = [lockfileSections(before), lockfileSections(after)];
  if (!was || !now) return null;
  const manifests = [];
  for (const name of new Set([...was.keys(), ...now.keys()])) {
    const [a, b] = [was.get(name), now.get(name)];
    if (!a || !b) return null;
    for (const key of new Set([...a.keys(), ...b.keys()])) {
      if (a.get(key) === b.get(key)) continue;
      if (name === 'importers' && key) {
        const dir = key.replace(/^'(.*)'$/u, '$1');
        manifests.push(dir === '.' ? 'package.json' : `${dir}/package.json`);
      } else if (!RESOLVED.has(name) || !key || a.has(key) === b.has(key)) {
        return null;
      }
    }
  }
  return manifests;
};
const lockfileChanges = new Map();
/** The manifests that lockfile changes reach, or null for every step. */
const lockfileReach = (pairs) => {
  if (!pairs?.length) return null;
  const manifests = new Set();
  for (const [before, after] of pairs) {
    if (before === null || after === null) return null;
    let change = lockfileChanges.get(before)?.get(after);
    if (change === undefined) {
      change = lockfileChange(before, after);
      lockfileChanges.set(
        before,
        (lockfileChanges.get(before) ?? new Map()).set(after, change)
      );
    }
    if (change === null) return null;
    for (const manifest of change) manifests.add(manifest);
  }
  return [...manifests];
};

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

// Steps run side by side within the worker share that land.mjs reserves for
// its checks. `cores` is how many of those slots a step occupies, default 1,
// passed to its command as CHECK_CORES. Two steps that name the
// same folder in `holds` never overlap, because one of them writes it. An
// `alone` step runs after every other step, one at a time, for the reason its
// value gives. Under --affected, the `quick` steps run first and the rest
// start only once every one of them passes, and no step starts after one
// fails, so a type, lint or citation error fails a landing before any slow
// step starts. Under --affected, which every landing runs, only the `land`
// steps run. Local CI runs every other step on next after landing. A formal
// check's `light` command runs a smaller bound of the same check, the one a
// session runs before a diff panel, and --light runs it in place of `run`.
// `light: true` marks a check whose gate already runs in under two minutes at
// its 90th percentile, so its light run is the gate.
let imports;
const importGraph = () => {
  if (imports) return imports;
  const real = realpathSync(root);
  const { moduleSpecifiers, resolveImport, save } = storedGraph(
    join(commonDir(root), 'plate-imports'),
    real
  );
  const edges = new Map();
  const edgesOf = (file) => {
    if (!edges.has(file)) {
      let specifiers = [];
      try {
        specifiers = moduleSpecifiers(file);
      } catch {
        // A file that does not parse has no imports to follow; typecheck and
        // the test that loads it report the parse error.
      }
      edges.set(
        file,
        specifiers
          .map((specifier) => resolveImport(file, specifier))
          .filter(Boolean)
      );
    }
    return edges.get(file);
  };
  imports = { edgesOf, real, save };
  return imports;
};
let testImporters;
const fastTestImporters = () => {
  if (testImporters) return testImporters;
  const { edgesOf, real, save } = importGraph();
  testImporters = new Map();
  for (const test of trackedFiles(root, { untracked: true }).filter(
    inTestSuite
  )) {
    const seen = new Set();
    const pending = [join(real, test)];
    while (pending.length > 0) {
      const file = pending.pop();
      if (seen.has(file)) continue;
      seen.add(file);
      pending.push(...edgesOf(file));
    }
    for (const file of seen) {
      const loaded = relative(real, file);
      if (!testImporters.has(loaded)) testImporters.set(loaded, new Set());
      testImporters.get(loaded).add(test);
    }
  }
  save();
  return testImporters;
};
const namingTests = (file) => {
  const folder = dirname(file);
  const names = (dir) => {
    if (dir === '.') return [file, ...(folder.includes('/') ? [folder] : [])];
    const near = folder === dir || folder.startsWith(`${dir}/`);
    return [
      file,
      ...(folder.includes('/') ? [folder] : []),
      relative(dir, file),
      ...(near ? [basename(file)] : []),
      ...(near && folder !== dir ? [folder.slice(dir.length + 1)] : []),
    ];
  };
  const patterns = new Map();
  const patternFor = (dir) => {
    if (!patterns.has(dir)) {
      patterns.set(
        dir,
        new RegExp(
          `(?<![\\w.-])(?:${names(dir).map(literal).join('|')})(?![\\w.-])`,
          'u'
        )
      );
    }
    return patterns.get(dir);
  };
  return [
    ...new Set(
      sources().flatMap((script) => {
        const pattern = patternFor(dirname(script.file));
        return pattern.test(latin1Text(script)) &&
          mentionsOutsideComments(join(root, script.file), pattern)
          ? [...(fastTestImporters().get(script.file) ?? [])]
          : [];
      })
    ),
  ];
};
// A test that loads a file through a computed path is missed here, and Local
// CI's full run catches it on next after landing. Bun ignores the www
// Playwright specs, so editing one cannot change the tests.
const reachesTests = (files) => {
  const product = files.filter(
    (file) =>
      touches(
        '.agents/rules/',
        '.github/workflows/',
        'apps/',
        'benchmarks/',
        'content/',
        'packages/',
        'tooling/'
      )([file]) &&
      reachesProduct(file) &&
      !file.startsWith('apps/www/tests/browser/')
  );
  const placed = (file) => {
    const tests = fastTestImporters().get(file);
    if (tests) return [...tests];
    if (!existsSync(join(root, file)) || BUILD_CONFIG.test(file)) return null;
    return CODE.test(file) ? [] : namingTests(file);
  };
  const loading = product.map(placed);
  if (loading.some((tests) => !tests)) return true;
  return [
    ...new Set([
      ...loading.flat(),
      ...files.flatMap((file) =>
        [
          ...(toolingReach(file)?.tests ?? []),
          ...(CHECK_SCRIPT.test(file)
            ? ['tooling/scripts/ci-workflow.test.mjs']
            : []),
        ].filter(inTestSuite)
      ),
    ]),
  ].filter((test) => existsSync(join(root, test)));
};

let packageTestImports;
const directPackageTestImporters = (files) => {
  if (!packageTestImports) {
    const { edgesOf, real, save } = importGraph();
    packageTestImports = new Map();
    for (const [test, { browser }] of packageTestFiles()) {
      if (browser) continue;
      for (const file of [
        test,
        ...edgesOf(join(real, test)).map((loaded) => relative(real, loaded)),
      ]) {
        if (!packageTestImports.has(file)) {
          packageTestImports.set(file, new Set());
        }
        packageTestImports.get(file).add(test);
      }
    }
    save();
  }
  return [
    ...new Set(
      files.flatMap((file) => [...(packageTestImports.get(file) ?? [])])
    ),
  ].sort((a, b) => a.localeCompare(b));
};

export const steps = [
  {
    name: 'lint',
    quick: true,
    run: 'pnpm lint',
    fix: 'pnpm lint:fix',
    affected: formatted,
    key: ['date'],
    filesOnly: true,
  },
  {
    name: 'lint-type-aware',
    cores: 2,
    run: 'pnpm lint:type-aware',
    affected: source,
    key: ['date'],
    filesOnly: true,
  },
  {
    name: 'lint-baseline',
    quick: true,
    run: 'node tooling/oxlint/plate-baseline.mjs --check',
    fix: 'pnpm lint:baseline',
    affected: source,
    key: ['date'],
  },
  {
    name: 'typecheck',
    land: true,
    quick: true,
    cores: 3,
    holds: ['packages/cli/tmp-*'],
    run: 'pnpm typecheck && node tooling/scripts/check-source-declaration-leaks.mjs',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    // tsc reads the route types in the ignored apps/plite/.next/types, so the
    // step writes them from the app's source first.
    name: 'plite-app-typecheck',
    quick: true,
    holds: ['apps/plite/.next'],
    run: 'pnpm --filter plite exec next typegen && pnpm --filter plite typecheck',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'plite-device-typecheck',
    quick: true,
    private: true,
    run: 'pnpm --filter plite typecheck:device',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'type-tests',
    quick: true,
    private: true,
    run: 'pnpm test:types',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'test',
    land: true,
    cores: 4,
    holds: ['apps/www/.source'],
    private: true,
    run: 'pnpm test:fast',
    key: [],
    affected: reachesTests,
  },
  {
    name: 'test-slow',
    cores: 4,
    holds: ['apps/www/.source'],
    private: true,
    run: 'pnpm test:slow',
    key: [],
    affected: reachesTests,
  },
  {
    name: 'plite-browser',
    holds: ['packages/*/dist', 'apps/plite/.next'],
    private: true,
    run: 'pnpm --filter plite test:plite-browser:chromium',
    optIn: '--browser',
  },
  {
    name: 'plite-test',
    cores: 4,
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
    name: 'package-tests',
    land: true,
    partOf: 'plite-test',
    onlyAffectedFiles: true,
    cores: 2,
    private: true,
    run: 'node tooling/scripts/package-tests.mjs --skip-slow',
    key: [],
    affected: directPackageTestImporters,
  },
  {
    name: 'authored-order',
    cores: 4,
    private: true,
    run: 'pnpm check:authored-order && pnpm check:authored-order --schema=generated-elements --family=quotes --blocks=1',
    light: 'pnpm check:authored-order --light',
    affected: runsScript(
      'packages/plitejs/scripts/authored-decision-order.ts',
      'packages/plitejs/scripts/',
      'packages/plitejs/test/',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'autoformat-rules',
    cores: 4,
    private: true,
    run: 'pnpm check:autoformat-rules',
    light: 'pnpm check:autoformat-rules --light',
    affected: runsScript(
      'apps/www/scripts/autoformat-input-rules.ts',
      'apps/www/scripts/autoformat-input-rules',
      'apps/www/src/registry/components/editor/',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'yjs-peer-order',
    cores: 4,
    private: true,
    run: 'pnpm check:yjs-peer-order',
    light: 'pnpm check:yjs-peer-order --light',
    affected: runsScript(
      'packages/plitejs/scripts/yjs-peer-order.ts',
      'packages/plitejs/scripts/yjs-peer-order',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'effect-ledger',
    cores: 4,
    private: true,
    run: 'pnpm check:effect-ledger --deadline=3300',
    light: 'pnpm check:effect-ledger --light',
    affected: runsScript(
      'packages/plitejs/scripts/effect-ledger.ts',
      'packages/plitejs/scripts/check-harness.ts',
      'packages/plitejs/scripts/effect-ledger'
    ),
    key: [],
  },
  {
    name: 'sync-simulation',
    cores: 4,
    private: true,
    run: 'pnpm check:sync-simulation',
    affected: runsScript(
      'packages/plitejs/scripts/sync-simulation.ts',
      'packages/plitejs/scripts/check-harness.ts',
      'packages/plitejs/test/support/sync-world.ts'
    ),
    key: [],
  },
  {
    name: 'authored-recording',
    cores: 4,
    private: true,
    run: 'pnpm check:authored-recording',
    light: 'pnpm check:authored-recording --light',
    affected: runsScript(
      'packages/plitejs/scripts/authored-recording-order.ts',
      'packages/plitejs/scripts/authored-recording-order',
      'packages/plitejs/scripts/authored-documents',
      'packages/plitejs/scripts/check-harness',
      'packages/plitejs/scripts/letter-commands',
      'packages/plitejs/test/support/',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'undo-redo-history',
    cores: 4,
    private: true,
    run: 'pnpm check:undo-redo-history',
    light: 'pnpm check:undo-redo-history --light',
    affected: runsScript(
      'packages/plitejs/scripts/undo-redo-history.ts',
      'packages/plitejs/scripts/undo-redo-history',
      'packages/plitejs/scripts/authored-documents',
      'packages/plitejs/scripts/check-harness',
      'packages/plitejs/scripts/letter-commands',
      'packages/plitejs/test/support/',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'delete-paste-ranges',
    cores: 4,
    private: true,
    run: 'pnpm check:delete-paste-ranges',
    light: 'pnpm check:delete-paste-ranges --light',
    affected: runsScript(
      'packages/plitejs/scripts/delete-paste-ranges.ts',
      'packages/plitejs/scripts/delete-paste-ranges',
      'packages/plitejs/scripts/authored-documents',
      'packages/plitejs/scripts/check-harness',
      'packages/plitejs/test/support/',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'docx-import-report',
    cores: 4,
    run: 'pnpm check:docx-import-report',
    affected: runsScript(
      'packages/platejs/scripts/docx-import-report.ts',
      'packages/platejs/scripts/docx-import-report'
    ),
    key: [],
  },
  {
    name: 'markdown-round-trip',
    cores: 4,
    private: true,
    run: 'pnpm check:markdown-round-trip && bun test ./packages/platejs/scripts/markdown-round-trip-previews.spec.ts',
    light: true,
    affected: runsScript(
      'packages/platejs/scripts/markdown-round-trip.ts',
      'packages/platejs/scripts/markdown-round-trip',
      'packages/plitejs/scripts/check-harness',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'table-grid',
    cores: 4,
    private: true,
    run: 'pnpm check:table-grid',
    light: true,
    affected: runsScript(
      'packages/platejs/scripts/table-grid-commands.ts',
      'packages/platejs/scripts/table-grid-commands',
      'packages/plitejs/scripts/check-harness',
      'tooling/scripts/finding-baseline.mjs'
    ),
    key: [],
  },
  {
    name: 'bench-targets',
    land: true,
    private: true,
    run: 'pnpm plite:bench:targets:check',
    affected: touches('benchmarks/targets/slate-v2.json'),
    key: [],
  },
  {
    name: 'public-types',
    cores: 2,
    holds: ['packages/*/dist'],
    private: true,
    run: 'pnpm plite:public-types',
    affected: source,
    key: [],
    filesOnly: true,
  },
  {
    name: 'cli-test',
    cores: 2,
    holds: ['packages/cli/tmp-*', 'packages/*/dist'],
    after: ['public-types'],
    private: true,
    run: `pnpm --filter @platejs/cli run test --timeout=${TEST_TIMEOUT_MS}`,
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
    affected: (files) =>
      source(files) || files.some(isPlateSchemaAdoptionSourcePath),
    key: [],
  },
  {
    // core-audits runs the whole schema adoption audit, which takes minutes,
    // so a landing audits only the files it changes.
    name: 'schema-adoption',
    land: true,
    partOf: 'core-audits',
    onlyAffectedFiles: true,
    private: true,
    run: `node ${SCHEMA_ADOPTION_AUDIT} --check`,
    affected: schemaAdoptionFiles,
    key: [],
  },
  {
    name: 'plite-docs',
    land: true,
    private: true,
    run: 'node tooling/scripts/check-plite-docs.mjs',
    affected: (files) =>
      source(files) ||
      touches(
        '.agents/rules/',
        '.agents/skills/',
        '.changeset/',
        'AGENTS.md',
        'apps/www/public/',
        'content/docs/',
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
    land: true,
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
    land: true,
    run: 'node tooling/scripts/check-yjs-element-deletes.mjs',
    affected: touches('packages/plitejs/'),
    key: [],
  },
  {
    name: 'position-inference',
    land: true,
    run: 'node tooling/scripts/check-position-inference.mjs',
    affected: touches(
      'packages/plitejs/src/core/change/',
      'packages/plitejs/src/history/',
      'tooling/scripts/check-position-inference',
      'tooling/scripts/position-inference.json'
    ),
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
    // migrate-platejs-entrypoint-imports.mjs scans every code file under
    // tooling/, product or not, for root imports of moved symbols.
    affected: (files) =>
      source(files) ||
      files.some((file) => file.startsWith('tooling/') && CODE.test(file)),
    key: [],
  },
  {
    name: 'registry-icons',
    land: true,
    run: 'node apps/www/scripts/check-registry-icons.mts',
    affected: touches(
      'apps/www/scripts/check-registry-icons.mts',
      'apps/www/scripts/icon-names.mts',
      'apps/www/scripts/lucide-icons.mts',
      'apps/www/scripts/registry-imports.mts',
      'apps/www/src/lib/registry-icon-placeholder.ts',
      'apps/www/src/registry/'
    ),
    key: [],
  },
  {
    name: 'registry-changelog',
    land: true,
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
    name: 'mathml-tex-symbols',
    land: true,
    private: true,
    run: 'node tooling/scripts/mathml-tex-symbols.mjs --check',
    write: 'node tooling/scripts/mathml-tex-symbols.mjs',
    affected: touches(
      'packages/platejs/src/math/lib/mathmlTexSymbols.internal.ts',
      'packages/platejs/src/math/lib/__fixtures__/katex-supported-tex.json',
      'packages/platejs/package.json',
      'oxfmt.config.ts'
    ),
    key: [],
  },
  {
    name: 'bench-report',
    land: true,
    private: true,
    run: 'node tooling/scripts/bench-targets.mjs report --check',
    write: 'node tooling/scripts/bench-targets.mjs report',
  },
  {
    name: 'skill-mirrors',
    land: true,
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
    land: true,
    run: 'node tooling/scripts/check-removed-api-teaching.mjs',
    key: [],
  },
  {
    name: 'third-party-notices',
    land: true,
    quick: true,
    run: 'node tooling/scripts/third-party-notices.mjs',
    affected: (files) =>
      files.some(
        (file) =>
          file === 'tooling/scripts/third-party-notices.mjs' ||
          file === 'tooling/scripts/private-files.mjs' ||
          /^packages\/[^/]+\/(?:src\/|package\.json$|THIRD_PARTY_NOTICES\.md$)/u.test(
            file
          )
      ),
    key: [],
  },
  {
    name: 'knowledge',
    land: true,
    quick: true,
    private: true,
    run: 'node tooling/scripts/knowledge/kb.mjs check',
    fix: 'node tooling/scripts/knowledge/kb.mjs check --lower',
    // A deleted file can break a citation in any page, and a file added to a
    // frozen folder fails K17. kb.mjs maps tests to their runners through the
    // entrypoint DAG, which reads each package manifest.
    affected: (files) =>
      files.some(
        (file) =>
          file.startsWith('tooling/scripts/knowledge/') ||
          file.startsWith('tooling/entrypoints/') ||
          file === 'tooling/scripts/import-graph.mjs' ||
          PACKAGE_MANIFEST.test(file) ||
          FROZEN.some((dir) => file.startsWith(dir)) ||
          indexPatterns.some((pattern) => matchesGlob(file, pattern)) ||
          !existsSync(join(root, file))
      ),
    key: ['refs'],
  },
  {
    name: 'triage',
    land: true,
    private: true,
    run: 'node tooling/scripts/triage.mjs check',
    affected: touches('.agents/pstack.json', 'docs/triage/'),
    key: [],
  },
  {
    name: 'private',
    land: true,
    run: 'node tooling/scripts/git-private.mjs check',
  },
  {
    name: 'private-imports',
    land: true,
    run: 'node tooling/scripts/git-private.mjs imports',
    affected: (files, retargeted) =>
      canRetargetImports(files, retargeted) ||
      files.filter((file) => CODE.test(file)),
    key: [],
    // Resolving an import probes these generated folders, and git ignores them,
    // so no file in them can be private.
    ignoredReads: [
      'apps/www/.source/',
      'apps/www/src/__registry__/create-preview/',
    ],
  },
  {
    name: 'manifests',
    land: true,
    run: 'pnpm test:manifests',
    affected: touches('.changeset/', 'packages/'),
    key: [],
  },
  {
    // It asks shadcn's live theme service about every value /create offers,
    // and that service can retire a value with no change here, so its pass
    // lasts one day.
    name: 'create-options',
    run: 'pnpm --filter www check:create-options',
    affected: touches(
      'apps/www/package.json',
      'apps/www/scripts/check-create-options.mts',
      'apps/www/src/lib/plate-create-theme.ts',
      'apps/www/src/lib/plate-create.ts',
      'apps/www/src/lib/plate-registry-styles.ts'
    ),
    key: ['date'],
  },
  {
    name: 'toolbar-variants',
    holds: ['packages/*/dist'],
    after: ['public-types'],
    run: 'pnpm --filter www check:toolbar-variants',
    affected: source,
    key: [],
  },
  {
    name: 'barrels',
    alone: 'rewrites tracked files',
    run: 'pnpm brl',
    unchangedFiles: packageDiff,
    write: 'pnpm brl',
    affected: source,
    key: [],
  },
  {
    // The manifest records the types platejs re-exports, so a package type
    // change that lands without it leaves the www step red after landing.
    name: 'api-reference',
    land: true,
    run: 'pnpm --filter www api-reference:check',
    fix: 'pnpm --filter www api-reference',
    affected: (files) =>
      touches(
        'apps/www/api-reference-baseline.json',
        'apps/www/scripts/build-api-reference.mts',
        'apps/www/src/generated/api-reference-manifest.json'
      )(files) ||
      files.some(
        (file) =>
          /^packages\/(?:plitejs|platejs)\/src\//u.test(file) &&
          !TEST.test(file)
      ),
  },
  {
    name: 'www',
    cores: 2,
    holds: ['packages/*/dist', 'apps/www/.source'],
    run: 'pnpm turbo run build --filter=@platejs/cli && pnpm --filter www typecheck',
    affected: touches(
      'apps/www/',
      'content/',
      'docs/plite/reference/',
      'packages/',
      'tooling/entrypoints/',
      'tooling/scripts/build-package-docs.mjs',
      'tooling/scripts/docs-sources.mjs',
      'tooling/scripts/finding-baseline.mjs',
      'tooling/scripts/private-files.mjs'
    ),
    key: [],
    // Its own commands build these from tracked sources before its scripts
    // read them; build-registry reads its old preview trees only to drop stale
    // files and skip unchanged ones, so they never change what it writes.
    ignoredReads: [
      'apps/www/.source/',
      'apps/www/src/__registry__/create-preview/',
      'packages/cli/dist/',
      'packages/platejs/dist/',
      'packages/plitejs/dist/',
    ],
    write:
      'pnpm turbo run build --filter=@platejs/cli && pnpm --filter www editor:generate && pnpm --filter www api-reference && pnpm --filter www build:registry',
  },
  {
    name: 'www-build',
    alone: 'rewrites tracked files',
    run: 'pnpm build:www:ci && pnpm --filter www check:page-load',
    optIn: '--build',
  },
  {
    // It reruns the Node scripts of every keyed step, about two minutes, and
    // traces www fully only once the www step has built packages/cli/dist.
    name: 'step-reads',
    alone: 'reruns the keyed steps',
    run: 'node tooling/scripts/check-step-reads.mjs',
    optIn: '--reads',
  },
];

export const deepSteps = steps.filter((step) =>
  [undefined, '--browser', '--build'].includes(step.optIn)
);

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
  'local-ci':
    'Runs Local CI on next after landing; its launchd job and the local-ci skill start it.',
  'deps:check': 'Lists available dependency updates; it gates nothing.',
  'p:test': 'Template that each package test script calls.',
  test: 'Runs every root test file, which the test and test-slow steps split between them.',
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
  'typecheck:all':
    'Typechecks every workspace, which the typecheck, plite-app-typecheck and www-typecheck steps cover.',
  'typecheck:watch': 'Watch mode.',
};

export const selectSteps = (args) => {
  const writing = args.includes('--write');
  const names = args.filter((arg) => !arg.startsWith('--'));
  return steps.filter(
    (step) =>
      ((names.length === 0 ? !step.optIn : names.includes(step.name)) ||
        args.includes(step.optIn)) &&
      (!writing || step.write) &&
      (!args.includes('--light') || step.light)
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
const needs = (files, retargeted, versions) => {
  const manifests = files.includes(LOCKFILE)
    ? lockfileReach(versions?.(LOCKFILE))
    : [];
  const reached = [...files, ...(manifests ?? [])];
  const everything =
    manifests === null ||
    reached.some((file) => GLOBAL_PATHS.some((path) => matches(path, file)));
  let called;
  const calls = (step) => {
    called ??= new Set(
      files.flatMap((file) =>
        [...(toolingReach(file)?.scripts ?? [])].map((script) =>
          basename(script)
        )
      )
    );
    return expand(step.run)
      .split(/[\s"'`;&|()]+/u)
      .some((token) => called.has(basename(token)));
  };
  return (step) => {
    if (!step.affected) return true;
    if (files.length === 0 || step.affected === never) return null;
    if ((everything || calls(step)) && !step.onlyAffectedFiles) return true;
    const hit = step.affected(reached, retargeted);
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
  // Tracing a changed tooling script to its callers reads every source, so
  // the base with the fewest changed files goes first and usually covers.
  const fewest = bases.toSorted((a, b) => a.files.length - b.files.length);
  for (const base of fewest) {
    if (base.kind === 'exact') return { cover: base };
    const needed = needs(base.files, base.retargeted, base.versions)(step);
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

/**
 * Each default step with the command a change to `files` needs, or null.
 * `versions` gives a changed file's text before and after, as a cache base
 * does.
 */
export const planAffected = (files, retargeted = [], versions = () => null) => {
  const need = needs(files, retargeted, versions);
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

const runStep = (
  step,
  command,
  { cores, fresh, log, running, watchMemory, writing }
) => {
  const started = Date.now();
  const watch = !writing && step.unchangedFiles;
  const before = watch && step.unchangedFiles();
  const output = openSync(log, 'w');
  const child = spawn('bash', ['-o', 'pipefail', '-c', command], {
    cwd: root,
    env: {
      ...process.env,
      ...(fresh ? FRESH_ENV : {}),
      CHECK_CORES: String(cores),
    },
    stdio: ['ignore', output, output],
  });
  closeSync(output);
  running.add(child);
  const unwatch = watchMemory(child.pid, {
    stopped: (text) => appendFileSync(log, `\n[check] ${step.name} ${text}\n`),
  });
  return new Promise((resolveStep) => {
    const finish = (code) => {
      if (!running.delete(child)) return;
      unwatch();
      let status = code;
      if (status === 0 && watch && step.unchangedFiles() !== before) {
        appendFileSync(
          log,
          `[check] ${step.name} changed files under packages/.\n`
        );
        status = 1;
      }
      resolveStep({
        seconds: Math.round((Date.now() - started) / 1000),
        status,
      });
    };
    child.once('error', (error) => {
      appendFileSync(log, `${error.message}\n`);
      finish(1);
    });
    child.once('exit', (code) => finish(code ?? 1));
  });
};

// The longest steps start first, because a half-hour step that waits for
// free cores behind short ones runs past Local CI's hour and reports nothing.
const schedule = async (entries, budget, start, stopped, seconds) => {
  const slots = ({ step }) => Math.min(step.cores ?? 1, budget);
  const pending = entries
    .filter(({ step }) => !step.alone)
    .toSorted(
      (a, b) =>
        (seconds.get(b.step.name) ?? 0) - (seconds.get(a.step.name) ?? 0) ||
        (b.step.cores ?? 1) - (a.step.cores ?? 1)
    );
  const unfinished = new Set(pending.map(({ step }) => step.name));
  const held = new Set();
  const active = new Set();
  let free = budget;
  const launch = () => {
    for (const entry of [...pending]) {
      const holds = entry.step.holds ?? [];
      const after = entry.step.after ?? [];
      if (
        slots(entry) > free ||
        holds.some((name) => held.has(name)) ||
        after.some((name) => unfinished.has(name))
      ) {
        continue;
      }
      pending.splice(pending.indexOf(entry), 1);
      free -= slots(entry);
      for (const name of holds) held.add(name);
      const run = start(entry).then(() => {
        free += slots(entry);
        for (const name of holds) held.delete(name);
        unfinished.delete(entry.step.name);
        active.delete(run);
      });
      active.add(run);
    }
  };
  launch();
  while (active.size > 0) {
    await Promise.race(active);
    if (!stopped()) launch();
  }
  for (const entry of entries.filter(({ step }) => step.alone)) {
    if (stopped()) break;
    await start(entry);
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const flags = [
    '--affected',
    '--browser',
    '--build',
    '--deep',
    '--light',
    '--list',
    '--reads',
    '--write',
  ];
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
        `${step.name}\t${step.run}${step.optIn ? `\t(opt-in: ${step.optIn} or by name)` : ''}${step.light === true ? '\t(--light: the gate)' : step.light ? `\t(--light: ${step.light})` : ''}`
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
      '[check] --affected picks its own steps; run it without step names, --write, --build, --browser or --reads.'
    );
    return 1;
  }
  const deep = args.includes('--deep');
  if (deep && (affected || writing || optIns.length > 0 || names.length > 0)) {
    console.error(
      '[check] --deep runs every step that --build --browser runs; run it without --affected, step names, --write, --build, --browser or --reads.'
    );
    return 1;
  }
  const light = args.includes('--light');
  const heavy = names.filter(
    (name) => !steps.find((step) => step.name === name).light
  );
  if (light && (affected || deep || writing || optIns.length > 0)) {
    console.error(
      '[check] --light runs the light bound of the formal checks it names, or of every one; run it without --affected, --deep, --write, --build, --browser or --reads.'
    );
    return 1;
  }
  if (light && heavy.length > 0) {
    console.error(
      `[check] ${heavy.join(', ')} has no light bound. Steps with one: ${steps
        .filter((step) => step.light)
        .map((step) => step.name)
        .join(', ')}.`
    );
    return 1;
  }

  if (lockfileInstalled(root) === false) {
    console.info(
      `[check] ${LOCKFILE} differs from the lockfile pnpm last installed; installing it.`
    );
    const failure = installLockfile(root);
    if (failure !== null) {
      console.error(
        `[check] pnpm install failed, so the steps would run against stale node_modules:\n${failure}`
      );
      return 1;
    }
  }

  let chosen = affected
    ? steps.filter((step) => !step.optIn)
    : deep
      ? deepSteps
      : selectSteps(args);
  if (affected) {
    const later = chosen.filter((step) => !step.land);
    if (later.length > 0) {
      console.info(
        `  skip ${later.map((step) => step.name).join(', ')}: Local CI runs them on next after landing`
      );
    }
    chosen = chosen.filter((step) => step.land);
  }
  chosen = chosen.filter(
    (step) => !chosen.some((other) => other.name === step.partOf)
  );
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
  // A light pass is a pass of its own command, logged under its own name, so
  // it never covers a full run or moves the step's typical time.
  if (light) {
    chosen = chosen.map((step) => ({
      ...step,
      name: `${step.name} --light`,
      run: step.light === true ? step.run : step.light,
    }));
  }
  const fresh = freshRun(process.env);
  const landing = process.env.PSTACK_LAND_CHECK === '1';
  const logStep = stepLogger(root, { affected, deep, fresh, landing });
  const near = affected || deep;
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
      cache.bases(scope, { mergeBase: affected, near })
    );
    const ran = Array.isArray(need) ? { ...scope, tests: need } : scope;
    const cover =
      covered ??
      (ran === scope ? null : planStep(step, cache.bases(ran, { near })).cover);
    if (cover) {
      console.info(
        `  skip ${step.name}: ${cover.label}${cover.files.length > 0 ? `, and none of the ${cover.files.length} files changed since reaches it` : ''}`
      );
      logStep({ step: step.name, covered: cover.label });
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
  const share = workerBudget();
  const typical = typicalSeconds(root);
  // Writers can read each other's output, so --write keeps one step at a time.
  let budget = 1;
  const { reserve, watchMemory } =
    await import('../../.agents/pstack/proof.mjs');
  const logs = mkdtempSync(join(tmpdir(), 'plate-check-'));
  const running = new Set();
  let interrupted = 0;
  // Steps share this process group, so a terminal's or supervisor's signal to
  // the group reaches each of them; this passes on one sent to this process.
  const stop = (signal) => {
    interrupted ||= 128 + osConstants.signals[signal];
    for (const child of running) child.kill(signal);
  };
  const signals = ['SIGHUP', 'SIGINT', 'SIGTERM'];
  for (const signal of signals) process.on(signal, stop);
  const recordsPasses = selected.some(({ scope }) => scope.key);
  if (recordsPasses) cache.watch();
  let firstFailure = null;
  const start = async ({ command, scope, step }) => {
    console.info(`[check] ${step.name} started`);
    const log = join(logs, `${step.name}.log`);
    cache.begin(step.name);
    const result = await runStep(step, command, {
      cores: Math.min(step.cores ?? 1, budget),
      fresh,
      log,
      running,
      watchMemory,
      writing,
    });
    const reason = cache.end(step.name);
    results.set(step.name, result);
    logStep({
      cores: Math.min(step.cores ?? 1, budget),
      exit: interrupted ? INTERRUPTED : result.status,
      seconds: result.seconds,
      step: step.name,
    });
    // pnpm exits 0 when an interrupt stops its script, so a step that ends
    // after one never counts as passed.
    if (!interrupted && result.status !== 0) {
      firstFailure ??= step.name;
    } else if (!interrupted) {
      cache.record(scope, result.seconds, reason);
    }
    if (group) console.info(`::group::${step.name}`);
    console.info(`${group ? '' : '\n'}[check] ${step.name}: ${command}`);
    process.stdout.write(readFileSync(log));
    rmSync(log, { force: true });
    const state = interrupted
      ? 'interrupted'
      : result.status === 0
        ? 'ok'
        : `failed (exit ${result.status})`;
    console.info(`[check] ${step.name} ${state} in ${result.seconds}s`);
    if (group) console.info('::endgroup::');
  };
  const stopped = () =>
    interrupted !== 0 || (affected && firstFailure !== null);
  try {
    if (writing) {
      for (const entry of selected) {
        if (stopped()) break;
        await start(entry);
      }
    } else {
      const tiers = affected
        ? [
            selected.filter(({ step }) => step.quick),
            selected.filter(({ step }) => !step.quick),
          ]
        : [selected];
      // Each tier asks the pool for only the cores its own steps use, so a
      // landing whose change reaches only the quick steps waits for one or two.
      for (const tier of tiers.filter((entries) => entries.length > 0)) {
        if (stopped()) break;
        budget = Math.min(
          share,
          tier.reduce(
            (sum, { step }) => sum + Math.min(step.cores ?? 1, share),
            0
          )
        );
        const release = reserve(budget, 'pnpm check');
        try {
          await schedule(tier, budget, start, stopped, typical);
        } finally {
          release();
        }
      }
    }
  } finally {
    for (const signal of signals) process.removeListener(signal, stop);
    rmSync(logs, { force: true, recursive: true });
  }
  if (interrupted) return interrupted;
  const { dropped } = cache.flush();
  if (dropped) console.info(`[check] ${dropped}.`);

  console.info('\n[check] summary');
  let failed = 0;
  for (const { step } of selected) {
    if (!results.has(step.name)) {
      console.info(
        `  ${step.name.padEnd(20)}     -  not started: ${firstFailure} failed first`
      );
      continue;
    }
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
    const unstarted = selected.length - results.size;
    console.error(
      `[check] ${failed} of ${selected.length} steps failed${unstarted > 0 ? `, and ${unstarted} did not start` : ''}.`
    );
    return 1;
  }
  const covered = chosen.length - selected.length;
  console.info(
    `[check] all ${selected.length} steps passed${covered > 0 ? `; ${covered} skipped on an earlier pass` : ''}.`
  );
  return 0;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  // exitCode instead of exit, so the step logs written to a pipe drain first.
  void main().then((code) => {
    process.exitCode = code;
  });
}
