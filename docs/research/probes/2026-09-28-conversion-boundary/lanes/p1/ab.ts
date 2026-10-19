// Lane P1: alternating baseline/candidate runs of per-transaction-cost.ts.
// The baseline is the live packages/plitejs/src with lane-owned files (core/**
// except schema-compiler.ts and editor-schema.ts, plus history/**) restored from
// the pre-change snapshot, so both sides share every other lane's edits. Run
// from the repository root after build-preview.ts:
//   bun docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/ab.ts [pairs] [bytes]
// P1_ORIGINAL_SRC overrides the pre-change snapshot directory. The snapshot is
// packages/plitejs/src at a7750ad388; recreate it with
//   git archive a7750ad388 packages/plitejs/src | tar -x -C <dir>
// and P1_ORIGINAL_SRC=<dir>/packages/plitejs/src.
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dir, '../../../../../..');
const laneDir = import.meta.dir;
const liveSource = path.join(repoRoot, 'packages/plitejs/src');
const originalSource = path.resolve(
  repoRoot,
  process.env.P1_ORIGINAL_SRC ??
    'packages/plitejs/node_modules/.cache/p1-original-src'
);
const baselineSource = path.join(
  repoRoot,
  'packages/plitejs/node_modules/.cache/p1-ab-baseline'
);
const pairs = Number(process.argv[2] ?? 5);
const bytes = process.argv[3] ?? '50000';
const isOwned = (relative: string) =>
  relative.startsWith('history/') ||
  (relative.startsWith('core/') &&
    relative !== 'core/schema-compiler.ts' &&
    relative !== 'core/editor-schema.ts');

const listFiles = (root: string, directory = root): string[] =>
  readdirSync(directory).flatMap((name) => {
    const file = path.join(directory, name);

    return statSync(file).isDirectory()
      ? listFiles(root, file)
      : [path.relative(root, file)];
  });

rmSync(baselineSource, { force: true, recursive: true });
cpSync(liveSource, baselineSource, { recursive: true });

const restored: string[] = [];

for (const relative of listFiles(baselineSource).filter(isOwned)) {
  if (!existsSync(path.join(originalSource, relative))) {
    rmSync(path.join(baselineSource, relative));
    restored.push(`-${relative}`);
  }
}
for (const relative of listFiles(originalSource).filter(isOwned)) {
  cpSync(
    path.join(originalSource, relative),
    path.join(baselineSource, relative)
  );
  restored.push(relative);
}

const { P1_PLITE_SRC: _override, ...inheritedEnv } = process.env;
const run = (side: 'baseline' | 'candidate') => {
  const result = spawnSync(
    'bun',
    [
      '--preload',
      path.join(laneDir, 'alias.ts'),
      path.join(laneDir, 'per-transaction-cost.ts'),
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...inheritedEnv,
        P1_BYTES: bytes,
        ...(side === 'baseline'
          ? { P1_PLITE_SRC: path.relative(repoRoot, baselineSource) }
          : {}),
      },
    }
  );

  if (result.status !== 0) {
    throw new Error(`${side} run failed:\n${result.stderr}`);
  }

  return JSON.parse(result.stdout.trim().split('\n').at(-1) ?? '{}');
};

const lanes = ['splice-skip', 'splice-history', 'type-end'] as const;
const runs: Array<{ baseline: any; candidate: any; pair: number }> = [];

for (let pair = 0; pair < pairs; pair += 1) {
  const baselineFirst = pair % 2 === 0;
  const first = run(baselineFirst ? 'baseline' : 'candidate');
  const second = run(baselineFirst ? 'candidate' : 'baseline');
  const baseline = baselineFirst ? first : second;
  const candidate = baselineFirst ? second : first;

  for (const lane of lanes) {
    const hashKey = lane === 'type-end' ? 'typedHash' : 'valueHash';

    if (baseline[lane][hashKey] !== candidate[lane][hashKey]) {
      throw new Error(`${lane} value differs between baseline and candidate.`);
    }
    if (baseline[lane].undoDepth !== candidate[lane].undoDepth) {
      throw new Error(`${lane} history depth differs.`);
    }
  }
  if (!baseline['type-end'].restoredAfterUndo) {
    throw new Error('Baseline undo did not restore the document.');
  }
  if (!candidate['type-end'].restoredAfterUndo) {
    throw new Error('Candidate undo did not restore the document.');
  }
  for (const key of ['typedHash', 'undoDepth', 'undoneHash']) {
    if (baseline['type-after-skip'][key] !== candidate['type-after-skip'][key]) {
      throw new Error(`type-after-skip ${key} differs.`);
    }
  }
  runs.push({ baseline, candidate, pair });
  console.error(
    `pair ${pair + 1}/${pairs}: ${lanes
      .map(
        (lane) =>
          `${lane} ${baseline[lane].median} -> ${candidate[lane].median} ms`
      )
      .join(', ')}, type-after-skip ${
      baseline['type-after-skip'].keystroke
    } -> ${candidate['type-after-skip'].keystroke} ms`
  );
}

const medianOf = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)];
};
const keystroke = (side: 'baseline' | 'candidate') =>
  medianOf(runs.map((entry) => entry[side]['type-after-skip'].keystroke));
const summary = Object.fromEntries([
  ...lanes.map((lane) => {
    const pick = (side: 'baseline' | 'candidate', stat: 'median' | 'p90') =>
      medianOf(runs.map((entry) => entry[side][lane][stat]));

    return [
      lane,
      {
        baselineMedian: pick('baseline', 'median'),
        baselineP90: pick('baseline', 'p90'),
        candidateMedian: pick('candidate', 'median'),
        candidateP90: pick('candidate', 'p90'),
        speedup: Number(
          (pick('baseline', 'median') / pick('candidate', 'median')).toFixed(1)
        ),
      },
    ];
  }),
  [
    'type-after-skip',
    {
      baselineKeystroke: keystroke('baseline'),
      candidateKeystroke: keystroke('candidate'),
      speedup: Number(
        (keystroke('baseline') / keystroke('candidate')).toFixed(1)
      ),
    },
  ],
]);
const output = {
  bytes: Number(bytes),
  pairs,
  restoredOwnedFiles: restored.length,
  runs,
  summary,
};
const file = path.join(laneDir, `ab-${bytes}.json`);

writeFileSync(file, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ file: path.relative(repoRoot, file), summary }));
