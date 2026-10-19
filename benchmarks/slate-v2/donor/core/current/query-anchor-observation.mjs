import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createEditor } from '../../../../../packages/plitejs/src/index.ts';
import { createEditorCommit } from '../../../../../packages/plitejs/src/core/commit.ts';
import { DocumentIndex } from '../../../../../packages/plitejs/src/core/change/document-index.ts';
import { buildSnapshotIndex } from '../../../../../packages/plitejs/src/core/snapshot-index.ts';
import { seedNodeKeys } from '../../../../../packages/plitejs/src/utils/node-keys.ts';
import * as Editor from '../../../../../packages/plitejs/src/internal/index.ts';
import {
  round,
  summarize,
  writeBenchmarkArtifact,
} from '../../shared/stats.mjs';

const iterations = Number(process.env.PLITE_QUERY_ANCHOR_BENCH_ITERATIONS || 5);
const blockCount = Number(process.env.PLITE_QUERY_ANCHOR_BENCH_BLOCKS || 200);
const writeOps = Number(process.env.PLITE_QUERY_ANCHOR_BENCH_WRITE_OPS || 40);
const queryOps = Number(process.env.PLITE_QUERY_ANCHOR_BENCH_QUERY_OPS || 200);
const anchorCount = Number(
  process.env.PLITE_QUERY_ANCHOR_BENCH_ANCHORS || 50
);
const measuredFiles = [
  'packages/plitejs/src/core/commit.ts',
  'packages/plitejs/src/core/change/document-index.ts',
  'packages/plitejs/src/core/public-state.ts',
  'packages/plitejs/src/core/snapshot-index.ts',
  'packages/plitejs/src/interfaces/editor.ts',
  'packages/plitejs/src/interfaces/node.ts',
  'benchmarks/slate-v2/donor/core/current/query-anchor-observation.mjs',
];
const fingerprint = () => Object.fromEntries(measuredFiles.map((file) => [
  file, createHash('sha256').update(readFileSync(file)).digest('hex'),
]));
const sourceBefore = fingerprint();

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `block-${index}` }],
  }));

const createEditorWithChildren = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(blockCount),
    selection: null,
    marks: null,
  });

  return editor;
};

const write = (editor, fn) => {
  editor.update(fn);
};

const insertText = (editor, text, options) => {
  write(editor, (tx) => tx.text.insert(text, options));
};

const countIterator = (iterator) => {
  let count = 0;

  for (const _ of iterator) {
    count += 1;
  }

  return count;
};

const collectIterator = (iterator) => {
  const entries = [];

  for (const entry of iterator) {
    entries.push(entry);
  }

  return entries;
};

const matchesTopLevelPath = (targetIndex) => (_node, path) =>
  path.length === 1 && path[0] === targetIndex;

const readFirstMatchByArray = (editor, targetIndex) =>
  editor.read(
    (state) =>
      collectIterator(
        state.nodes.entries({
          at: [],
          match: matchesTopLevelPath(targetIndex),
        })
      )[0]
  );

const readFirstMatchByToArray = (editor, targetIndex) =>
  editor.read(
    (state) =>
      state.nodes.toArray({
        at: [],
        match: matchesTopLevelPath(targetIndex),
      })[0]
  );

const readFirstMatchByFind = (editor, targetIndex) =>
  editor.read((state) =>
    state.nodes.find({
      at: [],
      match: matchesTopLevelPath(targetIndex),
    })
  );

const readFirstMatchBySome = (editor, targetIndex) =>
  editor.read((state) =>
    state.nodes.some({
      at: [],
      match: matchesTopLevelPath(targetIndex),
    })
  );

const readAllByArray = (editor) =>
  editor.read(
    (state) => collectIterator(state.nodes.entries({ at: [] })).length
  );

const readAllByToArray = (editor) =>
  editor.read((state) => state.nodes.toArray({ at: [] }).length);

const readAllByMappedToArray = (editor) =>
  editor.read(
    (state) => state.nodes.toArray({ at: [] }, ([, path]) => path).length
  );

const measureLane = (setup, run) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    const start = performance.now();
    run(editor);
    const duration = performance.now() - start;

    if (iteration > 0) {
      samples.push(duration);
    }
  }

  return summarize(samples);
};

const writeOnlyInsertTextMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < writeOps; index += 1) {
      const path = [index % blockCount, 0];

      insertText(editor, 'X', {
        at: { path, offset: 0 },
      });
    }
  }
);

const nodesReadAfterWriteMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let nodeCount = 0;

    for (let index = 0; index < writeOps; index += 1) {
      const path = [index % blockCount, 0];

      insertText(editor, 'X', {
        at: { path, offset: 0 },
      });

      nodeCount += editor.read((state) =>
        countIterator(state.nodes.entries({ at: [] }))
      );
    }

    if (nodeCount <= 0) {
      throw new Error('nodesReadAfterWriteMs did not observe any nodes');
    }
  }
);

const firstMatchArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByArray(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchArrayMs did not observe every first match');
  }
});

const firstMatchToArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByToArray(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchToArrayMs did not observe every first match');
  }
});

const firstMatchFindMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByFind(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchFindMs did not observe every first match');
  }
});

const firstMatchSomeMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchBySome(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchSomeMs did not observe every first match');
  }
});

const allEntriesArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let total = 0;

  for (let index = 0; index < queryOps; index += 1) {
    total += readAllByArray(editor);
  }

  if (total <= 0) {
    throw new Error('allEntriesArrayMs did not observe any entries');
  }
});

const allEntriesToArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let total = 0;

  for (let index = 0; index < queryOps; index += 1) {
    total += readAllByToArray(editor);
  }

  if (total <= 0) {
    throw new Error('allEntriesToArrayMs did not observe any entries');
  }
});

const allEntriesMappedToArrayMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let total = 0;

    for (let index = 0; index < queryOps; index += 1) {
      total += readAllByMappedToArray(editor);
    }

    if (total <= 0) {
      throw new Error('allEntriesMappedToArrayMs did not observe any entries');
    }
  }
);

const lastMatchFindMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByFind(editor, blockCount - 1)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('lastMatchFindMs did not observe every last match');
  }
});

const noMatchFindMs = measureLane(createEditorWithChildren, (editor) => {
  let missing = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (!readFirstMatchByFind(editor, blockCount + 1)) {
      missing += 1;
    }
  }

  if (missing !== queryOps) {
    throw new Error('noMatchFindMs unexpectedly found a match');
  }
});

const positionsReadAfterWriteMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let positionCount = 0;

    for (let index = 0; index < writeOps; index += 1) {
      const blockIndex = index % blockCount;
      const path = [blockIndex, 0];

      insertText(editor, 'X', {
        at: { path, offset: 0 },
      });

      positionCount += countIterator(
        Editor.positions(editor, { at: [blockIndex] })
      );
    }

    if (positionCount <= 0) {
      throw new Error(
        'positionsReadAfterWriteMs did not observe any positions'
      );
    }
  }
);

const pathAnchorRebaseMs = measureLane(createEditorWithChildren, (editor) => {
  const anchors = Array.from({ length: anchorCount }, (_, index) =>
    editor.anchor([index], {
      association: 'forward',
      deletion: 'nearest',
    })
  );
  let seen = 0;

  for (let index = 0; index < Math.min(writeOps, anchorCount); index += 1) {
    write(editor, (tx) =>
      tx.nodes.move({
        at: [index],
        to: [blockCount - 1],
      })
    );

    for (const anchor of anchors) {
      if (anchor.resolve()) {
        seen += 1;
      }
    }
  }

  anchors.forEach((anchor) => {
    anchor.release();
  });

  if (seen <= 0) {
    throw new Error('pathAnchorRebaseMs did not observe live anchors');
  }
});

const rangeAnchorRebaseMs = measureLane(createEditorWithChildren, (editor) => {
  const anchors = Array.from({ length: anchorCount }, (_, index) =>
    editor.anchor({
        anchor: { path: [index, 0], offset: 0 },
        focus: { path: [index, 0], offset: 2 },
      },
      { association: 'inward', deletion: 'nearest' }
    )
  );
  let seen = 0;

  for (let index = 0; index < Math.min(writeOps, anchorCount); index += 1) {
    insertText(editor, 'YZ', {
      at: { path: [index, 0], offset: 1 },
    });

    for (const anchor of anchors) {
      if (anchor.resolve()) {
        seen += 1;
      }
    }
  }

  anchors.forEach((anchor) => {
    anchor.release();
  });

  if (seen <= 0) {
    throw new Error('rangeAnchorRebaseMs did not observe live anchors');
  }
});

const rangeAnchorsInspectionMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    const anchors = Array.from({ length: anchorCount }, (_, index) =>
      editor.anchor({
          anchor: { path: [index, 0], offset: 0 },
          focus: { path: [index, 0], offset: 1 },
        },
        { association: 'inward', deletion: 'nearest' }
      )
    );
    let seen = 0;

    for (let index = 0; index < Math.min(writeOps, anchorCount); index += 1) {
      insertText(editor, 'Q', {
        at: { path: [index, 0], offset: 0 },
      });

      seen += anchors.filter((anchor) => anchor.resolve()).length;
    }

    anchors.forEach((anchor) => {
      anchor.release();
    });

    if (seen <= 0) {
      throw new Error(
        'rangeAnchorsInspectionMs did not observe tracked anchors'
      );
    }
  }
);

const commitQueries = [100, 1000, 10_000].map((count) => {
  const editor = createEditor({ initialValue: createChildren(count) });
  const previous = Editor.getSnapshot(editor);
  const missingKey = previous.index.keyAt([0]);

  Editor.replace(editor, {
    children: createChildren(count).map((node) => ({ ...node, updated: true })),
    selection: null,
  });
  const commit = Editor.getLastCommit(editor);
  assert.ok(commit && missingKey);
  const ids = commit.changed.nodeKeysAll('node');
  const queryIds = ids.slice(0, count);
  const membership = [];
  const publication = [];
  let snapshotChanges = 0;
  let membershipHits = 0;

  for (let sample = 0; sample < 21; sample++) {
    let hits = 0;
    let start = performance.now();
    for (const id of queryIds) hits += Number(commit.changed.hasNodeKey(id, 'node'));
    const duration = performance.now() - start;
    assert.equal(hits, queryIds.length);
    membershipHits = hits;
    start = performance.now();
    for (let query = 0; query < 100; query++) {
      if (commit.changed.nodeKeysAll('node') !== ids) snapshotChanges++;
    }
    const publicationDuration = performance.now() - start;
    if (sample > 0) {
      membership.push(duration);
      publication.push(publicationDuration);
    }
  }

  assert.equal(commit.changed.hasNodeKey('missing-runtime-key', 'node'), false);
  assert.equal(previous.index.keyAt([0]), missingKey);
  const membershipMs = summarize(membership);
  const publicationMs = summarize(publication);
  return {
    count,
    counters: { changedKeys: ids.length, membershipHits, queriesPerSample: queryIds.length, snapshotChanges },
    membershipMs,
    publicationMs,
    pass: membershipMs.p95 <= 16.67 && publicationMs.p95 <= 16.67 && snapshotChanges === 0,
  };
});
const selectionQueries = [100, 1000, 10_000, 100_000].map((count) => {
  const editor = createEditor({ initialValue: createChildren(count) });
  const samples = [];
  let enumerated = 0;
  let keyReads = 0;
  const boundedIndex = (index) => ({
    entries: () => { const entries = index.entries(); enumerated += entries.length; return entries; },
    keyAt: (path) => { keyReads++; return index.keyAt(path); },
    pathOf: (key) => index.pathOf(key),
  });

  for (let sample = 0; sample < 21; sample++) {
    const before = Editor.getSnapshot(editor);
    editor.update.selection.set({
      anchor: { path: [count - 1, 0], offset: 0 },
      focus: { path: [count - 1, 0], offset: 1 + sample % 2 },
    });
    const actual = Editor.getLastCommit(editor);
    assert.ok(actual);
    const commit = createEditorCommit({
      after: { ...actual.after, index: boundedIndex(actual.after.index) },
      afterValue: { children: actual.after.children },
      annotations: {},
      before: { ...before, index: boundedIndex(before.index) },
      beforeValue: { children: before.children },
      changes: actual.changes,
      dirtyStateKeys: [],
      editor,
      effects: [],
      selectionAfter: actual.selectionAfter,
      selectionAfterRoot: 'main',
      selectionBefore: actual.selectionBefore,
      selectionBeforeRoot: 'main',
      selectionChanged: true,
      tags: [],
    }, { previousVersion: sample, version: sample + 1 });
    enumerated = 0;
    keyReads = 0;
    const start = performance.now();
    const ids = commit.changed.nodeKeysAll('selection');
    for (const kind of ['node', 'path', 'text', 'presence']) {
      assert.equal(commit.changed.nodeKeysAll(kind).length, 0);
    }
    assert.equal(commit.changed.hasAny('root-order'), false);
    const elapsed = performance.now() - start;
    assert.deepEqual(new Set(ids), new Set([
      actual.after.index.keyAt([count - 1]),
      actual.after.index.keyAt([count - 1, 0]),
    ]));
    if (sample > 0) samples.push(elapsed);
  }
  const durationMs = summarize(samples);
  return { count, durationMs, counters: { enumerated, keyReads }, pass: enumerated === 0 && keyReads <= 8 && durationMs.p95 <= 16.67 };
});
const structuralQueries = [100, 1000, 10_000].map((count) => {
  const samples = [];
  let enumerated = 0;
  let keyReads = 0;
  const boundedIndex = (index) => ({
    entries: () => { const entries = index.entries(); enumerated += entries.length; return entries; },
    keyAt: (path) => { keyReads++; return index.keyAt(path); },
    pathOf: (key) => index.pathOf(key),
  });
  for (let sample = 0; sample < 21; sample++) {
    const editor = createEditor({ initialValue: createChildren(count) });
    const before = Editor.getSnapshot(editor);
    editor.update.nodes.insert({ type: 'paragraph', children: [{ text: 'appended' }] }, { at: [count] });
    const actual = Editor.getLastCommit(editor);
    assert.ok(actual);
    const commit = createEditorCommit({
      after: { ...actual.after, index: boundedIndex(actual.after.index) },
      afterValue: { children: actual.after.children },
      annotations: {},
      before: { ...before, index: boundedIndex(before.index) },
      beforeValue: { children: before.children },
      changes: actual.changes,
      dirtyStateKeys: [],
      editor,
      effects: [],
      selectionAfter: null,
      selectionAfterRoot: 'main',
      selectionBefore: null,
      selectionBeforeRoot: 'main',
      selectionChanged: false,
      tags: [],
    }, { previousVersion: 0, version: 1 });
    enumerated = 0;
    keyReads = 0;
    const start = performance.now();
    const ids = commit.changed.nodeKeysAll('path');
    assert.equal(commit.changed.hasAny('root-order'), true);
    assert.equal(commit.changed.hasAny('structure'), true);
    const duration = performance.now() - start;
    assert.deepEqual(new Set(ids), new Set([actual.after.index.keyAt([count]), actual.after.index.keyAt([count, 0])]));
    if (sample > 0) samples.push(duration);
  }
  const durationMs = summarize(samples);
  return { count, durationMs, counters: { enumerated, keyReads }, pass: enumerated === 0 && keyReads <= 64 && durationMs.p95 <= 16.67 };
});
const immutableIndexCache = [100, 1000, 10_000, 100_000].map((count) => {
  const document = DocumentIndex.fromValue(createChildren(count));
  const children = document.value;
  let enumerations = 0;
  const input = new Proxy(children, {
    ownKeys(value) { enumerations++; return Reflect.ownKeys(value); },
  });
  const instrumented = DocumentIndex.fromValue(input);
  enumerations = 0;
  assert.equal(DocumentIndex.fromValue(input), instrumented);
  const samples = [];
  for (let sample = 0; sample <= iterations; sample++) {
    const start = performance.now();
    for (let read = 0; read < 100; read++) {
      assert.equal(DocumentIndex.fromValue(children), document);
    }
    const duration = performance.now() - start;
    if (sample > 0) samples.push(duration);
  }
  const durationMs = summarize(samples);
  return { count, reads: 100, enumerations, durationMs, pass: enumerations === 0 && durationMs.p95 <= 16.67 };
});
const coldSnapshotIndex = [100, 1000, 10_000, 100_000].map((count) => {
  const children = DocumentIndex.fromValue(createChildren(count)).value;
  const owner = {};
  seedNodeKeys(children, owner);
  let nodeReads = 0;
  const input = new Proxy(children, {
    get(value, property, receiver) {
      if (typeof property === 'string' && /^\d+$/.test(property)) nodeReads++;
      return Reflect.get(value, property, receiver);
    },
  });
  const observed = buildSnapshotIndex(owner, input);
  const constructionReads = nodeReads;
  nodeReads = 0;
  const key = observed.keyAt([count - 1, 0]);
  assert.ok(key);
  assert.deepEqual(observed.pathOf(key), [count - 1, 0]);
  const samples = [];
  for (let sample = 0; sample <= 20; sample++) {
    const start = performance.now();
    const index = buildSnapshotIndex(owner, children);
    assert.equal(index.keyAt([count - 1, 0]), key);
    const elapsed = performance.now() - start;
    if (sample > 0) samples.push(elapsed);
  }
  const durationMs = summarize(samples);
  return { count, constructionReads, lookupReads: nodeReads, durationMs, pass: constructionReads === 0 && nodeReads === 1 && durationMs.p95 <= 16.67 };
});
const sourceAfter = fingerprint();
assert.deepEqual(sourceAfter, sourceBefore, 'Measured source changed during the benchmark');
const queryFailures = [...commitQueries, ...selectionQueries, ...structuralQueries, ...immutableIndexCache, ...coldSnapshotIndex].filter((row) => !row.pass).length;

const summary = {
  lane: 'plite-query-anchor-observation',
  iterations,
  commitQueries,
  selectionQueries,
  structuralQueries,
  immutableIndexCache,
  coldSnapshotIndex,
  sourceIdentity: { measuredInputs: sourceAfter },
  config: {
    blockCount,
    queryOps,
    anchorCount,
    writeOps,
  },
  lanes: {
    writeOnlyInsertTextMs,
    nodesReadAfterWriteMs,
    firstMatchArrayMs,
    firstMatchToArrayMs,
    firstMatchFindMs,
    firstMatchSomeMs,
    allEntriesArrayMs,
    allEntriesToArrayMs,
    allEntriesMappedToArrayMs,
    lastMatchFindMs,
    noMatchFindMs,
    positionsReadAfterWriteMs,
    pathAnchorRebaseMs,
    rangeAnchorRebaseMs,
    rangeAnchorsInspectionMs,
  },
  deltaFromWriteOnlyMeanMs: {
    nodesReadAfterWriteMs: round(
      nodesReadAfterWriteMs.mean - writeOnlyInsertTextMs.mean
    ),
    positionsReadAfterWriteMs: round(
      positionsReadAfterWriteMs.mean - writeOnlyInsertTextMs.mean
    ),
    pathAnchorRebaseMs: round(
      pathAnchorRebaseMs.mean - writeOnlyInsertTextMs.mean
    ),
    rangeAnchorRebaseMs: round(
      rangeAnchorRebaseMs.mean - writeOnlyInsertTextMs.mean
    ),
    rangeAnchorsInspectionMs: round(
      rangeAnchorsInspectionMs.mean - writeOnlyInsertTextMs.mean
    ),
  },
};

await writeBenchmarkArtifact(
  'tmp/plite-query-anchor-observation-benchmark.json',
  summary
);

console.log(`METRIC plite_commit_query_guard_failures=${queryFailures}`);
console.log(`METRIC plite_commit_query_worst_p95_ms=${Math.max(...commitQueries.map((row) => row.membershipMs.p95))}`);
console.log(`METRIC plite_selection_query_worst_p95_ms=${Math.max(...selectionQueries.map((row) => row.durationMs.p95))}`);
console.log(`METRIC plite_structural_query_worst_p95_ms=${Math.max(...structuralQueries.map((row) => row.durationMs.p95))}`);
console.log(`METRIC plite_immutable_index_cached_reads_p95_ms=${Math.max(...immutableIndexCache.map((row) => row.durationMs.p95))}`);
console.log(`METRIC plite_cold_snapshot_index_lookup_p95_ms=${Math.max(...coldSnapshotIndex.map((row) => row.durationMs.p95))}`);
console.log('ARTIFACT tmp/plite-query-anchor-observation-benchmark.json');
if (process.env.PLITE_QUERY_ANCHOR_BENCH_STRICT === '1' && queryFailures > 0) {
  throw new Error(`Commit queries missed ${queryFailures} locality guards`);
}
