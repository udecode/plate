import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  BaseParagraphPlugin,
  createEditor,
} from '../../../packages/platejs/src/core';
import { BaseSuggestionPlugin } from '../../../packages/platejs/src/features/suggestion/lib/BaseSuggestionPlugin';
import { createEditorView } from '../../../packages/plitejs/src';
import { authored } from '../../../packages/plitejs/src/authored';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const contractText = readFileSync(
  'docs/plans/artifacts/native-authored-changes/probe-contract.json',
  'utf-8'
);
const contract = JSON.parse(contractText) as {
  cohorts: Array<{
    name: string;
    blocks: number;
    pending: number;
    views: number;
  }>;
  passes: number;
  samples: number;
  warmups: number;
};
type Cohort = (typeof contract.cohorts)[number];
const fingerprint = () =>
  execFileSync(
    'rg',
    [
      '--files',
      'packages/plitejs/src',
      'packages/platejs/src',
      'config/plite-source-aliases.ts',
      'config/workspace-source-entries.mjs',
      'benchmarks/editor/benchmarks/plite-authored-scale-benchmark.ts',
    ],
    { encoding: 'utf-8' }
  )
    .trim()
    .split('\n')
    .sort()
    .map((path) => ({
      path,
      sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
    }));
const sourceBefore = fingerprint();
const output = process.argv
  .find((value) => value.startsWith('--output='))
  ?.slice('--output='.length);
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const at = (offset: number, block = 0) => ({ path: [block, 0], offset });
const percentile = (values: readonly number[], ratio: number) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * ratio) - 1];
const summary = (samples: number[]) => ({
  p50Ms: percentile(samples, 0.5),
  p95Ms: percentile(samples, 0.95),
  p99Ms: percentile(samples, 0.99),
  maxMs: Math.max(...samples),
  samples,
});
const expectedText = (cohort: Cohort, count: number) =>
  `${cohort.name === 'overlap' ? 'Se' : 'se'}${'x'.repeat(count)}ed`;

const nativeRun = (cohort: Cohort) => {
  const coldStart = performance.now();
  const editor = createEditor({
    plugins: [BaseParagraphPlugin],
    extensions: [authored({ authorId: 'alice' })],
    initialValue: Array.from({ length: cohort.blocks }, () =>
      paragraph(cohort.pending ? '' : 'seed')
    ),
  });
  let changeId = '';
  for (let index = 0; index < cohort.pending; index++) {
    editor.update((tx) => {
      const identity = tx.authored.propose();
      if (index === 0 || cohort.name === 'overlap') changeId = identity;
      if (cohort.name === 'overlap' && index > 0) {
        tx.text.delete({ at: { anchor: at(0), focus: at(1) } });
        tx.text.insert(index % 2 ? 'S' : 's', { at: at(0) });
      } else tx.text.insert('seed', { at: at(0, index) });
    });
  }
  const views = Array.from({ length: cohort.views }, () =>
    createEditorView(editor, {
      authored: cohort.pending
        ? { intent: 'propose', projection: 'proposed' }
        : { intent: 'edit', projection: 'accepted' },
    })
  );
  const editing = views[0];
  assert.ok(editing);
  const coldMs = performance.now() - coldStart;
  assert.equal(
    editor.read.authored.select({ status: 'pending' }).changes.length,
    cohort.pending
  );
  const samples: number[] = [];
  let cardReads = 0;
  for (let index = 0; index < contract.warmups + contract.samples; index++) {
    const start = performance.now();
    if (cohort.name === 'overlap') {
      editing.update((tx) => {
        tx.authored.propose({ changeId });
        tx.text.insert('x', { at: at(2 + index) });
      });
    } else editing.update.text.insert('x', { at: at(2 + index) });
    for (let card = 0; cohort.pending && card < cohort.views; card++) {
      assert.equal(
        views[card].read.authored.change(changeId)?.revision,
        index + 2
      );
      cardReads += 1;
    }
    editor.read.value();
    if (index >= contract.warmups) samples.push(performance.now() - start);
    if (cohort.pending) {
      assert.deepEqual(editor.read.children()[0], paragraph(''));
      assert.equal(
        editing.read
          .children()[0]
          .children.map((node) => node.text ?? '')
          .join(''),
        expectedText(cohort, index + 1)
      );
    } else {
      assert.equal(
        editor.read
          .children()[0]
          .children.map((node) => node.text ?? '')
          .join(''),
        expectedText(cohort, index + 1)
      );
    }
  }
  const saveStart = performance.now();
  const serialized = JSON.stringify(editor.read.value());
  const saveMs = performance.now() - saveStart;
  const loadStart = performance.now();
  const restored = createEditor({
    plugins: [BaseParagraphPlugin],
    extensions: [authored({ authorId: 'alice' })],
    initialValue: JSON.parse(serialized),
  });
  const loadMs = performance.now() - loadStart;
  assert.equal(
    restored.read.authored.select({ status: 'pending' }).changes.length,
    cohort.pending
  );
  assert.deepEqual(restored.read.children()[0], editor.read.children()[0]);
  return {
    ...summary(samples),
    coldMs,
    saveMs,
    loadMs,
    serializedBytes: Buffer.byteLength(serialized),
    cardReads,
    pending: cohort.pending,
    actualViews: views.length,
    unrelatedRecordsVisited: null,
    heapBytes: null,
  };
};

const baselineRun = (cohort: Cohort) => {
  const coldStart = performance.now();
  const initialValue = Array.from({ length: cohort.blocks }, (_, block) => {
    const leaf: Record<string, unknown> & { text: string } = {
      text: cohort.name === 'overlap' ? 'Seed' : 'seed',
    };
    if (cohort.pending) {
      leaf.suggestion = true;
      for (const index of cohort.name === 'overlap'
        ? Array.from(
            { length: cohort.pending },
            (_entry, proposalIndex) => proposalIndex
          )
        : [block]) {
        leaf[`suggestion_g${index}`] = {
          id: `g${index}`,
          createdAt: 1,
          type: 'insert',
          userId: 'alice',
        };
      }
    }
    return { type: 'paragraph', children: [leaf] };
  });
  const editor = createEditor({
    plugins: [
      BaseParagraphPlugin,
      ...(cohort.pending
        ? [
            BaseSuggestionPlugin.configure({
              initialState: { currentUserId: 'alice', isSuggesting: true },
            }),
          ]
        : []),
    ],
    initialValue,
  });
  editor.update.selection.set(at(2));
  const coldMs = performance.now() - coldStart;
  const samples: number[] = [];
  let returnedReviews = 0;
  for (let index = 0; index < contract.warmups + contract.samples; index++) {
    const start = performance.now();
    editor.update.text.insert('x');
    for (let card = 0; cohort.pending && card < cohort.views; card++) {
      const reviews = editor.plugin(BaseSuggestionPlugin).read.reviews();
      assert.equal(reviews.length, cohort.pending);
      assert.ok(reviews.find((review) => review.id === 'g0'));
      returnedReviews += reviews.length;
    }
    editor.read.value();
    if (index >= contract.warmups) samples.push(performance.now() - start);
    assert.equal(
      editor.read
        .children()[0]
        .children.map((node) => node.text ?? '')
        .join(''),
      expectedText(cohort, index + 1)
    );
  }
  return { ...summary(samples), coldMs, returnedReviews };
};

const rows = [];
for (let pass = 0; pass < contract.passes; pass++) {
  for (const cohort of contract.cohorts) {
    let candidate: ReturnType<typeof nativeRun>;
    let baseline: ReturnType<typeof baselineRun>;
    if (pass % 2) {
      candidate = nativeRun(cohort);
      baseline = baselineRun(cohort);
    } else {
      baseline = baselineRun(cohort);
      candidate = nativeRun(cohort);
    }
    const checks = {
      absolute:
        candidate.p95Ms <= (cohort.name === 'stress' ? 100 : 50) &&
        candidate.p99Ms <= 100,
      materiality:
        !['large', 'stress'].includes(cohort.name) ||
        candidate.p95Ms <= baseline.p95Ms * 0.8 ||
        (candidate.p95Ms < 1 && baseline.p95Ms < 1),
      zeroOverhead:
        cohort.pending !== 0 ||
        candidate.p95Ms - baseline.p95Ms <= Math.max(1, baseline.p95Ms * 0.1),
    };
    const row = {
      pass: pass + 1,
      cohort,
      candidate,
      baseline,
      checks,
      passed: Object.values(checks).every(Boolean),
    };
    rows.push(row);
    if (output)
      {writeBenchmarkArtifact(
        output,
        `${JSON.stringify(
          {
            version: 1,
            benchmark: 'plite-authored-scale',
            status: 'running',
            createdAt: new Date().toISOString(),
            sourceBefore,
            rows,
            passed: false,
            fullContractComplete: false,
          },
          null,
          2
        )}\n`
      );}
    process.stderr.write(
      `${JSON.stringify({ pass: row.pass, cohort: cohort.name, candidateP95: candidate.p95Ms, candidateP99: candidate.p99Ms, baselineP95: baseline.p95Ms, passed: row.passed })}\n`
    );
  }
}
const sourceAfter = fingerprint();
const sourcesUnchanged =
  JSON.stringify(sourceBefore) === JSON.stringify(sourceAfter);
const result = {
  version: 1,
  benchmark: 'plite-authored-scale',
  createdAt: new Date().toISOString(),
  runtime: process.versions,
  contractSha256: createHash('sha256').update(contractText).digest('hex'),
  sourceBefore,
  sourceAfter,
  sourcesUnchanged,
  scope:
    'Native proposal creation, editing through real native views, immutable commit/value read and current-card reads through each view. Uses the exact Plate facade and the frozen proposed text, review counts, cohort sizes and timing bounds. All samples and passes retained.',
  limitations: [
    'Native headless views are included. DOM event-to-paint, trusted input, clipboard and composition are separate required gates.',
    'Overlap has 1000 actual sequential native proposals replacing the first character; legacy fixture has 1000 insertion labels on the same leaf. Ownership semantics differ; no overlap ratio claim.',
    'Unrelated record visits, heap, retention and collaboration transport remain unmeasured.',
    'Individual and bulk decision cohorts are separate required gates.',
  ],
  rows,
  passed: sourcesUnchanged && rows.every((row) => row.passed),
  fullContractComplete: false,
};
if (output) {
  writeBenchmarkArtifact(output, `${JSON.stringify(result, null, 2)}\n`);
}
process.stdout.write(
  `METRIC plite_authored_scale_passed=${Number(result.passed)}\n`
);
if (process.env.PLITE_AUTHORED_SCALE_STRICT === '1' && !result.passed) {
  process.exitCode = 1;
}
