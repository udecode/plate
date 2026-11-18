#!/usr/bin/env node
/**
 * The Scale gate's browser lane command. One run is one packet of one arm:
 * it writes a job file, runs the board-scale Playwright spec through the
 * managed Plite runner on one engine, and prints the final JSON line that
 * `.agents/rules/benchmark/scripts/paired-timing.mjs` reads. The runner's own
 * output goes to stderr, where a failed line's assertion stays readable.
 *
 *   node apps/plite/src/board-scale/browser-lane.mjs --lane type|mount|pan|drag|guard|keys
 *     --engine chromium|webkit --render A|W --arm <arm> --cohorts <name,...>
 *     --log-dir <dir> [--base n50|flat|same] [--assert 1] [--known-bad <fault>]
 *     [--factor <ratio>] [--slow-basis n1|n2] [--keys 120] [--warmup 20]
 *     [--ops <op,...>, required with --lane keys: aim-tab, aim-pick, write-note, write-frame, write-arrow,
 *       end-arrow, resize-arrow, pick-tab, pick-space, write-free-arrow, write-resize]
 *     [--aim connect|select] [--write enter|pointer] [--samples 20]
 *     [--write-warmup 3] [--busy end|pick|held] [--snap 1] [--dry-job 1]
 *
 * --write picks the keyboard (enter) or the pointer for the write ops and for
 * resize-arrow, whose pointer form moves a corner handle. --busy gives a K3
 * line family's busy plant in place of K2's per-result one. --snap 1 has the
 * drag lane snap, which it otherwise turns off by holding Meta.
 *
 * Arms: base, candidate, copy, plant-<name> (see browser-cohorts.ts).
 * --dry-job 1 prints the job this arm would run and runs nothing, so a
 * caller can batch many arms into one runner call.
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '../..');
const SPEC = 'tests/plite-browser/board-scale.spec.ts';
const args = new Map();

const forgetBoardScalePlans = (app) => {
  const dir = path.join(app, '.tmp/plite-browser-runner');

  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (!/^plan-.*\.json$/.test(name)) continue;
    const file = path.join(dir, name);
    let plan;

    try {
      plan = JSON.parse(readFileSync(file, 'utf-8'));
    } catch {
      continue;
    }
    if (
      plan.tests?.length > 0 &&
      plan.tests.every((test) => test.file?.endsWith('board-scale.spec.ts'))
    ) {
      rmSync(file, { force: true });
    }
  }
};

for (let index = 2; index < process.argv.length; index += 2) {
  const flag = process.argv[index];
  const value = process.argv[index + 1];

  if (!flag?.startsWith('--') || value === undefined) {
    throw new Error(`browser lane: expected --flag value pairs, got ${flag}`);
  }
  args.set(flag.slice(2), value);
}

const required = (name) => {
  const value = args.get(name);

  if (value === undefined) {
    throw new Error(`browser lane: --${name} is required`);
  }

  return value;
};
const oneOf = (name, allowed, fallback) => {
  const value = args.get(name) ?? fallback;

  if (!allowed.includes(value)) {
    throw new Error(
      `browser lane: --${name} ${value} is not one of ${allowed.join(', ')}`
    );
  }

  return value;
};

const lane = oneOf('lane', ['type', 'mount', 'pan', 'drag', 'guard', 'keys']);
const K2_OPS = [
  'aim-pick',
  'aim-tab',
  'end-arrow',
  'pick-space',
  'pick-tab',
  'resize-arrow',
  'write-arrow',
  'write-frame',
  'write-free-arrow',
  'write-note',
  'write-resize',
];
const ops = lane === 'keys' ? required('ops').split(',') : undefined;

for (const op of ops ?? []) {
  if (!K2_OPS.includes(op)) {
    throw new Error(
      `browser lane: --ops ${op} is not one of ${K2_OPS.join(', ')}`
    );
  }
}
const write =
  lane === 'keys' ? oneOf('write', ['enter', 'pointer'], 'enter') : undefined;
const engine = oneOf('engine', ['chromium', 'webkit']);
const render = oneOf('render', ['A', 'W']);
const arm = required('arm');
const knownBad = args.get('known-bad') ?? null;

if (knownBad && arm === 'base') {
  throw new Error(
    'browser lane: a known-bad cohort breaks the measured arm, never base'
  );
}

const logDir = path.resolve(required('log-dir'));
const dry = args.get('dry-job') === '1';

if (!dry) mkdirSync(logDir, { recursive: true });
const keysPart = ops ? `-${ops.join('+')}-${write}` : '';
const snap = lane === 'drag' && args.get('snap') === '1';
const stem = `${lane}${keysPart}${snap ? '-snap' : ''}-${arm}-${engine}-${render}${knownBad ? `-bad-${knownBad}` : ''}`;
let attempt = 1;

while (existsSync(path.join(logDir, `${stem}-a${attempt}.json`))) attempt += 1;
const output = path.join(logDir, `${stem}-a${attempt}.json`);
const jobPath = path.join(logDir, `${stem}-a${attempt}.job.json`);
const job = {
  aim:
    lane === 'keys'
      ? oneOf('aim', ['connect', 'select'], 'connect')
      : undefined,
  arm,
  assert: args.get('assert') === '1',
  base: oneOf('base', ['n50', 'flat', 'same'], 'n50'),
  busy: args.has('busy') ? oneOf('busy', ['end', 'held', 'pick']) : undefined,
  cohorts: required('cohorts').split(','),
  factor: Number(args.get('factor') ?? 1.3),
  keys: Number(args.get('keys') ?? 120),
  knownBad,
  lane,
  ops,
  output,
  render,
  samples: Number(args.get('samples') ?? 20),
  slowBasis: oneOf('slow-basis', ['n1', 'n2'], 'n1'),
  snap: lane === 'drag' ? snap : undefined,
  warmup: Number(args.get('warmup') ?? 20),
  write,
  writeWarmup: Number(args.get('write-warmup') ?? 3),
};

if (dry) {
  process.stdout.write(`${JSON.stringify(job)}\n`);
  process.exit(0);
}

writeFileSync(jobPath, `${JSON.stringify(job, null, 1)}\n`);
forgetBoardScalePlans(appRoot);

const run = spawnSync(
  'pnpm',
  ['--filter', 'plite', 'test:plite-browser:project', engine, SPEC],
  {
    cwd: appRoot,
    encoding: 'utf-8',
    env: {
      ...process.env,
      PLITE_BOARD_SCALE_JOB: jobPath,
      PLITE_BROWSER_FORCE_PROOF: '1',
      PLITE_BROWSER_UNIT_WORKERS: '1',
    },
    maxBuffer: 1 << 28,
  }
);

process.stderr.write(run.stdout ?? '');
process.stderr.write(run.stderr ?? '');

if (run.status !== 0) {
  const failure = existsSync(output)
    ? JSON.parse(readFileSync(output, 'utf-8')).log.error
    : undefined;

  process.stderr.write(
    `browser lane: ${stem} exited ${run.status}${failure ? `: ${failure}` : ''}; log ${output}\n`
  );
  process.exit(1);
}

const { results } = JSON.parse(readFileSync(output, 'utf-8'));
const manifest = path.join(appRoot, 'out/.editor-proof-build.json');

if (!existsSync(manifest)) {
  throw new Error(`browser lane: no app build manifest at ${manifest}`);
}

process.stdout.write(
  `${JSON.stringify({
    label: `${lane}${snap ? ' snap' : ''} ${arm} ${engine} arm ${render}${knownBad ? ` known-bad ${knownBad}` : ''}`,
    loaded: [
      fileURLToPath(import.meta.url),
      path.join(appRoot, SPEC),
      path.join(appRoot, 'src/app/dev/board-scale/page.tsx'),
      manifest,
    ],
    log: output,
    results,
  })}\n`
);
