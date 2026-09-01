import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

import {
  createEditor,
  defineExtension,
} from '../../../../../packages/plitejs/src/index.ts';
import { ChangeDraft } from '../../../../../packages/plitejs/src/core/change/builder.ts';
import { DocumentIndex } from '../../../../../packages/plitejs/src/core/change/document-index.ts';
import * as Editor from '../../../../../packages/plitejs/src/internal/index.ts';
import { history as historyExtension } from '../../../../../packages/plitejs/src/history/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.PLITE_COLLAB_READINESS_ITERATIONS ?? '3',
  10
);
const textBytes = Number.parseInt(
  process.env.PLITE_COLLAB_READINESS_TEXT_BYTES ?? '24',
  10
);
const benchmarkMode = ['anchors', 'replacement'].includes(process.env.PLITE_COLLAB_READINESS_MODE)
  ? process.env.PLITE_COLLAB_READINESS_MODE
  : 'complete';
const measuredFiles = [
  'packages/plitejs/src/core/snapshot-index.ts',
  'packages/plitejs/src/core/change/root-change.ts',
  'packages/plitejs/src/core/change/document-index.ts',
  'packages/plitejs/src/core/anchor-state.ts',
  'packages/plitejs/src/core/anchor.ts',
  'packages/plitejs/src/core/public-state.ts',
  'benchmarks/slate-v2/donor/core/current/collab-readiness.mjs',
];
const fingerprint = () => Object.fromEntries(measuredFiles.map((file) => [
  file, createHash('sha256').update(readFileSync(file)).digest('hex'),
]));
const sourceBefore = fingerprint();

const requestedCohorts = new Set(
  (process.env.PLITE_COLLAB_READINESS_COHORTS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);
const cohorts = [
  { id: 'normal', blocks: 100, remoteOps: 50, anchors: 25 },
  { id: 'large', blocks: 1000, remoteOps: 100, anchors: 100 },
  { id: 'stress', blocks: 10_000, remoteOps: 250, anchors: 250 },
  { id: 'pathological', blocks: 1, remoteOps: 1000, anchors: 50 },
].filter(
  (cohort) => requestedCohorts.size === 0 || requestedCohorts.has(cohort.id)
);

if (cohorts.length === 0) {
  throw new Error('No collaboration readiness cohorts selected.');
}

const remoteOptions = {
  tags: [
    'collaboration',
    'remote-import',
    'skip-dom-selection',
    'skip-scroll-into-view',
    'skip-selection-focus',
  ],
};
const remoteHistoryOptions = { ...remoteOptions, history: 'skip' };

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
      kind: 'text',
    },
  });

  return editor;
};

const createRemoteTextBurstCommands = ({ blocks, remoteOps }) =>
  Array.from({ length: remoteOps }, (_, index) => ({
    path: [Math.min(index % Math.max(1, blocks), blocks - 1), 0],
    text: String(index % 10),
    type: 'insertText',
  }));

const createPathologicalTextBurstCommands = (remoteOps) =>
  Array.from({ length: remoteOps }, (_, index) => ({
    path: [0, 0],
    text: String(index % 10),
    type: 'insertText',
  }));

const compileRemoteChanges = (cohort) => {
  const children = createDocument(cohort.blocks);
  const commands =
    cohort.id === 'pathological'
      ? createPathologicalTextBurstCommands(cohort.remoteOps)
      : createRemoteTextBurstCommands(cohort);
  const builder = new ChangeDraft({
    children,
    marks: null,
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
      kind: 'text',
    },
  });
  const changes = commands.map(({ path, text }) =>
    builder.insertText('main', path, 0, text).change
  );

  return {
    batch: builder.change,
    changes,
    commandCount: commands.length,
    commandTypes: [...new Set(commands.map((command) => command.type))],
  };
};

const assertRemoteCommit = (editor, options = remoteOptions) => {
  const commit = Editor.getLastCommit(editor);

  assert(commit);
  assert.deepEqual(commit.tags, [
    ...options.tags,
    ...(options.history === 'skip' ? ['history-skip'] : []),
  ]);
};

const createFakeCollabAdapter = () => {
  let listenerCalls = 0;
  let state = { connected: true, exports: [], paused: false };

  return {
    extension: defineExtension('benchmark-fake-collab-adapter', {
      activate(context) {
        state = { connected: true, exports: [], paused: false };
        context.onCleanup(() => {
          state = { ...state, connected: false, paused: true };
        });
      },
      on: {
          commit({ commit }) {
            listenerCalls += 1;
            const current = state;

            if (
              !current.connected ||
              current.paused ||
              commit.tags.includes('skip-collab') ||
              commit.tags.includes('collaboration') ||
              commit.tags.includes('remote-import')
            ) {
              return;
            }

            state = {
              ...current,
              exports: [
                ...current.exports,
                commit.changes?.toJSON() ?? null,
              ],
            };
          },
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

    editor.install(adapter.extension);
    const callsBefore = adapter.listenerCalls();
    editor.update((tx) => {
      tx.text.insert('L', { at: { path: [0, 0], offset: 0 } });
    });

    const state = Editor.getLastCommit(editor);

    assert(state);
    assert.equal(adapter.listenerCalls() - callsBefore, 1);
  });

const runRemoteChangeBatch = (cohort, change) => {
  const editor = createEditorWithDocument(cohort.blocks);

  editor.update(remoteOptions, (tx) => tx.changes.apply(change));

  assertRemoteCommit(editor);

  return snapshotJson(editor);
};

const runRemoteChangesSeparately = (cohort, changes) => {
  const editor = createEditorWithDocument(cohort.blocks);

  for (const change of changes) {
    editor.update(remoteOptions, (tx) => tx.changes.apply(change));
    assertRemoteCommit(editor);
  }

  return snapshotJson(editor);
};

const measureRemoteChangeBatch = (cohort, change) =>
  measure(() => {
    runRemoteChangeBatch(cohort, change);
  });

const measureRemoteChangesSeparately = (cohort, changes) =>
  measure(() => {
    runRemoteChangesSeparately(cohort, changes);
  });

const measureAnchors = (cohort, change) => {
  const samples = {
    anchorCreateMs: [],
    anchorRebaseMs: [],
    anchorResolveMs: [],
    anchorSetupMs: [],
  };

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const setupStart = performance.now();
    const editor = createEditorWithDocument(cohort.blocks);
    const setupDuration = performance.now() - setupStart;
    const createStart = performance.now();
    const anchors = Array.from(
      { length: Math.min(cohort.anchors, cohort.blocks) },
      (_, index) =>
        editor.anchor(
          {
            anchor: { path: [index, 0], offset: 1 },
            focus: { path: [index, 0], offset: 6 },
          },
          { association: 'inward', deletion: 'nearest' }
        )
    );
    const createDuration = performance.now() - createStart;

    const rebaseStart = performance.now();
    editor.update(remoteOptions, (tx) => tx.changes.apply(change));
    const rebaseDuration = performance.now() - rebaseStart;

    assertRemoteCommit(editor);

    const resolveStart = performance.now();
    const resolvedAnchors = anchors.map((anchor) => anchor.release());
    const resolveDuration = performance.now() - resolveStart;

    for (const resolved of resolvedAnchors) {
      if (resolved) {
        const entry = editor.read((state) => state.nodes.get(resolved.anchor));

        assert(entry && 'text' in entry[0]);
        assert(resolved.anchor.offset <= entry[0].text.length);
        assert(resolved.focus.offset <= entry[0].text.length);
      }
    }

    if (iteration > 0) {
      samples.anchorSetupMs.push(setupDuration);
      samples.anchorCreateMs.push(createDuration);
      samples.anchorRebaseMs.push(rebaseDuration);
      samples.anchorResolveMs.push(resolveDuration);
    }
  }

  return Object.fromEntries(
    Object.entries(samples).map(([key, values]) => [key, summarize(values)])
  );
};

const measureCanonicalReplace = (cohort) =>
  measure(() => {
    const editor = createEditorWithDocument(cohort.blocks);

    editor.update(remoteOptions, (tx) => {
      tx.value.replace({
        children: createDocument(cohort.blocks, 'canonical'),
        marks: null,
        selection: null,
      });
    });

    const commit = Editor.getLastCommit(editor);

    assertRemoteCommit(editor);
    assert.equal(commit.changed.has('replace'), true);
  });

const canonicalReplacementWork = (cohort) => {
  const editor = createEditorWithDocument(cohort.blocks);
  const before = Editor.getSnapshot(editor);
  const path = [cohort.blocks - 1, 0];
  const oldKey = before.index.keyAt(path);
  const children = createDocument(cohort.blocks, 'canonical');
  const readNode = DocumentIndex.prototype.node;
  let nodeReads = 0;

  DocumentIndex.prototype.node = function (...args) {
    nodeReads += 1;
    return readNode.apply(this, args);
  };
  try {
    editor.update(remoteOptions, (tx) => tx.value.replace({ children, marks: null, selection: null }));
  } finally {
    DocumentIndex.prototype.node = readNode;
  }
  const after = Editor.getSnapshot(editor);
  assert.deepEqual(after.children, children);
  assert.equal(before.index.keyAt(path), oldKey);
  const currentKey = after.index.keyAt(path);
  editor.update((tx) => tx.text.insert('!', { at: { path, offset: 0 } }));
  const followUp = Editor.getSnapshot(editor);
  assert.equal(followUp.index.keyAt(path), currentKey);
  assert.equal(followUp.children[cohort.blocks - 1].children[0].text, '!' + children[cohort.blocks - 1].children[0].text);

  return { nodeReads, maximumNodeReads: 64 * cohort.blocks, historicalAndFollowUpChecked: true };
};

const measureHistorySkip = (cohort, change) =>
  measure(() => {
    const editor = createEditorWithDocument(cohort.blocks, true);

    editor.update(remoteHistoryOptions, (tx) => tx.changes.apply(change));

    assertRemoteCommit(editor, remoteHistoryOptions);
    const historyState = editor.read((state) => state.history());
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
    const uninstall = editor.install(adapter.extension);

    uninstall();

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
  const phase = (name, run) => {
    console.error(`COLLAB_PHASE ${cohort.id} ${name}`);
    return run();
  };
  if (benchmarkMode === 'replacement') {
    return {
      config: cohort,
      canonicalReplaceMs: phase('replace', () => measureCanonicalReplace(cohort)),
      canonicalReplacementWork: phase('replacement-work', () => canonicalReplacementWork(cohort)),
    };
  }
  const compiled = phase('compile', () => compileRemoteChanges(cohort));

  if (benchmarkMode === 'anchors') {
    return {
      config: cohort,
      commandCount: compiled.commandCount,
      commandTypes: compiled.commandTypes,
      ...measureAnchors(cohort, compiled.batch),
      invariants: {
        anchorResolutionChecked: true,
      },
    };
  }

  const batchSnapshot = phase('verify-batch', () => runRemoteChangeBatch(cohort, compiled.batch));
  const separateSnapshot = phase('verify-separate', () => runRemoteChangesSeparately(
    cohort,
    compiled.changes
  ));

  if (batchSnapshot !== separateSnapshot) {
    throw new Error(
      `Collab readiness ${cohort.id} batch/separate changes diverged`
    );
  }

  return {
    config: cohort,
    commandCount: compiled.commandCount,
    commandTypes: compiled.commandTypes,
    localExportCommitMs: phase('export', () => measureLocalExportCommit(cohort)),
    remoteChangeBatchMs: phase('batch', () => measureRemoteChangeBatch(cohort, compiled.batch)),
    remoteChangesSeparateMs: phase('separate', () => measureRemoteChangesSeparately(
      cohort,
      compiled.changes
    )),
    ...phase('anchors', () => measureAnchors(cohort, compiled.batch)),
    canonicalReplaceMs: phase('replace', () => measureCanonicalReplace(cohort)),
    canonicalReplacementWork: phase('replacement-work', () => canonicalReplacementWork(cohort)),
    historySkipMs: phase('history-skip', () => measureHistorySkip(cohort, compiled.batch)),
    connectDisconnectHeapDeltaBytes: phase('cleanup', () => measureConnectDisconnectHeap(cohort)),
    invariants: {
      batchAndSeparateConverge: true,
      canonicalChangesOnly: true,
      remoteCommitMetadataChecked: true,
      historySkipChecked: true,
      anchorResolutionChecked: true,
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
        lane.remoteChangeBatchMs?.mean > lane.remoteChangesSeparateMs?.mean,
      connectDisconnectHeapMaxBytes:
        lane.connectDisconnectHeapDeltaBytes?.max ?? null,
    },
  ])
);

const result = {
  benchmark: 'plite-collab-readiness',
  artifactVersion: 3,
  mode: benchmarkMode,
  iterations,
  thresholdPolicy: {
    mode: 'deterministic-work-guard; broad timings remain diagnostic',
    releaseGate: process.env.PLITE_COLLAB_READINESS_STRICT === '1',
    repeatRunsRequiredBeforeEnforcement: 3,
  },
  cohorts,
  lanes,
  redFlags,
  sourceBefore,
  sourceAfter: fingerprint(),
  guards: Object.values(lanes).flatMap((lane) => lane.canonicalReplacementWork &&
    lane.canonicalReplacementWork.nodeReads > lane.canonicalReplacementWork.maximumNodeReads
    ? [`${lane.config.id}: canonical replacement exceeds linear node-read budget`]
    : []),
};
assert.deepEqual(result.sourceAfter, result.sourceBefore, 'Measured source changed during benchmark');

await writeBenchmarkArtifact(
  'tmp/slate-collab-readiness-benchmark.json',
  result
);

console.log(`METRIC collab_replacement_max_ms=${Math.max(0, ...Object.values(lanes).map((lane) => lane.canonicalReplaceMs?.max ?? 0))}`);
console.log(`METRIC collab_replacement_max_node_reads_per_block=${Math.max(0, ...Object.values(lanes).map((lane) => (lane.canonicalReplacementWork?.nodeReads ?? 0) / lane.config.blocks))}`);
console.log(`METRIC collab_readiness_guard_failures=${result.guards.length}`);
if (process.env.PLITE_COLLAB_READINESS_STRICT === '1') assert.deepEqual(result.guards, []);
