import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { authored } from '../../../packages/plitejs/src/authored';
import {
  records,
  type RecordTree,
} from '../../../packages/plitejs/src/authored/record-tree';
import {
  authoredState,
  type AuthoredRecord,
  type AuthoredState,
} from '../../../packages/plitejs/src/authored/state';
import {
  createEditor,
  defineExtension,
  defineStateField,
} from '../../../packages/plitejs/src/index';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const contractText = readFileSync(
  'docs/plans/artifacts/native-authored-changes/checkpoint-contract.json',
  'utf8'
);
const contract = JSON.parse(contractText);
const fingerprint = () =>
  execFileSync(
    'rg',
    [
      '--files',
      'packages/plitejs/src',
      'config/plite-source-aliases.ts',
      'config/workspace-source-entries.mjs',
      'benchmarks/editor/benchmarks/plite-authored-checkpoint-benchmark.ts',
    ],
    { encoding: 'utf8' }
  )
    .trim()
    .split('\n')
    .sort()
    .map((path) => ({
      path,
      sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
    }));
const sourceBefore = fingerprint();
const strict = process.env.PLITE_AUTHORED_CHECKPOINT_STRICT === '1';
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const at = { path: [0, 0], offset: 4 };
const percentile = (samples: number[], ratio: number) =>
  [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * ratio) - 1];

const collectPages = (state: AuthoredState) => {
  const pages = new Set<object>();
  const visit = <T>(tree: RecordTree<T> | null) => {
    if (!tree || pages.has(tree)) return;
    pages.add(tree);
    if (tree.kind === 'branch') for (const child of tree.children) visit(child);
  };
  visit(state.changes);
  visit(state.operations);
  visit(state.order);
  visit(state.vector);
  for (const [, operation] of records(state.operations)) visit(operation.seen);
  for (const [, change] of records(state.changes)) {
    visit(change.operations);
    visit(change.reviews);
  }
  return pages;
};

const rows = [];
for (const n of contract.cohorts as number[]) {
  const seed = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Base')],
  });
  const coldStart = performance.now();
  let changeId = '';
  for (let i = 0; i < n; i++)
    seed.update((tx) => {
      const id = tx.authored.propose();
      if (i === 0) changeId = id;
      tx.text.insert('x', { at });
    });
  const seedMs = performance.now() - coldStart;
  const initialValue = JSON.parse(JSON.stringify(seed.read.value()));

  for (let pass = 0; pass < contract.passes; pass++) {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue,
    });
    const initialState = editor.read.getField(authoredState);
    const initialRecords = [...records(initialState.changes)].map(
      ([, value]) => value
    );
    const baselineField = defineStateField<readonly AuthoredRecord[]>({
      key: 'benchmark.authored-records',
      initial: initialRecords,
      persist: {
        version: 1,
        encode: (value) => value,
        decode: (value) => value as readonly AuthoredRecord[],
      },
    });
    const baseline = createEditor({
      extensions: [
        defineExtension('checkpoint-baseline', {
          stateFields: [baselineField],
        }),
      ],
      initialValue: [paragraph('Base')],
    });
    const candidateSamples: number[] = [];
    const baselineSamples: number[] = [];
    let maxChangedPages = 0;
    let unrelatedPayloadClones = 0;
    for (
      let sample = 0;
      sample < contract.warmups + contract.samples;
      sample++
    ) {
      const previous = editor.read.getField(authoredState);
      const previousPages = collectPages(previous);
      const beforeRecords = new Map(records(previous.changes));
      const candidate = () => {
        const start = performance.now();
        editor.update((tx) => {
          tx.authored.propose({ changeId });
          tx.text.insert('y', { at });
        });
        editor.read.value();
        return performance.now() - start;
      };
      const baselineRun = () => {
        const start = performance.now();
        const next = baseline.read
          .getField(baselineField)
          .map((value) =>
            value.id === changeId
              ? { ...value, revision: value.revision + 1 }
              : value
          );
        baseline.update((tx) => tx.setField(baselineField, next));
        baseline.read.value();
        return performance.now() - start;
      };
      let candidateMs: number;
      let baselineMs: number;
      if (pass % 2) {
        candidateMs = candidate();
        baselineMs = baselineRun();
      } else {
        baselineMs = baselineRun();
        candidateMs = candidate();
      }
      const nextState = editor.read.getField(authoredState);
      maxChangedPages = Math.max(
        maxChangedPages,
        [...collectPages(nextState)].filter((page) => !previousPages.has(page))
          .length
      );
      for (const [id, value] of records(nextState.changes)) {
        if (id !== changeId && value !== beforeRecords.get(id))
          unrelatedPayloadClones++;
      }
      assert.deepEqual(editor.read.children(), [paragraph('Base')]);
      assert.equal(editor.read.authored.change(changeId)?.revision, sample + 2);
      assert.deepEqual(
        [...records(nextState.changes)].map(([, value]) => [
          value.id,
          value.authorId,
          value.status,
          value.revision,
        ]),
        baseline.read
          .getField(baselineField)
          .map((value) => [
            value.id,
            value.authorId,
            value.status,
            value.revision,
          ])
      );
      if (sample >= contract.warmups) {
        candidateSamples.push(candidateMs);
        baselineSamples.push(baselineMs);
      }
    }
    const saveStart = performance.now();
    const serialized = JSON.stringify(editor.read.value());
    const fullSerializeMs = performance.now() - saveStart;
    const restored = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(serialized),
    });
    assert.equal(
      restored.read.authored.select({ status: 'pending' }).changes.length,
      n
    );
    assert.equal(
      restored.read.authored.change(changeId)?.revision,
      contract.warmups + contract.samples + 1
    );
    assert.equal(
      [...records(initialState.changes)].find(
        ([, value]) => value.id === changeId
      )?.[1].revision,
      1
    );
    const candidateP95 = percentile(candidateSamples, 0.95);
    const baselineP95 = percentile(baselineSamples, 0.95);
    const candidateP99 = percentile(candidateSamples, 0.99);
    const passed =
      candidateP95 <= contract.budget.candidateP95Ms &&
      candidateP99 <= contract.budget.candidateP99Ms &&
      (candidateP95 <= baselineP95 * contract.budget.relativeP95 ||
        (candidateP95 < 1 && baselineP95 < 1)) &&
      maxChangedPages <= Math.ceil(Math.log2(n)) + 1 &&
      unrelatedPayloadClones === 0;
    const row = {
      n,
      pass: pass + 1,
      seedMs,
      candidateP95,
      candidateP99,
      baselineP95,
      maxChangedPages,
      unrelatedPayloadClones,
      fullSerializeMs,
      serializedBytes: Buffer.byteLength(serialized),
      candidateSamples,
      baselineSamples,
      passed,
    };
    rows.push(row);
    process.stderr.write(
      `${JSON.stringify({ ...row, candidateSamples: undefined, baselineSamples: undefined })}\n`
    );
  }
}
const sourceAfter = fingerprint();
const sourcesUnchanged =
  JSON.stringify(sourceBefore) === JSON.stringify(sourceAfter);
const result = {
  version: 1,
  benchmark: 'plite-authored-checkpoint',
  createdAt: new Date().toISOString(),
  contractSha256: createHash('sha256').update(contractText).digest('hex'),
  scope:
    'Native propose/amend, commit and immutable save envelope. Baseline updates one revision in a whole persisted record collection; the native arm additionally retains the complete new content operation. Compared public record identities/status/revisions match. Full serialization and fixture setup are measured separately. No browser, heap or unrelated-read-count claim.',
  sourceBefore,
  sourceAfter,
  sourcesUnchanged,
  runtime: process.versions,
  rows,
  passed: sourcesUnchanged && rows.every((row) => row.passed),
};
const output = process.argv
  .find((argument) => argument.startsWith('--output='))
  ?.slice('--output='.length);
if (output)
  writeBenchmarkArtifact(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(
  `METRIC plite_authored_checkpoint_passed=${Number(result.passed)}\n`
);
if (strict && !result.passed) process.exitCode = 1;
