import { cpus, loadavg } from 'node:os';

import { createEditor, definePlugin, type Value } from 'platejs';
import { AuthoredPlugin, isAuthoredEditor } from 'platejs/authored';
import { authored } from 'plitejs/authored';

import { writeBenchmarkResult } from './benchmark-artifact';

// Frozen before any candidate run; changing a limit needs a new pre-acceptance probe.
const RELATIVE_BUDGET = 1.1;
const ABSOLUTE_BUDGET_MS = 0.05;
const RUNS = 3;

const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const strict = process.env.PLATE_AUTHORED_CONSTRUCTION_STRICT === '1';

const cohorts = {
  large: { batch: 5, blocks: 2000, knownBadMs: 20, rounds: 4 },
  normal: { batch: 40, blocks: 1, knownBadMs: 1, rounds: 10 },
} as const;

type CohortName = keyof typeof cohorts;

const paragraphs = (count: number): Value =>
  Array.from({ length: count }, (_, index) => ({
    children: [{ text: `Paragraph ${index}` }],
    type: 'paragraph',
  }));

const busyWait = (milliseconds: number) => {
  const end = performance.now() + milliseconds;
  let now = performance.now();
  while (now < end) now = performance.now();
};

const NativeAuthored = authored({ authorId: 'alice', retainHistory: false });

const slowAuthored = (milliseconds: number) =>
  definePlugin('authored', { initialState: { retainHistory: false } }).extend(
    ({ store }) => {
      busyWait(milliseconds);

      return authored({
        authorId: 'alice',
        retainHistory: store.get('retainHistory'),
      });
    }
  );

const SlowAuthored = {
  large: slowAuthored(cohorts.large.knownBadMs),
  normal: slowAuthored(cohorts.normal.knownBadMs),
};

const arms = {
  'native alone': (initialValue: Value) =>
    createEditor({ initialValue, plugins: [NativeAuthored], userId: 'alice' }),
  'plate alone': (initialValue: Value) =>
    createEditor({ initialValue, plugins: [AuthoredPlugin], userId: 'alice' }),
  'native with dependent': (initialValue: Value) =>
    createEditor({
      initialValue,
      plugins: [definePlugin('dependent', { dependencies: [NativeAuthored] })],
      userId: 'alice',
    }),
  'plate with dependent': (initialValue: Value) =>
    createEditor({
      initialValue,
      plugins: [definePlugin('dependent', { dependencies: [AuthoredPlugin] })],
      userId: 'alice',
    }),
  'known-bad with dependent': (initialValue: Value, cohort: CohortName) =>
    createEditor({
      initialValue,
      plugins: [
        definePlugin('dependent', { dependencies: [SlowAuthored[cohort]] }),
      ],
      userId: 'alice',
    }),
} as const;

type ArmName = keyof typeof arms;

const armNames = Object.keys(arms) as ArmName[];

const median = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.floor(sorted.length / 2)];
};

const build = (cohort: CohortName, arm: ArmName, initialValue: Value) => {
  const start = performance.now();
  const editor = arms[arm](initialValue, cohort);
  const elapsed = performance.now() - start;
  const blocks = editor.read.value().children.length;

  if (!isAuthoredEditor(editor)) {
    throw new Error(`${arm}: the authored capability is not installed`);
  }
  if (blocks !== cohorts[cohort].blocks) {
    throw new Error(`${arm}: built ${blocks} blocks for the ${cohort} cohort`);
  }

  return elapsed;
};

const load = () =>
  loadavg()
    .map((value) => value.toFixed(2))
    .join(' ');
const cores = cpus().length;

const runs = Array.from({ length: RUNS }, (_, runIndex) => {
  const hostLoad = load();
  const p50 = {} as Record<CohortName, Record<ArmName, number>>;
  const samples = {} as Record<CohortName, Record<ArmName, number>>;

  for (const cohort of Object.keys(cohorts) as CohortName[]) {
    const { batch, blocks, rounds } = cohorts[cohort];
    const initialValue = paragraphs(blocks);
    const timings = Object.fromEntries(
      armNames.map((arm) => [arm, [] as number[]])
    ) as Record<ArmName, number[]>;

    for (const arm of armNames) build(cohort, arm, initialValue);
    for (let round = 0; round < rounds; round++) {
      for (const arm of armNames) {
        Bun.gc(true);
        for (let index = 0; index < batch; index++) {
          timings[arm].push(build(cohort, arm, initialValue));
        }
      }
    }

    p50[cohort] = Object.fromEntries(
      armNames.map((arm) => [arm, median(timings[arm])])
    ) as Record<ArmName, number>;
    samples[cohort] = Object.fromEntries(
      armNames.map((arm) => [arm, timings[arm].length])
    ) as Record<ArmName, number>;
  }

  for (const cohort of Object.keys(cohorts) as CohortName[]) {
    for (const arm of armNames) {
      console.log(
        `run ${runIndex + 1} | ${cohort} | ${arm} | n=${samples[cohort][arm]} | p50=${p50[cohort][arm].toFixed(4)} ms`
      );
    }
  }
  console.log(`run ${runIndex + 1} | host ${hostLoad} | cores ${cores}`);

  return { hostLoad, p50, samples };
});

const lines = (Object.keys(cohorts) as CohortName[]).flatMap((cohort) => {
  const medianOf = (arm: ArmName) =>
    median(runs.map((run) => run.p50[cohort][arm]));
  const line = (
    baseline: ArmName,
    candidate: ArmName,
    expected: 'exceeds' | 'within'
  ) => {
    const baselineMs = medianOf(baseline);
    const candidateMs = medianOf(candidate);
    const limitMs = baselineMs * RELATIVE_BUDGET + ABSOLUTE_BUDGET_MS;
    const within = candidateMs <= limitMs;

    return {
      baseline,
      baselineMs,
      candidate,
      candidateMs,
      cohort,
      expected,
      limitMs,
      ok: expected === 'within' ? within : !within,
    };
  };

  return [
    line('native alone', 'plate alone', 'within'),
    line('native with dependent', 'plate with dependent', 'within'),
    line('native with dependent', 'known-bad with dependent', 'exceeds'),
  ];
});

for (const line of lines) {
  console.log(
    `${line.ok ? 'OK' : 'FAIL'} ${line.cohort}: ${line.candidate} ${line.candidateMs.toFixed(4)} ms vs limit ${line.limitMs.toFixed(4)} ms from ${line.baseline} ${line.baselineMs.toFixed(4)} ms (must be ${line.expected})`
  );
}

const failed = lines.filter((line) => !line.ok);
const withinBudget = failed.length === 0 ? 1 : 0;
const normalLine = lines.find(
  (line) => line.cohort === 'normal' && line.candidate === 'plate alone'
);

console.log(
  `METRIC plate_authored_construction_normal_ratio=${normalLine ? (normalLine.candidateMs / normalLine.baselineMs).toFixed(4) : 'missing'}`
);
console.log(`METRIC plate_authored_construction_within_budget=${withinBudget}`);

writeBenchmarkResult({
  outputPath: outputArgument?.slice('--output='.length),
  result: {
    budget: {
      absoluteMs: ABSOLUTE_BUDGET_MS,
      relative: RELATIVE_BUDGET,
      runs: RUNS,
    },
    cohorts,
    cores,
    lines,
    runs,
  },
  strict,
  validate: () => {
    if (failed.length > 0) {
      throw new Error(
        `Authored construction budget failed: ${failed
          .map((line) => `${line.cohort} ${line.candidate}`)
          .join(', ')}`
      );
    }
  },
});
