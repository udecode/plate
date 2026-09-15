import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, release, tmpdir } from 'node:os';
import path from 'node:path';

import {
  createEditor,
  createEditorView,
  type Element,
} from '../../../packages/plitejs/src';
import { authored } from '../../../packages/plitejs/src/authored';
import { writeBenchmarkArtifact } from './benchmark-artifact';

type Phase = 'accepted-insertion' | 'proposed-insertion';

type Contract = Readonly<{
  budget: Readonly<{
    incomingOperations: number;
    noiseFloorMs: number;
    p95Ms: number;
    p99Ms: number;
    relativeP95: number;
  }>;
  cohorts: readonly number[];
  passes: number;
  phases: readonly Phase[];
  samples: number;
  version: number;
  warmups: number;
}>;

type Summary = Readonly<{
  p50: number;
  p95: number;
  p99: number;
  samples: readonly number[];
}>;

type FrozenAggregate = Readonly<{
  complete: boolean;
  phase: Phase;
  size: number;
  target: Summary;
}>;

const contractPath =
  'docs/plans/artifacts/native-authored-changes/collaboration-owner-contract.json';
const baselinePath =
  'docs/plans/artifacts/native-authored-changes/execution/collaboration-owner-frozen-full-1.json';
const contractText = readFileSync(contractPath, 'utf-8');
const contract = JSON.parse(contractText) as Contract;
const baselineText = readFileSync(baselinePath, 'utf-8');
const frozen = JSON.parse(baselineText) as {
  aggregates: readonly FrozenAggregate[];
  contract: Contract;
  environment: {
    arch: string;
    bun: string;
    cpu?: string;
    platform: string;
    release: string;
  };
  passed: boolean;
  scope: string;
  sourceMatches: boolean;
};
assert.deepEqual(frozen.contract, contract);

const option = (name: string) =>
  process.argv
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
const output =
  option('output') ?? 'tmp/plite-authored-collaboration-benchmark.json';
const selectedCohort = option('cohort');
const cohorts = selectedCohort
  ? [Number(selectedCohort)]
  : [...contract.cohorts];
const passes = Number(option('passes') ?? contract.passes);
const samples = Number(option('samples') ?? contract.samples);
const warmups = Number(option('warmups') ?? contract.warmups);
assert.ok(cohorts.every((size) => contract.cohorts.includes(size)));
assert.ok(cohorts.every((size) => size >= samples + warmups));
assert.ok(Number.isInteger(passes) && passes > 0);
assert.ok(Number.isInteger(samples) && samples > 0);
assert.ok(Number.isInteger(warmups) && warmups >= 0);

const benchmarkPath =
  'benchmarks/editor/benchmarks/plite-authored-collaboration-benchmark.ts';
const workerPath =
  'benchmarks/editor/benchmarks/plite-authored-collaboration-worker.ts';
const graphPaths = [benchmarkPath, workerPath].map((entry, index) => {
  const graphPath = path.join(
    tmpdir(),
    `plite-authored-collaboration-${process.pid}-${index}.json`
  );
  execFileSync(
    'bun',
    [
      'build',
      entry,
      '--target=bun',
      '--packages=external',
      `--outfile=${path.join(tmpdir(), `plite-authored-collaboration-${process.pid}-${index}.mjs`)}`,
      `--metafile=${graphPath}`,
    ],
    { stdio: 'pipe' }
  );

  return graphPath;
});
const inputPaths = [
  ...new Set([
    ...graphPaths.flatMap((graphPath) =>
      Object.keys(JSON.parse(readFileSync(graphPath, 'utf-8')).inputs)
    ),
    baselinePath,
    contractPath,
    'config/plite-source-aliases.ts',
    'config/workspace-source-entries.mjs',
    'packages/plitejs/package.json',
    'pnpm-lock.yaml',
  ]),
].sort();
const fingerprint = () =>
  inputPaths.map((file) => ({
    path: file,
    sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
  }));
const sourceBefore = fingerprint();

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, block = 0) => ({
  path: [block, 0],
  offset,
});
const percentile = (values: readonly number[], ratio: number) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * ratio) - 1];
};
const summarize = (values: readonly number[]): Summary => ({
  p50: percentile(values, 0.5),
  p95: percentile(values, 0.95),
  p99: percentile(values, 0.99),
  samples: values,
});
const createFixture = (size: number) => {
  const started = performance.now();
  const base = Array.from({ length: size }, () => paragraph('Base'));
  const editor = createEditor({
    plugins: [authored({ authorId: 'fixture' })],
    initialValue: base,
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'proposed' },
  });
  for (let block = 0; block < size; block += 1) {
    view.update.text.insert('q', { at: point(4, block) });
  }
  const checkpointJson = JSON.stringify(editor.read.value());
  const seedMs = performance.now() - started;

  return { checkpointJson, seedMs };
};

const environment = {
  arch: arch(),
  bun: Bun.version,
  cpu: cpus()[0]?.model,
  platform: platform(),
  release: release(),
};
const sameMachineClass =
  environment.arch === frozen.environment.arch &&
  environment.bun === frozen.environment.bun &&
  environment.cpu === frozen.environment.cpu &&
  environment.platform === frozen.environment.platform;
const baselineIdentityValid =
  frozen.passed &&
  frozen.sourceMatches &&
  sameMachineClass &&
  frozen.aggregates.length ===
    contract.cohorts.length * contract.phases.length &&
  frozen.aggregates.every(
    (row) =>
      row.complete &&
      row.target.samples.length === contract.passes * contract.samples
  );
assert.equal(baselineIdentityValid, true);

type TimingRow = Readonly<{
  bytes: readonly number[];
  duplicateUpdateIdempotent: boolean;
  fixtureSeedMs: number;
  incomingOperations: readonly number[];
  pass: number;
  phase: Phase;
  reloadMs: number;
  runtimePrimer?: Readonly<{
    durationMs: number;
    operations: number;
    size: number;
  }>;
  samples: Summary;
  setupMs: number;
  size: number;
}>;
const timings: TimingRow[] = [];
const fullContract =
  cohorts.length === contract.cohorts.length &&
  cohorts.every((size, index) => size === contract.cohorts[index]) &&
  passes === contract.passes &&
  samples === contract.samples &&
  warmups === contract.warmups;
const progress = (stage: string) =>
  writeBenchmarkArtifact(
    output,
    `${JSON.stringify(
      {
        benchmark: 'plite-authored-collaboration',
        passed: false,
        scope: 'incomplete installed-owner benchmark',
        stage,
        timings,
        version: 1,
      },
      null,
      2
    )}\n`
  );

let timingError: string | undefined;
try {
  for (const size of cohorts) {
    progress(`seeding ${size}`);
    const { checkpointJson, seedMs: fixtureSeedMs } = createFixture(size);
    const fixturePath = path.join(
      tmpdir(),
      `plite-authored-collaboration-${process.pid}-${size}-fixture.json`
    );
    writeFileSync(fixturePath, checkpointJson);
    Bun.gc(true);

    try {
      for (let pass = 0; pass < passes; pass += 1) {
        for (const phase of contract.phases) {
          progress(`preparing ${size}/${pass + 1}/${phase}`);
          const resultPath = path.join(
            tmpdir(),
            `plite-authored-collaboration-${process.pid}-${size}-${pass}-${phase}.json`
          );
          execFileSync(
            'bun',
            [
              '--expose-gc',
              '--preload',
              './config/plite-source-aliases.ts',
              workerPath,
              `--fixture=${fixturePath}`,
              `--output=${resultPath}`,
              `--pass=${pass + 1}`,
              `--phase=${phase}`,
              `--samples=${samples}`,
              `--size=${size}`,
              `--warmups=${warmups}`,
            ],
            { stdio: 'inherit' }
          );
          const rows = JSON.parse(readFileSync(resultPath, 'utf-8')) as Array<
            Omit<TimingRow, 'fixtureSeedMs'>
          >;
          assert.deepEqual(
            rows.map((row) => row.phase),
            [phase]
          );
          timings.push({ ...rows[0], fixtureSeedMs });
          progress(`measured ${size}/${pass + 1}/${phase}`);
          rmSync(resultPath, { force: true });
        }
      }
    } finally {
      rmSync(fixturePath, { force: true });
    }
  }
} catch (error) {
  timingError = error instanceof Error ? error.stack : String(error);
  process.stderr.write(`${timingError}\n`);
}

const aggregates = cohorts.flatMap((size) =>
  contract.phases.map((phase) => {
    const rows = timings.filter(
      (row) => row.size === size && row.phase === phase
    );
    const installed = summarize(
      rows.flatMap((row) => [...row.samples.samples])
    );
    const baseline = frozen.aggregates.find(
      (row) => row.size === size && row.phase === phase
    );
    assert.ok(baseline);
    const complete =
      rows.length === passes &&
      installed.samples.length === passes * samples &&
      rows.every(
        (row) =>
          row.duplicateUpdateIdempotent &&
          row.incomingOperations.every(
            (count) => count === contract.budget.incomingOperations
          )
      );

    return {
      baseline: baseline.target,
      complete,
      installed,
      passed:
        complete &&
        installed.p95 <= contract.budget.p95Ms &&
        installed.p99 <= contract.budget.p99Ms &&
        installed.p95 <=
          baseline.target.p95 * contract.budget.relativeP95 +
            contract.budget.noiseFloorMs,
      phase,
      size,
    };
  })
);
const sourceAfter = fingerprint();
const sourcesUnchanged =
  JSON.stringify(sourceBefore) === JSON.stringify(sourceAfter);
const passed =
  fullContract &&
  baselineIdentityValid &&
  !timingError &&
  sourcesUnchanged &&
  aggregates.every((row) => row.passed);
const result = {
  aggregates,
  baselineIdentity: {
    artifact: baselinePath,
    artifactSha256: createHash('sha256').update(baselineText).digest('hex'),
    environment: frozen.environment,
    sameMachineClass,
    scope: frozen.scope,
    valid: baselineIdentityValid,
  },
  benchmark: 'plite-authored-collaboration',
  contract,
  contractSha256: createHash('sha256').update(contractText).digest('hex'),
  createdAt: new Date().toISOString(),
  environment,
  fullContract,
  limitations: [
    'Measures headless missing-update encoding, synchronous Yjs receipt and one proposed-view read. Provider lifecycle, awareness, browser input, DOM, heap and paint remain separate gates.',
    'Each source and receiver starts from the same settled native genesis checkpoint. Native seed construction, checkpoint hydration and saved-value reload are recorded outside the bounded receive samples.',
    'The relative control is the accepted immutable version-4 design-target artifact on the same machine class. Absolute p95 and p99 budgets remain authoritative when host noise changes.',
    'Every phase runs in a fresh process. Accepted rows at 1,000 and 10,000 changes first prime that path with 55 untimed operations on a disposable prior-cohort owner of 100 or 1,000 changes. This reproduces the frozen cohort-order JIT state without contaminating proposed timing or carrying large heaps between measured rows.',
  ],
  passed,
  sourceAfter,
  sourceBefore,
  sourcesUnchanged,
  timingError,
  timings,
  version: 1,
};
writeBenchmarkArtifact(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(
  `METRIC plite_authored_collaboration_passed=${Number(passed)}\n`
);
if (process.env.PLITE_AUTHORED_COLLABORATION_STRICT === '1' && !passed) {
  process.exitCode = 1;
}
