// Keeps plate-check-steps.jsonl in the clone's git common directory: one line
// for each step a `pnpm check` run selected, with its seconds and exit when it
// ran or the pass that covered it. Run it to print what each step costs:
//   node tooling/scripts/check-steps.mjs [--days <n>] [--log <file>]
// With no run in the log yet, it reads the passes the check cache recorded.
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STEP_LOG = 'plate-check-steps.jsonl';
export const INTERRUPTED = 'interrupted';
const CACHE = join('plate-check', 'v2');
const DAY_MS = 86_400_000;

/**
 * Whether node_modules holds `root`'s pnpm-lock.yaml, read from the copy pnpm
 * writes to node_modules/.pnpm/lock.yaml; null when pnpm never installed there.
 */
export const lockfileInstalled = (root) => {
  const installed = join(root, 'node_modules', '.pnpm', 'lock.yaml');
  return existsSync(installed)
    ? readFileSync(installed, 'utf-8') ===
        readFileSync(join(root, 'pnpm-lock.yaml'), 'utf-8')
    : null;
};

/**
 * Installs `root`'s pnpm-lock.yaml, from the store first and then from the
 * network, and returns null, or pnpm's output when both installs fail.
 */
export const installLockfile = (root) => {
  let output = '';
  for (const offline of [true, false]) {
    const result = spawnSync(
      'pnpm',
      ['install', '--frozen-lockfile', ...(offline ? ['--offline'] : [])],
      { cwd: root, encoding: 'utf-8', maxBuffer: 64 << 20 }
    );
    if (result.status === 0) return null;
    output = result.error?.message ?? `${result.stdout}${result.stderr}`;
  }
  return output;
};

export const commonDir = (root) => {
  const result = spawnSync(
    'git',
    ['rev-parse', '--path-format=absolute', '--git-common-dir'],
    { cwd: root, encoding: 'utf-8' }
  );
  return result.status === 0 ? result.stdout.trim() : null;
};

/** Returns a writer that appends one line per step to the clone's step log. */
export const stepLogger = (root, fields) => {
  const common = commonDir(root);
  if (!common) return () => {};
  const head = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf-8',
  });
  const base = {
    commit: head.stdout.trim(),
    run: process.env.PLATE_CHECK_RUN ?? null,
    worktree: basename(root),
    ...fields,
  };
  return (line) =>
    appendFileSync(
      join(common, STEP_LOG),
      `${JSON.stringify({ at: new Date().toISOString(), ...base, ...line })}\n`
    );
};

// Every run of every worktree appends to one log, so a torn line is skipped
// instead of failing the check that reads it.
const readLines = (file) =>
  existsSync(file)
    ? readFileSync(file, 'utf-8')
        .split('\n')
        .flatMap((line) => {
          try {
            return line ? [JSON.parse(line)] : [];
          } catch {
            return [];
          }
        })
    : [];

const cachedPasses = (common) => {
  const store = join(common, CACHE);
  if (!existsSync(store)) return [];
  const passes = [];
  for (const key of readdirSync(store)) {
    if (key.startsWith('.')) continue;
    for (const name of readdirSync(join(store, key))) {
      const record = JSON.parse(readFileSync(join(store, key, name), 'utf-8'));
      passes.push({
        at: record.at,
        exit: 0,
        seconds: record.seconds,
        step: record.name,
      });
    }
  }
  return passes;
};

const quantile = (sorted, share) =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))];

/** Each step's runs, median and 90th percentile seconds, failures and covers. */
export const summarize = (lines) => {
  const byStep = new Map();
  for (const line of lines) {
    if (!byStep.has(line.step)) byStep.set(line.step, []);
    byStep.get(line.step).push(line);
  }
  return [...byStep]
    .map(([step, entries]) => {
      const ran = entries.filter((entry) => entry.seconds !== undefined);
      const seconds = ran.map((entry) => entry.seconds).sort((a, b) => a - b);
      return {
        step,
        runs: ran.length,
        p50: ran.length > 0 ? quantile(seconds, 0.5) : null,
        p90: ran.length > 0 ? quantile(seconds, 0.9) : null,
        failed: ran.filter((entry) => entry.exit !== 0).length,
        covered: entries.length - ran.length,
      };
    })
    .sort((a, b) => (b.p90 ?? -1) - (a.p90 ?? -1));
};

/** Each logged step's median seconds over the last `days` of `root`'s clone. */
export const typicalSeconds = (root, days = 14) => {
  const common = commonDir(root);
  if (!common) return new Map();
  const since = Date.now() - days * DAY_MS;
  const lines = readLines(join(common, STEP_LOG)).filter(
    (line) => Date.parse(line.at) >= since
  );
  return new Map(
    summarize(lines)
      .filter((row) => row.p50 !== null)
      .map((row) => [row.step, row.p50])
  );
};

const main = (argv) => {
  const option = (name) => {
    const at = argv.indexOf(name);
    return at === -1 ? undefined : argv[at + 1];
  };
  const days = Number(option('--days') ?? 14);
  const common = commonDir(process.cwd());
  const log = option('--log') ?? (common && join(common, STEP_LOG));
  if (!log || !Number.isFinite(days)) {
    console.error(
      'Usage: node tooling/scripts/check-steps.mjs [--days <n>] [--log <file>]'
    );
    return 1;
  }
  const since = Date.now() - days * DAY_MS;
  const recent = (lines) =>
    lines.filter((line) => Date.parse(line.at) >= since);
  let lines = recent(readLines(log));
  let source = log;
  if (!lines.some((line) => line.seconds !== undefined) && !option('--log')) {
    lines = recent(cachedPasses(common));
    source = `${join(common, CACHE)} (passes only)`;
  }
  console.info(`# ${source}, last ${days} days`);
  console.info('step\truns\tp50s\tp90s\tfailed\tcovered');
  for (const row of summarize(lines)) {
    console.info(
      [row.step, row.runs, row.p50, row.p90, row.failed, row.covered]
        .map((cell) => cell ?? '-')
        .join('\t')
    );
  }
  return 0;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = main(process.argv.slice(2));
}
