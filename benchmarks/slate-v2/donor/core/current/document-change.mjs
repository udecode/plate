import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createEditor,
  DocumentChange,
} from '../../../../../packages/plitejs/src/index.ts';
import {
  getLastCommit,
  getSnapshot,
  replace,
} from '../../../../../packages/plitejs/src/internal/index.ts';
import {
  insertNodeChange,
  insertTextChange,
  moveNodeChange,
  removeTextChange,
  setNodeChange,
} from '../../../../../packages/plitejs/src/core/change/root-change.ts';
import { DocumentIndex } from '../../../../../packages/plitejs/src/core/change/document-index.ts';
import { createInternalDocumentChange } from '../../../../../packages/plitejs/src/core/change/document-change.ts';
import { RootChange } from '../../../../../packages/plitejs/src/core/change/root-change.ts';
import { PreparedTokenSlice } from '../../../../../packages/plitejs/src/core/change/tokens.ts';
import { round, summarize } from '../../shared/stats.mjs';

const runs = Number.parseInt(process.env.PLITE_CHANGESET_RUNS ?? '3', 10);
const fingerprints = () => Object.fromEntries([
  'packages/plitejs/src/core/change/document-index.ts',
  'packages/plitejs/src/core/change/root-change.ts',
  'packages/plitejs/src/core/change/document-change.ts',
  'benchmarks/slate-v2/donor/core/current/document-change.mjs',
].map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
const sourceBefore = fingerprints();
const iterations = Number.parseInt(
  process.env.PLITE_CHANGESET_ITERATIONS ?? '40',
  10
);
const blocks = Number.parseInt(
  process.env.PLITE_CHANGESET_BLOCKS ?? '1000',
  10
);

const paragraph = (index, text = `block-${index}`) => ({
  type: 'paragraph',
  children: [{ text }],
});

const createChildren = () =>
  Array.from({ length: blocks }, (_, index) => paragraph(index));

const setupEditor = (children) => {
  const editor = createEditor();

  replace(editor, {
    children,
    marks: null,
    selection: null,
  });
  editor.subscribeCommit(() => {});

  return editor;
};

const setupKernelPublisher = () => {
  let lastCommit;
  const subscribers = new Set();

  subscribers.add((commit) => {
    lastCommit = commit;
  });

  return {
    getLastCommit: () => lastCommit,
    publish: (commit) => {
      for (const subscriber of subscribers) subscriber(commit);
    },
  };
};

const scenarios = [
  {
    id: 'insertText',
    build: (document) => insertTextChange(document, [0, 0], 3, '++'),
  },
  {
    id: 'removeText',
    build: (document) =>
      removeTextChange(
        document,
        [Math.floor(blocks / 2), 0],
        1,
        'lock'
      ),
  },
  {
    id: 'setNode',
    build: (document) =>
      setNodeChange(document, [Math.floor(blocks / 3)], {
        id: 'changed',
      }),
  },
  {
    id: 'insertNode',
    build: (document) =>
      insertNodeChange(document, [blocks], paragraph(blocks, 'inserted')),
  },
  {
    id: 'moveNode',
    build: (document) => moveNodeChange(document, [blocks - 1], [1]),
  },
];

const toDocumentChange = (change) =>
  createInternalDocumentChange(new Map(change.empty ? [] : [['main', change]]));

const measureSetup = (children) => {
  const editorSamples = [];
  const indexSamples = [];

  for (let iteration = 0; iteration < iterations; iteration++) {
    let start = performance.now();

    setupEditor(children);
    editorSamples.push(performance.now() - start);

    start = performance.now();
    DocumentIndex.fromValue(children);
    indexSamples.push(performance.now() - start);
  }

  return {
    editorMs: summarize(editorSamples),
    indexMs: summarize(indexSamples),
  };
};

const measureScenario = (children, scenario) => {
  const editorApplySamples = [];
  const editorTransactionSamples = [];
  const kernelApplySamples = [];
  const kernelBuildSamples = [];
  const kernelEndToEndSamples = [];
  const kernelPublishSamples = [];
  const serializedReplaySamples = [];
  let editorCommitBytes = 0;
  let kernelChangeBytes = 0;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const editor = setupEditor(children);
    const document = DocumentIndex.fromValue(children);
    const value = { children, marks: null, selection: null };
    const publisher = setupKernelPublisher();
    let editorApplyElapsedMs = 0;
    let start = performance.now();
    const editorChange = toDocumentChange(scenario.build(document));

    editor.update((tx) => {
      const applyStart = performance.now();

      tx.changes.apply(editorChange);
      editorApplyElapsedMs = performance.now() - applyStart;
    });
    editorTransactionSamples.push(performance.now() - start);
    editorApplySamples.push(editorApplyElapsedMs);

    const kernelTransactionStart = performance.now();

    start = kernelTransactionStart;
    const rootChange = scenario.build(document);
    const change = toDocumentChange(rootChange);
    const buildElapsedMs = performance.now() - start;

    kernelBuildSamples.push(buildElapsedMs);

    start = performance.now();
    const next = change.apply(value);
    const applyElapsedMs = performance.now() - start;

    kernelApplySamples.push(applyElapsedMs);
    start = performance.now();
    publisher.publish(Object.freeze({ after: next, before: value, change }));

    const publishElapsedMs = performance.now() - start;

    kernelPublishSamples.push(publishElapsedMs);
    kernelEndToEndSamples.push(performance.now() - kernelTransactionStart);
    assert.ok(publisher.getLastCommit());

    const serialized = change.toJSON();

    start = performance.now();

    const replayedChange = DocumentChange.fromJSON(serialized);
    const replayed = replayedChange.apply(value);

    publisher.publish(
      Object.freeze({
        after: replayed,
        before: value,
        change: replayedChange,
      })
    );
    serializedReplaySamples.push(performance.now() - start);

    assert.deepEqual(
      next.children,
      getSnapshot(editor).children,
      `${scenario.id} produced divergent snapshots`
    );
    assert.deepEqual(
      replayed,
      next,
      `${scenario.id} serialized DocumentChange replay diverged`
    );

    if (iteration === 0) {
      editorCommitBytes = JSON.stringify(
        getLastCommit(editor)?.changes.toJSON() ?? null
      ).length;
      kernelChangeBytes = JSON.stringify(change.toJSON()).length;
    }
  }

  const editorApplyMs = summarize(editorApplySamples);
  const editorTransactionMs = summarize(editorTransactionSamples);
  const kernelApplyMs = summarize(kernelApplySamples);
  const kernelEndToEndMs = summarize(kernelEndToEndSamples);
  const serializedReplayMs = summarize(serializedReplaySamples);

  return {
    editorApplyMs,
    editorCommitBytes,
    editorTransactionMs,
    kernelApplyMs,
    kernelBuildMs: summarize(kernelBuildSamples),
    kernelChangeBytes,
    kernelEndToEndMs,
    kernelPublishMs: summarize(kernelPublishSamples),
    serializedReplayMedianRatio: round(
      serializedReplayMs.median /
        Math.max(editorTransactionMs.median, 0.000_001)
    ),
    serializedReplayMs,
    transactionMedianRatio: round(
      kernelEndToEndMs.median /
        Math.max(editorTransactionMs.median, 0.000_001)
    ),
  };
};

const runBenchmark = (run) => {
  const children = createChildren();
  const document = DocumentIndex.fromValue(children);
  const setup = measureSetup(children);
  const lanes = Object.fromEntries(
    scenarios.map((scenario) => [
      scenario.id,
      measureScenario(children, scenario),
    ])
  );
  const transactionRatios = Object.values(lanes).map(
    (lane) => lane.transactionMedianRatio
  );
  const serializedReplayRatios = Object.values(lanes).map(
    (lane) => lane.serializedReplayMedianRatio
  );
  const textCodeUnits = children.reduce(
    (length, node) => length + node.children[0].text.length,
    0
  );
  const sourceNodeCount = children.length * 2;

  return {
    run,
    setup,
    lanes,
    gate: {
      canonicalReplayUnder2x: serializedReplayRatios.every(
        (ratio) => ratio <= 2
      ),
      maxCanonicalReplayMedianRatio: Math.max(...serializedReplayRatios),
      maxTransactionMedianRatio: Math.max(...transactionRatios),
      parity: true,
      transactionUnder2x: transactionRatios.every((ratio) => ratio <= 2),
    },
    shape: {
      positionUnitsPerTextCodeUnit: round(document.length / textCodeUnits),
      serializedTokenBytes: JSON.stringify(document.tokens.toJSON()).length,
      sourceJsonBytes: JSON.stringify(children).length,
      tokenCount: document.tokenCount,
      tokenCountPerSourceNode: round(document.tokenCount / sourceNodeCount),
    },
  };
};

for (let warmup = 0; warmup < 3; warmup++) {
  const children = createChildren();
  const editor = setupEditor(children);
  const document = DocumentIndex.fromValue(children);
  const change = toDocumentChange(scenarios[0].build(document));

  editor.update((tx) => tx.changes.apply(change));
  change.apply({ children, marks: null, selection: null });
}

const results = Array.from({ length: runs }, (_, index) =>
  runBenchmark(index + 1)
);
const editorTransactionGate = results.every(
  (result) => result.gate.transactionUnder2x
);
const canonicalReplayGate = results.every(
  (result) => result.gate.canonicalReplayUnder2x
);
const promotionGate = editorTransactionGate && canonicalReplayGate;
const textBatches = [100, 1000, 10000].map((count) => {
  const edits = Math.min(120, count - 1);
  const before = DocumentIndex.fromValue(Array.from({ length: count }, (_, index) => paragraph(index)));
  const change = RootChange.create(before, Array.from({ length: edits }, (_, index) => ({
    from: before.nodeRange([index, 0]).from + 1,
    insert: PreparedTokenSlice.text('!'),
  })));
  const fromIndexedValue = DocumentIndex.fromIndexedValue;
  let publications = 0;
  DocumentIndex.fromIndexedValue = function (indexed) {
    if (indexed.value.length === count) publications++;
    return fromIndexedValue.call(this, indexed);
  };
  let actual;
  try {
    actual = change.apply(before);
  } finally {
    DocumentIndex.fromIndexedValue = fromIndexedValue;
  }
  assert.deepEqual(actual.value, before.value.map((node, index) => index < edits ? {
    ...node, children: [{ ...node.children[0], text: '!' + node.children[0].text }],
  } : node));
  assert.equal(actual.value[count - 1], before.value[count - 1]);
  assert.deepEqual(change.invert(before).apply(actual).value, before.value);
  assert.deepEqual(RootChange.fromJSON(change.toJSON()).apply(before).value, actual.value);
  const samples = [];
  for (let sample = 0; sample <= 20; sample++) {
    const start = performance.now();
    change.apply(before);
    const elapsed = performance.now() - start;
    if (sample > 0) samples.push(elapsed);
  }
  const durationMs = summarize(samples);
  return { blocks: count, edits, publications, durationMs, pass: publications === 1 && durationMs.p95 <= 16.67 };
});
const sourceAfter = fingerprints();
assert.deepEqual(sourceAfter, sourceBefore, 'Measured source changed during the benchmark');
const artifact = {
  artifactVersion: 3,
  benchmark: 'plite-document-change',
  sourceIdentity: { measuredInputs: sourceAfter },
  textBatches,
  blocks,
  iterations,
  runs,
  fairness: {
    editor:
      'one prebuilt Plite editor with one commit subscriber; timer includes canonical DocumentChange construction, native transaction apply, commit construction, and publication',
    kernel:
      'one prebuilt indexed JSON document with one commit subscriber; timer includes private root-change construction, DocumentChange wrapping, immutable apply, commit construction, and publication',
    serializedReplay:
      'every scenario reconstructs DocumentChange from its versioned JSON envelope, applies it, publishes the same minimal commit, and must remain under 2x editor transaction time',
    excluded:
      'React, DOM, history, collaboration, and transaction fields/effects measured by dedicated lanes',
    memoryProxy:
      'serialized retained shapes and token/index unit counts; not process heap',
  },
  thresholdPolicy: {
    textBatchPublications: 1,
    textBatchP95MaxMs: 16.67,
    distributionGate:
      'The 2x time gate compares per-lane medians across 40 iterations in each of three runs. p75/p95/p99/max remain diagnostics because independently sampled sub-millisecond tails are dominated by scheduler and garbage-collection outliers; p99 is the maximum at this sample count.',
    parityRequired: true,
    repeatRunsRequired: 3,
    timeRegressionLimit: 2,
    tokenShapeDiagnosticOnly:
      'Explicit open/text/close tokens preserve empty JSON leaves; compact storage is a separate representation decision.',
  },
  gate: {
    canonicalReplayUnder2x: canonicalReplayGate,
    parity: true,
    promoteRepresentation: promotionGate,
    transactionUnder2x: editorTransactionGate,
  },
  results,
};
const artifactPath = fileURLToPath(
  new URL(
    '../../../../../docs/plans/artifacts/wordgard-plite-rewrite-comparison/changeset-prototype-benchmark.json',
    import.meta.url
  )
);

await mkdir(dirname(artifactPath), { recursive: true });
await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`METRIC plite_document_change_guard_failures=${Number(!promotionGate) + textBatches.filter((row) => !row.pass).length}`);
console.log(`METRIC plite_document_change_text_batch_p95_ms=${Math.max(...textBatches.map((row) => row.durationMs.p95))}`);
console.log(`ARTIFACT ${artifactPath}`);

if (!promotionGate || textBatches.some((row) => !row.pass)) process.exitCode = 1;
