import { performance } from 'node:perf_hooks';

import { createEditor } from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.SLATE_6038_ITERATIONS ?? '200',
  10
);
const blocks = Number.parseInt(process.env.SLATE_6038_BLOCKS ?? '8', 10);

const createParagraph = (index) => ({
  type: 'paragraph',
  children: [{ text: `node-${String(index).padStart(2, '0')}` }],
});

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => createParagraph(index));

const createBatchOps = (count) => [
  {
    type: 'insert_text',
    path: [0, 0],
    offset: 0,
    text: 'x',
  },
  {
    type: 'set_node',
    path: [1],
    properties: {},
    newProperties: { id: 'changed' },
  },
  {
    type: 'insert_node',
    path: [count],
    node: createParagraph(count),
  },
  {
    type: 'split_node',
    path: [2, 0],
    position: 4,
    properties: {},
  },
  {
    type: 'move_node',
    path: [count],
    newPath: [1],
  },
  {
    type: 'remove_text',
    path: [4, 0],
    offset: 1,
    text: 'ode-03',
  },
];

const operationScenarios = (count) => [
  {
    id: 'mixedBatch',
    opFamily: 'mixed-structural-text',
    operations: createBatchOps(count),
  },
  {
    id: 'insertText',
    opFamily: 'text-insert',
    operations: [
      {
        type: 'insert_text',
        path: [0, 0],
        offset: 0,
        text: 'x',
      },
    ],
  },
  {
    id: 'setNode',
    opFamily: 'node-property',
    operations: [
      {
        type: 'set_node',
        path: [1],
        properties: {},
        newProperties: { id: 'changed' },
      },
    ],
  },
  {
    id: 'insertNode',
    opFamily: 'node-insert',
    operations: [
      {
        type: 'insert_node',
        path: [count],
        node: createParagraph(count),
      },
    ],
  },
  {
    id: 'splitNode',
    opFamily: 'node-split',
    operations: [
      {
        type: 'split_node',
        path: [2, 0],
        position: 4,
        properties: {},
      },
    ],
  },
  {
    id: 'moveNode',
    opFamily: 'node-move',
    operations: [
      {
        type: 'move_node',
        path: [count - 1],
        newPath: [1],
      },
    ],
  },
  {
    id: 'removeText',
    opFamily: 'text-remove',
    operations: [
      {
        type: 'remove_text',
        path: [3, 0],
        offset: 1,
        text: 'ode-03',
      },
    ],
  },
];

const resetEditor = (editor, children) => {
  Editor.replace(editor, {
    children,
    selection: null,
    marks: null,
  });
};

const snapshotJson = (editor) =>
  JSON.stringify(Editor.getSnapshot(editor).children);

const runWithUpdateReplay = (children, ops) => {
  const editor = createEditor();
  resetEditor(editor, children);

  const start = performance.now();
  editor.update((tx) => {
    tx.operations.replay(structuredClone(ops));
  });
  const end = performance.now();

  return {
    elapsedMs: end - start,
    snapshot: snapshotJson(editor),
  };
};

const runSeparateUpdates = (children, ops) => {
  const editor = createEditor();
  resetEditor(editor, children);

  const start = performance.now();
  for (const operation of ops) {
    editor.update((tx) => {
      tx.operations.replay([structuredClone(operation)]);
    });
  }
  const end = performance.now();

  return {
    elapsedMs: end - start,
    snapshot: snapshotJson(editor),
  };
};

const mean = (values) =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

const measureScenario = ({ id, opFamily, operations }) => {
  const children = createChildren(blocks);
  const updateReplaySamples = [];
  const separateUpdateSamples = [];

  for (let index = 0; index < iterations; index += 1) {
    const updateReplay = runWithUpdateReplay(children, operations);
    const separateUpdates = runSeparateUpdates(children, operations);

    if (updateReplay.snapshot !== separateUpdates.snapshot) {
      throw new Error(
        `6038 ${id} benchmark lane produced divergent final snapshots`
      );
    }

    updateReplaySamples.push(updateReplay.elapsedMs);
    separateUpdateSamples.push(separateUpdates.elapsedMs);
  }

  return {
    opFamily,
    operationTypes: operations.map((operation) => operation.type),
    operationCount: operations.length,
    separateUpdateMs: summarize(separateUpdateSamples),
    updateReplayMs: summarize(updateReplaySamples),
    deltaMs: mean(separateUpdateSamples) - mean(updateReplaySamples),
  };
};

const opFamilyLanes = Object.fromEntries(
  operationScenarios(blocks).map((scenario) => [
    scenario.id,
    measureScenario(scenario),
  ])
);

const mixedBatchLane = opFamilyLanes.mixedBatch;

const result = {
  benchmark: 'slate-6038-transaction-execution',
  issue: '#6038',
  artifactVersion: 2,
  iterations,
  blocks,
  thresholdPolicy: {
    mode: 'calibration-only',
    releaseGate: false,
    repeatRunsRequiredBeforeEnforcement: 3,
  },
  batchShape: {
    id: 'mixedBatch',
    opFamily: mixedBatchLane.opFamily,
    operationTypes: mixedBatchLane.operationTypes,
    operationCount: mixedBatchLane.operationCount,
  },
  separateUpdateMeanMs: mixedBatchLane.separateUpdateMs.mean,
  updateReplayMeanMs: mixedBatchLane.updateReplayMs.mean,
  withTransactionMeanMs: mixedBatchLane.separateUpdateMs.mean,
  applyBatchMeanMs: mixedBatchLane.updateReplayMs.mean,
  deltaMs: mixedBatchLane.deltaMs,
  lanes: {
    separateUpdateMs: mixedBatchLane.separateUpdateMs,
    updateReplayMs: mixedBatchLane.updateReplayMs,
  },
  opFamilyLanes,
};

await writeBenchmarkArtifact('tmp/bench-slate-6038.json', result);

console.log(JSON.stringify(result, null, 2));
