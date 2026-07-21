import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import {
  createEditor,
  defineEditorExtension,
} from '../../../../../packages/plite/src/index.ts';
import { DocumentChangeBuilder } from '../../../../../packages/plite/src/core/document-change.ts';
import * as Editor from '../../../../../packages/plite/src/internal/index.ts';
import { history as historyExtension } from '../../../../../packages/plite-history/src/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.PLITE_COLLAB_READINESS_ITERATIONS ?? '3',
  10
);
const textBytes = Number.parseInt(
  process.env.PLITE_COLLAB_READINESS_TEXT_BYTES ?? '24',
  10
);
const benchmarkMode =
  process.env.PLITE_COLLAB_READINESS_MODE === 'anchors'
    ? 'anchors'
    : 'complete';

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
  const builder = new DocumentChangeBuilder({
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
              commit.tags.includes('remote-import')
            ) {
              return;
            }

            state.set({
              ...current,
              exports: [
                ...current.exports,
                commit.changes?.toJSON() ?? null,
              ],
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

    const state = Editor.getLastCommit(editor);

    assert(state);
    assert.equal(adapter.listenerCalls(), 1);
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
  const compiled = compileRemoteChanges(cohort);

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

  const batchSnapshot = runRemoteChangeBatch(cohort, compiled.batch);
  const separateSnapshot = runRemoteChangesSeparately(
    cohort,
    compiled.changes
  );

  if (batchSnapshot !== separateSnapshot) {
    throw new Error(
      `Collab readiness ${cohort.id} batch/separate changes diverged`
    );
  }

  return {
    config: cohort,
    commandCount: compiled.commandCount,
    commandTypes: compiled.commandTypes,
    localExportCommitMs: measureLocalExportCommit(cohort),
    remoteChangeBatchMs: measureRemoteChangeBatch(cohort, compiled.batch),
    remoteChangesSeparateMs: measureRemoteChangesSeparately(
      cohort,
      compiled.changes
    ),
    ...measureAnchors(cohort, compiled.batch),
    canonicalReplaceMs: measureCanonicalReplace(cohort),
    historySkipMs: measureHistorySkip(cohort, compiled.batch),
    connectDisconnectHeapDeltaBytes: measureConnectDisconnectHeap(cohort),
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
  artifactVersion: 2,
  mode: benchmarkMode,
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
