import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cpus, platform, release } from 'node:os';

import {
  compare,
  resolveComparison,
} from '../../../packages/plitejs/src/diff/index';
import { createComparisonIndex } from '../../../packages/plitejs/src/diff/lib/comparison-index';
import { matchComparison } from '../../../packages/plitejs/src/diff/lib/comparison-matcher';
import type { ThreeWayComparison } from '../../../packages/plitejs/src/diff/lib/comparison-types';
import {
  createEditor,
  DocumentChange,
} from '../../../packages/plitejs/src/index';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const strict = process.env.PLITE_STRUCTURAL_COMPARE_STRICT === '1';
const warmups = 1;
const samples = 7;
const threeWaySamples = 3;
const paragraph = (
  text: string,
  properties: Readonly<Record<string, unknown>> = {}
) => ({ ...properties, children: [{ text }], type: 'paragraph' });
const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];
const summarize = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return {
    max: sorted.at(-1) ?? 0,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};
const sourcePaths = [
  'packages/plitejs/src/core/change/document-change.ts',
  'packages/plitejs/src/core/value-codec.ts',
  'packages/plitejs/src/diff/lib/compare.ts',
  'packages/plitejs/src/diff/lib/comparison-index.ts',
  'packages/plitejs/src/diff/lib/comparison-internal.ts',
  'packages/plitejs/src/diff/lib/comparison-matcher.ts',
  'packages/plitejs/src/diff/lib/comparison-types.ts',
  'benchmarks/editor/benchmarks/plite-structural-compare-benchmark.ts',
] as const;
const fingerprints = sourcePaths.map((path) => ({
  path,
  sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
}));

const cohorts = [
  { budgetMs: 100, kind: 'normal', nodes: 100, threeWayBudgetMs: 500 },
  { budgetMs: 300, kind: 'large', nodes: 1000, threeWayBudgetMs: 1500 },
  { budgetMs: 1500, kind: 'stress', nodes: 10_000, threeWayBudgetMs: 6000 },
  {
    budgetMs: 1500,
    kind: 'duplicate-heavy',
    nodes: 10_000,
    threeWayBudgetMs: 6000,
  },
] as const;

const createFixture = (kind: string, nodes: number) => {
  if (kind === 'duplicate-heavy') {
    const before = Array.from({ length: nodes }, () =>
      paragraph('duplicate alpha beta')
    );
    const after = before.map((node, index) =>
      index === Math.floor(nodes / 2)
        ? paragraph('duplicate alpha beta', { variant: 'changed' })
        : node
    );

    return { after, before };
  }
  const before = Array.from({ length: nodes }, (_value, index) =>
    paragraph(`block ${index} alpha beta gamma delta`)
  );
  const sourceIndex = Math.floor(nodes * 0.75);
  const targetIndex = Math.floor(nodes * 0.25);
  const after = [...before];
  const [moved] = after.splice(sourceIndex, 1);

  after.splice(
    targetIndex,
    0,
    paragraph(`${moved.children[0].text} with revised ending`)
  );

  return { after, before };
};

const rows = [];

for (const cohort of cohorts) {
  const { after, before } = createFixture(cohort.kind, cohort.nodes);
  const remote = before.map((node, index) =>
    index === before.length - 1 ? { ...node, remote: true } : node
  );
  const editor = createEditor({ initialValue: before });
  const baselineSamples: number[] = [];
  const candidateSamples: number[] = [];
  let reference: Awaited<ReturnType<typeof compare>> | undefined;

  for (let sample = 0; sample < warmups + samples; sample += 1) {
    const baselineRun = () => {
      const start = performance.now();

      DocumentChange.between({ children: before }, { children: after });

      return performance.now() - start;
    };
    const candidateRun = async () => {
      const start = performance.now();
      const comparison = await compare({
        after,
        before,
        schema: editor.read.schema,
      });

      assert.deepEqual(
        comparison.change.apply(comparison.before.document),
        comparison.after.document
      );
      assert.deepEqual(
        comparison.change
          .invert(comparison.before.document)
          .apply(comparison.after.document),
        comparison.before.document
      );
      assert.equal(Object.isFrozen(comparison.changes), true);
      if (reference) {
        assert.equal(comparison.id, reference.id);
        assert.deepEqual(comparison.changes, reference.changes);
        assert.deepEqual(comparison.diagnostics, reference.diagnostics);
      } else {
        reference = comparison;
      }

      return performance.now() - start;
    };
    let baselineMs: number;
    let candidateMs: number;

    if (sample % 2 === 0) {
      baselineMs = baselineRun();
      candidateMs = await candidateRun();
    } else {
      candidateMs = await candidateRun();
      baselineMs = baselineRun();
    }
    if (sample >= warmups) {
      baselineSamples.push(baselineMs);
      candidateSamples.push(candidateMs);
    }
  }

  const threeWayDurations: number[] = [];
  let threeWayReference: ThreeWayComparison | undefined;
  for (let sample = 0; sample < warmups + threeWaySamples; sample += 1) {
    const start = performance.now();
    const comparison = await compare({
      base: before,
      local: after,
      remote,
      schema: editor.read.schema,
    });
    const resolution = await resolveComparison({
      baseline: 'base',
      comparison,
    });

    assert.equal(comparison.conflicts.length, 0);
    assert.equal(resolution.status, 'resolved');
    if (resolution.status !== 'resolved') {
      throw new Error('Expected clean three-way resolution.');
    }
    assert.deepEqual(
      resolution.comparison.change.apply(resolution.comparison.before.document),
      resolution.comparison.after.document
    );
    if (threeWayReference) {
      assert.equal(comparison.id, threeWayReference.id);
      assert.deepEqual(comparison.changes, threeWayReference.changes);
      assert.deepEqual(comparison.conflicts, threeWayReference.conflicts);
    } else {
      threeWayReference = comparison;
    }
    if (sample >= warmups) {
      threeWayDurations.push(performance.now() - start);
    }
  }

  assert.ok(reference);
  const beforeIndex = createComparisonIndex(
    reference.before.document,
    editor.read.schema
  );
  const afterIndex = createComparisonIndex(
    reference.after.document,
    editor.read.schema
  );
  const matcherStart = performance.now();
  const matcher = await matchComparison(beforeIndex, afterIndex, reference.id, {
    createdRoots: reference.change.createRoots,
    deletedRoots: reference.change.deleteRoots,
  });
  const matcherMs = performance.now() - matcherStart;
  const candidate = summarize(candidateSamples);
  const threeWay = summarize(threeWayDurations);
  const baseline = summarize(baselineSamples);
  const passed =
    candidate.max <= cohort.budgetMs &&
    threeWay.max <= cohort.threeWayBudgetMs &&
    matcher.candidateEdges <= 100_000 &&
    matcher.changes.length > 0;

  rows.push({
    baseline,
    budgetMs: cohort.budgetMs,
    candidate,
    candidateEdges: matcher.candidateEdges,
    effects: reference.changes.reduce(
      (count, change) => count + change.effects.length,
      0
    ),
    kind: cohort.kind,
    localAlignmentCells: matcher.localAlignmentCells,
    matcherMs,
    nodes: cohort.nodes,
    outputGroups: reference.changes.length,
    passed,
    retainedBytes: Buffer.byteLength(
      JSON.stringify({
        after: reference.after,
        before: reference.before,
        changes: reference.changes,
        diagnostics: reference.diagnostics,
      })
    ),
    threeWay,
    threeWayBudgetMs: cohort.threeWayBudgetMs,
    threeWayConflicts: threeWayReference?.conflicts.length ?? 0,
    threeWayGroups: threeWayReference?.changes.length ?? 0,
    textUnits: beforeIndex.textUnits + afterIndex.textUnits,
    visitedNodes: beforeIndex.nodes.length + afterIndex.nodes.length,
  });
}

const passed = rows.every((row) => row.passed);

if (strict) assert.equal(passed, true);

const result = {
  benchmark: 'plite-structural-compare',
  cohorts,
  correctness: {
    canonicalApplyInverse: true,
    deterministicOutput: true,
    immutableResult: true,
    threeWayCleanResolution: true,
  },
  generatedAt: new Date().toISOString(),
  host: {
    cpu: cpus()[0]?.model ?? 'unknown',
    platform: platform(),
    release: release(),
    runtime: process.versions.bun
      ? `bun ${process.versions.bun}`
      : process.version,
  },
  planningWitnessMaxMs: {
    duplicateHeavy10000: 54.15,
    large1000: 15.8,
    normal100: 1.65,
    stress10000: 183.62,
  },
  rows,
  samples,
  threeWaySamples,
  source: {
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf-8',
    }).trim(),
    fingerprints,
  },
  thresholdPolicy: {
    candidateEdges: 'Every completed cohort must remain at or below 100000.',
    endToEnd:
      'Public compare max must remain within its frozen host budget: 100/300/1500/1500 ms.',
    threeWayEndToEnd:
      'Public three-way compare plus clean resolve max must remain within its frozen host budget: 500/1500/6000/6000 ms.',
    planningWitness:
      'The earlier witness maxima remain recorded as non-production reference measurements; they excluded public detachment, canonical construction and apply/inverse validation.',
  },
  version: 1,
  warmups,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_structural_compare_passed=${passed ? 1 : 0}\n`
);
for (const row of rows) {
  process.stdout.write(
    `METRIC plite_structural_compare_${row.kind.replace('-', '_')}_p95_ms=${
      row.candidate.p95
    }\n`
  );
  process.stdout.write(
    `METRIC plite_structural_compare_${row.kind.replace(
      '-',
      '_'
    )}_three_way_p95_ms=${row.threeWay.p95}\n`
  );
}

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}
