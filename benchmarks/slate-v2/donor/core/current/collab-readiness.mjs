import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import {
  createEditor,
  defineEditorExtension,
} from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { history as historyExtension } from '../../../../../packages/slate-history/src/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.SLATE_COLLAB_READINESS_ITERATIONS ?? '3',
  10
);
const textBytes = Number.parseInt(
  process.env.SLATE_COLLAB_READINESS_TEXT_BYTES ?? '24',
  10
);

const cohorts = [
  { id: 'normal', blocks: 100, remoteOps: 50, bookmarks: 25 },
  { id: 'large', blocks: 1000, remoteOps: 100, bookmarks: 100 },
  { id: 'stress', blocks: 10_000, remoteOps: 250, bookmarks: 250 },
  { id: 'pathological', blocks: 1, remoteOps: 1000, bookmarks: 50 },
];

const remoteOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'remote-import'],
};

const textFor = (prefix, index) =>
  `${prefix}-${String(index).padStart(5, '0')} ${'x'.repeat(
    Math.max(1, textBytes)
  )}`;

const paragraph = (prefix, index) => ({
  type: 'paragraph',
  children: [{ text: textFor(prefix, index) }],
});

const createDocument = (count, prefix = 'block') =>
  Array.from({ length: count }, (_, index) => paragraph(prefix, index));

const clone = (value) => structuredClone(value);

const snapshotJson = (editor) =>
  JSON.stringify(Editor.getSnapshot(editor).children);

const heapUsed = () => process.memoryUsage?.().heapUsed ?? 0;

const forceGc = () => {
  if (typeof globalThis.gc === 'function') {
    globalThis.gc();
    return true;
  }

  return false;
};

const createEditorWithDocument = (blockCount, history = false) => {
  const editor = history
    ? createEditor({ extensions: [historyExtension()] })
    : createEditor();

  Editor.replace(editor, {
    children: createDocument(blockCount),
    marks: null,
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  return editor;
};

const createRemoteTextBurstOps = ({ blocks, remoteOps }) =>
  Array.from({ length: remoteOps }, (_, index) => ({
    type: 'insert_text',
    path: [Math.min(index % Math.max(1, blocks), blocks - 1), 0],
    offset: 0,
    text: String(index % 10),
  }));

const createPathologicalTextBurstOps = (remoteOps) =>
  Array.from({ length: remoteOps }, (_, index) => ({
    type: 'insert_text',
    path: [0, 0],
    offset: 0,
    text: String(index % 10),
  }));

const createRemoteOps = (cohort) =>
  cohort.id === 'pathological'
    ? createPathologicalTextBurstOps(cohort.remoteOps)
    : createRemoteTextBurstOps(cohort);

const assertRemoteCommit = (editor) => {
  const commit = Editor.getLastCommit(editor);

  assert(commit);
  assert.deepEqual(commit.tags, remoteOptions.tag);
  assert.deepEqual(commit.metadata, remoteOptions.metadata);
};

const createFakeCollabAdapter = () => {
  let listenerCalls = 0;

  return {
    extension: defineEditorExtension({
      name: 'benchmark-fake-collab-adapter',
      setup(context) {
        const state = context.runtimeState({
          connected: true,
          exports: [],
          paused: false,
        });

        return {
          cleanup() {
            state.set((current) => ({
              ...current,
              connected: false,
              paused: true,
            }));
          },
          onCommit({ commit }) {
            listenerCalls += 1;
            const current = state.get();

            if (
              !current.connected ||
              current.paused ||
              commit.tags.includes('skip-collab') ||
              commit.tags.includes('collaboration') ||
              commit.metadata.collab?.origin === 'remote'
            ) {
              return;
            }

            state.set({
              ...current,
              exports: [...current.exports, clone(commit.operations)],
            });
          },
        };
      },
    }),
    listenerCalls: () => listenerCalls,
  };
};

const measure = (run) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const start = performance.now();
    run();
    const duration = performance.now() - start;

    if (iteration > 0) {
      samples.push(duration);
    }
  }

  return summarize(samples);
};

const measureLocalExportCommit = (cohort) =>
  measure(() => {
    const editor = createEditorWithDocument(cohort.blocks);
    const adapter = createFakeCollabAdapter();

    editor.extend(adapter.extension);
    editor.update((tx) => {
      tx.text.insert('L', { at: { path: [0, 0], offset: 0 } });
    });

    const state = editor.read((state) => state.value.lastCommit());

    assert(state);
    assert.equal(adapter.listenerCalls(), 1);
  });

const runRemoteReplayBatch = (cohort, operations) => {
  const editor = createEditorWithDocument(cohort.blocks);

  editor.update((tx) => {
    tx.operations.replay(clone(operations));
  }, remoteOptions);

  assertRemoteCommit(editor);

  return snapshotJson(editor);
};

const runRemoteReplaySeparate = (cohort, operations) => {
  const editor = createEditorWithDocument(cohort.blocks);

  for (const operation of operations) {
    editor.update((tx) => {
      tx.operations.replay([clone(operation)]);
    }, remoteOptions);
    assertRemoteCommit(editor);
  }

  return snapshotJson(editor);
};

const measureRemoteReplayBatch = (cohort, operations) =>
  measure(() => {
    runRemoteReplayBatch(cohort, operations);
  });

const measureRemoteReplaySeparate = (cohort, operations) =>
  measure(() => {
    runRemoteReplaySeparate(cohort, operations);
  });

const measureBookmarkRebase = (cohort, operations) =>
  measure(() => {
    const editor = createEditorWithDocument(cohort.blocks);
    const bookmarks = Array.from(
      { length: Math.min(cohort.bookmarks, cohort.blocks) },
      (_, index) =>
        Editor.bookmark(editor, {
          anchor: { path: [index, 0], offset: 1 },
          focus: { path: [index, 0], offset: 6 },
        })
    );

    editor.update((tx) => {
      tx.operations.replay(clone(operations));
    }, remoteOptions);

    assertRemoteCommit(editor);

    for (const bookmark of bookmarks) {
      const resolved = bookmark.resolve();

      if (resolved) {
        assert.doesNotThrow(() => Editor.string(editor, resolved));
      }
      bookmark.unref();
    }
  });

const measureCanonicalReplace = (cohort) =>
  measure(() => {
    const editor = createEditorWithDocument(cohort.blocks);

    editor.update((tx) => {
      tx.value.replace({
        children: createDocument(cohort.blocks, 'canonical'),
        marks: null,
        selection: null,
      });
    }, remoteOptions);

    const commit = Editor.getLastCommit(editor);

    assertRemoteCommit(editor);
    assert.deepEqual(commit.classes, ['replace']);
  });

const measureHistorySkip = (cohort, operations) =>
  measure(() => {
    const editor = createEditorWithDocument(cohort.blocks, true);

    editor.update((tx) => {
      tx.operations.replay(clone(operations));
    }, remoteOptions);

    assertRemoteCommit(editor);
    const historyState = editor.read((state) => state.history.get());
    assert.equal(historyState.undos.length, 0);
    assert.equal(historyState.redos.length, 0);
  });

const measureConnectDisconnectHeap = (cohort) => {
  const heapSamples = [];
  let gcAvailable = false;

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    gcAvailable = forceGc() || gcAvailable;
    const heapBefore = heapUsed();
    const editor = createEditorWithDocument(cohort.blocks);
    const adapter = createFakeCollabAdapter();
    const unextend = editor.extend(adapter.extension);

    unextend();

    const listenerCallsBefore = adapter.listenerCalls();

    editor.update((tx) => {
      tx.text.insert('C', { at: { path: [0, 0], offset: 0 } });
    });

    assert.equal(adapter.listenerCalls(), listenerCallsBefore);
    forceGc();

    if (iteration > 0) {
      heapSamples.push(heapUsed() - heapBefore);
    }
  }

  return {
    ...summarize(heapSamples),
    gcAvailable,
    unit: 'bytes',
  };
};

const measureCohort = (cohort) => {
  const operations = createRemoteOps(cohort);
  const batchSnapshot = runRemoteReplayBatch(cohort, operations);
  const separateSnapshot = runRemoteReplaySeparate(cohort, operations);

  if (batchSnapshot !== separateSnapshot) {
    throw new Error(
      `Collab readiness ${cohort.id} batch/separate replay diverged`
    );
  }

  return {
    config: cohort,
    operationTypes: [...new Set(operations.map((operation) => operation.type))],
    operationCount: operations.length,
    localExportCommitMs: measureLocalExportCommit(cohort),
    remoteReplayBatchMs: measureRemoteReplayBatch(cohort, operations),
    remoteReplaySeparateMs: measureRemoteReplaySeparate(cohort, operations),
    bookmarkRebaseMs: measureBookmarkRebase(cohort, operations),
    canonicalReplaceMs: measureCanonicalReplace(cohort),
    historySkipMs: measureHistorySkip(cohort, operations),
    connectDisconnectHeapDeltaBytes: measureConnectDisconnectHeap(cohort),
    invariants: {
      batchAndSeparateConverge: true,
      remoteCommitMetadataChecked: true,
      historySkipChecked: true,
      bookmarkResolutionChecked: true,
      cleanupListenerChecked: true,
    },
  };
};

const lanes = Object.fromEntries(
  cohorts.map((cohort) => [cohort.id, measureCohort(cohort)])
);

const redFlags = Object.fromEntries(
  Object.entries(lanes).map(([id, lane]) => [
    id,
    {
      batchSlowerThanSeparate:
        lane.remoteReplayBatchMs.mean > lane.remoteReplaySeparateMs.mean,
      connectDisconnectHeapMaxBytes: lane.connectDisconnectHeapDeltaBytes.max,
    },
  ])
);

const result = {
  benchmark: 'slate-collab-readiness',
  artifactVersion: 1,
  iterations,
  thresholdPolicy: {
    mode: 'calibration-only',
    releaseGate: false,
    repeatRunsRequiredBeforeEnforcement: 3,
  },
  cohorts,
  lanes,
  redFlags,
};

await writeBenchmarkArtifact(
  'tmp/slate-collab-readiness-benchmark.json',
  result
);

console.log(JSON.stringify(result, null, 2));
