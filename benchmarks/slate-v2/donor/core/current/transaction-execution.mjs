import { performance } from 'node:perf_hooks';

import { createEditor } from '../../../../../packages/plitejs/src/index.ts';
import * as Editor from '../../../../../packages/plitejs/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.PLITE_6038_ITERATIONS ?? '200',
  10
);
const blocks = Number.parseInt(process.env.PLITE_6038_BLOCKS ?? '8', 10);

const createParagraph = (index) => ({
  type: 'paragraph',
  children: [{ text: `node-${String(index).padStart(2, '0')}` }],
});

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => createParagraph(index));

const createBatchCommands = (count) => [
  {
    apply: (tx) =>
      tx.text.insert('x', { at: { offset: 0, path: [0, 0] } }),
    type: 'insertText',
  },
  {
    apply: (tx) => tx.nodes.set({ id: 'changed' }, { at: [1] }),
    type: 'setNode',
  },
  {
    apply: (tx) => tx.nodes.insert(createParagraph(count), { at: [count] }),
    type: 'insertNode',
  },
  {
    apply: (tx) => tx.nodes.move({ at: [count], to: [1] }),
    type: 'moveNode',
  },
  {
    apply: (tx) =>
      tx.text.delete({
        at: {
          anchor: { offset: 1, path: [4, 0] },
          focus: { offset: 7, path: [4, 0] },
        },
      }),
    type: 'removeText',
  },
];

const commandScenarios = (count) => {
  const commands = createBatchCommands(count);

  return [
    {
      commandFamily: 'mixed-structural-text',
      commands,
      id: 'mixedBatch',
    },
    ...commands.slice(0, 3).map((command) => ({
      commandFamily: command.type,
      commands: [command],
      id: command.type,
    })),
    {
      commandFamily: 'moveNode',
      commands: [
        {
          apply: (tx) => tx.nodes.move({ at: [count - 1], to: [1] }),
          type: 'moveNode',
        },
      ],
      id: 'moveNode',
    },
    {
      commandFamily: 'removeText',
      commands: [
        {
          apply: (tx) =>
            tx.text.delete({
              at: {
                anchor: { offset: 1, path: [3, 0] },
                focus: { offset: 7, path: [3, 0] },
              },
            }),
          type: 'removeText',
        },
      ],
      id: 'removeText',
    },
  ];
};

const resetEditor = (editor, children) => {
  Editor.replace(editor, {
    children,
    selection: null,
  });
};

const snapshotJson = (editor) =>
  JSON.stringify(Editor.getSnapshot(editor).children);

const runBatchedUpdate = (children, commands) => {
  const editor = createEditor();

  resetEditor(editor, children);
  let publicationCount = 0;
  const unsubscribe = editor.subscribe((_snapshot, commit) => {
    if (commit) publicationCount += 1;
  });

  const start = performance.now();

  editor.update((tx) => {
    for (const command of commands) command.apply(tx);
  });
  const elapsedMs = performance.now() - start;

  unsubscribe();

  return {
    elapsedMs,
    publicationCount,
    snapshot: snapshotJson(editor),
  };
};

const runSeparateUpdates = (children, commands) => {
  const editor = createEditor();

  resetEditor(editor, children);
  let publicationCount = 0;
  const unsubscribe = editor.subscribe((_snapshot, commit) => {
    if (commit) publicationCount += 1;
  });

  const start = performance.now();

  for (const command of commands) {
    editor.update((tx) => command.apply(tx));
  }
  const elapsedMs = performance.now() - start;

  unsubscribe();

  return {
    elapsedMs,
    publicationCount,
    snapshot: snapshotJson(editor),
  };
};

const mean = (values) =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

const measureScenario = ({ commandFamily, commands, id }) => {
  const children = createChildren(blocks);
  const batchedUpdateSamples = [];
  const separateUpdateSamples = [];

  for (let index = 0; index < iterations; index += 1) {
    let batched;
    let separate;

    if (index % 2 === 0) {
      batched = runBatchedUpdate(children, commands);
      separate = runSeparateUpdates(children, commands);
    } else {
      separate = runSeparateUpdates(children, commands);
      batched = runBatchedUpdate(children, commands);
    }

    if (batched.snapshot !== separate.snapshot) {
      throw new Error(
        `6038 ${id} benchmark lane produced divergent final snapshots:\nbatch=${batched.snapshot}\nseparate=${separate.snapshot}`
      );
    }
    if (
      batched.publicationCount !== 1 ||
      separate.publicationCount !== commands.length
    ) {
      throw new Error(
        `6038 ${id} publication invariant failed: batch=${batched.publicationCount} separate=${separate.publicationCount}.`
      );
    }

    batchedUpdateSamples.push(batched.elapsedMs);
    separateUpdateSamples.push(separate.elapsedMs);
  }

  return {
    batchedUpdateMs: summarize(batchedUpdateSamples),
    batchedPublicationCount: 1,
    commandCount: commands.length,
    commandFamily,
    commandTypes: commands.map((command) => command.type),
    deltaMs: mean(separateUpdateSamples) - mean(batchedUpdateSamples),
    separateUpdateMs: summarize(separateUpdateSamples),
    separatePublicationCount: commands.length,
  };
};

const commandFamilyLanes = Object.fromEntries(
  commandScenarios(blocks).map((scenario) => [
    scenario.id,
    measureScenario(scenario),
  ])
);
const mixedBatchLane = commandFamilyLanes.mixedBatch;
const mixedBatchMedianRatio =
  mixedBatchLane.batchedUpdateMs.median /
  Math.max(mixedBatchLane.separateUpdateMs.median, 0.000_001);
const mixedBatchP95Ratio =
  mixedBatchLane.batchedUpdateMs.p95 /
  Math.max(mixedBatchLane.separateUpdateMs.p95, 0.000_001);
const thresholdPolicy = {
  mixedBatchMedianRatioMax: 1,
  mixedBatchP95RatioMax: 1.25,
  publicationInvariantRequired: true,
  snapshotParityRequired: true,
};

const result = {
  benchmark: 'plite-transaction-execution',
  artifactVersion: 5,
  iterations,
  blocks,
  thresholdPolicy,
  batchShape: {
    id: 'mixedBatch',
    commandCount: mixedBatchLane.commandCount,
    commandFamily: mixedBatchLane.commandFamily,
    commandTypes: mixedBatchLane.commandTypes,
  },
  fairness: {
    sampleOrder:
      'Batched-first and separate-first samples alternate within every command-family lane.',
    setup:
      'Each timed lane starts from an equivalent fresh editor; editor construction and fixture replacement are excluded.',
  },
  separateUpdateMeanMs: mixedBatchLane.separateUpdateMs.mean,
  batchedUpdateMeanMs: mixedBatchLane.batchedUpdateMs.mean,
  deltaMs: mixedBatchLane.deltaMs,
  mixedBatchMedianRatio,
  mixedBatchP95Ratio,
  lanes: {
    batchedUpdateMs: mixedBatchLane.batchedUpdateMs,
    separateUpdateMs: mixedBatchLane.separateUpdateMs,
  },
  commandFamilyLanes,
};

await writeBenchmarkArtifact(
  'tmp/plite-transaction-execution-benchmark.json',
  result
);

console.log(JSON.stringify(result, null, 2));
console.log(
  `METRIC plite_transaction_mixed_batch_median_ratio=${mixedBatchMedianRatio}`
);
console.log(
  `METRIC plite_transaction_mixed_batch_p95_ratio=${mixedBatchP95Ratio}`
);

if (
  process.env.PLITE_TRANSACTION_EXECUTION_STRICT === '1' &&
  (mixedBatchMedianRatio > thresholdPolicy.mixedBatchMedianRatioMax ||
    mixedBatchP95Ratio > thresholdPolicy.mixedBatchP95RatioMax)
) {
  throw new Error(
    `Native transaction batch missed its gate: median=${mixedBatchMedianRatio.toFixed(2)}x p95=${mixedBatchP95Ratio.toFixed(2)}x.`
  );
}
