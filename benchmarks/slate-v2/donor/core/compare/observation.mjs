import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  benchmarkRepo,
  buildRepo,
  parsePackageManager,
} from '../../shared/repo-compare.mjs';
import { round, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const currentRepo = process.cwd();
const defaultLegacyRepo =
  [
    resolve(currentRepo, '../slate'),
    resolve(currentRepo, '../../../slate'),
  ].find((candidate) => existsSync(resolve(candidate, 'package.json'))) ??
  resolve(currentRepo, '../slate');
const legacyRepo = resolve(
  currentRepo,
  process.env.CORE_OBSERVATION_BENCH_LEGACY_REPO || defaultLegacyRepo
);

const iterations = Number(process.env.CORE_OBSERVATION_BENCH_ITERATIONS || 3);
const blocks = Number(process.env.CORE_OBSERVATION_BENCH_BLOCKS || 500);
const insertOps = Number(process.env.CORE_OBSERVATION_BENCH_INSERT_OPS || 40);
const skipBuild = process.env.BENCHMARK_SKIP_BUILD === '1';

const benchmarkSource = `
import assert from 'node:assert/strict';

const engine = process.env.BENCHMARK_ENGINE;
assert.ok(engine === 'current' || engine === 'legacy');
const isPlite = engine === 'current';
const implementation = isPlite ? 'plite' : 'slate';
const Core = await import(isPlite ? 'plitejs' : 'slate');
const { createEditor } = Core;
const Editor = Core.Editor;
const NodeApi = isPlite ? Core.NodeApi : Core.Node;
const legacyTransforms = Core.Transforms;

const iterations = Number(process.env.CORE_OBSERVATION_BENCH_ITERATIONS || 3);
const blocks = Number(process.env.CORE_OBSERVATION_BENCH_BLOCKS || 500);
const insertOps = Number(process.env.CORE_OBSERVATION_BENCH_INSERT_OPS || 40);

const now = () => performance.now();
const round = (value) => Number(value.toFixed(2));

const percentile = (sorted, ratio) => {
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * ratio) - 1)
  );

  return sorted[index];
};

const summarize = (samples) => {
  if (samples.length === 0) {
    return {
      samples: [],
      mean: 0,
      median: 0,
      p75: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
    };
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const mean = samples.reduce((total, sample) => total + sample, 0) / samples.length;
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  return {
    samples: samples.map(round),
    mean: round(mean),
    median: round(median),
    p75: round(percentile(sorted, 0.75)),
    p95: round(percentile(sorted, 0.95)),
    p99: round(percentile(sorted, 0.99)),
    min: round(sorted[0] ?? 0),
    max: round(sorted.at(-1) ?? 0),
  };
};

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: \`block-\${index}\` }],
  }));

const replaceEditor = (editor, input) => {
  if (isPlite) {
    editor.update((tx) => tx.value.replace(input));
    return;
  }

  editor.children = input.children;
  editor.selection = input.selection ?? null;
  editor.marks = input.marks ?? null;
};

const getChildren = (editor) =>
  isPlite ? editor.read.children() : editor.children;

const insertText = (editor, text, options) => {
  if (isPlite) {
    editor.update((tx) => {
      tx.text.insert(text, options);
    });
    return;
  }

  legacyTransforms.insertText(editor, text, options);
};

const measureLane = (setup, run) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    const start = now();
    run(editor);
    const duration = now() - start;

    if (iteration > 0) {
      samples.push(duration);
    }
  }

  return summarize(samples);
};

const createEditorWithChildren = () => {
  const editor = createEditor();
  replaceEditor(editor, {
    children: createChildren(blocks),
    selection: null,
  });
  return editor;
};

const readChildrenLengthAfterEachMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let seen = 0;

    for (let index = 0; index < insertOps; index += 1) {
      insertText(editor, 'X', {
        at: { path: [index % blocks, 0], offset: 0 },
      });

      seen += getChildren(editor).length;
    }

    assert.ok(seen > 0);
  }
);

const nodesAtRootAfterEachMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let seen = 0;

    for (let index = 0; index < insertOps; index += 1) {
      insertText(editor, 'X', {
        at: { path: [index % blocks, 0], offset: 0 },
      });

      for (const _ of NodeApi.nodes(editor)) {
        seen += 1;
      }
    }

    assert.ok(seen > 0);
  }
);

const positionsFirstBlockAfterEachMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let seen = 0;

    for (let index = 0; index < insertOps; index += 1) {
      insertText(editor, 'X', {
        at: { path: [0, 0], offset: index },
      });

      const positions = isPlite
        ? editor.read.points.positions({ at: [0] })
        : Editor.positions(editor, { at: [0] });
      for (const _ of positions) {
        seen += 1;
      }
    }

    assert.ok(seen > 0);
  }
);

console.log(JSON.stringify({
  iterations,
  config: {
    implementation,
    runtime: { executable: process.execPath, node: process.version, v8: process.versions.v8 },
    blocks,
    insertOps,
  },
  lanes: {
    readChildrenLengthAfterEachMs,
    nodesAtRootAfterEachMs,
    positionsFirstBlockAfterEachMs,
  },
}));
`;

const currentPackageManager = await parsePackageManager(currentRepo);
const legacyPackageManager = await parsePackageManager(legacyRepo);

if (!skipBuild) {
  await buildRepo(currentRepo, currentPackageManager, './packages/plitejs');
  await buildRepo(legacyRepo, legacyPackageManager, './packages/slate');
}

const env = {
  CORE_OBSERVATION_BENCH_ITERATIONS: String(iterations),
  CORE_OBSERVATION_BENCH_BLOCKS: String(blocks),
  CORE_OBSERVATION_BENCH_INSERT_OPS: String(insertOps),
};

const current = await benchmarkRepo({
  benchmarkSource,
  env: { ...env, BENCHMARK_ENGINE: 'current' },
  packageManager: currentPackageManager,
  repo: currentRepo,
});
const legacy = await benchmarkRepo({
  benchmarkSource,
  env: { ...env, BENCHMARK_ENGINE: 'legacy' },
  packageManager: legacyPackageManager,
  repo: legacyRepo,
});

if (current.config.implementation !== 'plite' || legacy.config.implementation !== 'slate') {
  throw new Error('Core comparison did not execute its declared editor owners');
}
if (JSON.stringify(current.config.runtime) !== JSON.stringify(legacy.config.runtime)) {
  throw new Error('Core comparison requires the same JavaScript runtime');
}

const summary = {
  lane: 'core-observation-compare-local',
  implementations: { current: 'plite', legacy: 'slate' },
  runtimes: { current: current.config.runtime, legacy: legacy.config.runtime },
  currentRepo,
  legacyRepo,
  iterations,
  config: {
    blocks,
    insertOps,
  },
  current: current.lanes,
  legacy: legacy.lanes,
  deltaMeanMs: {
    readChildrenLengthAfterEachMs: round(
      current.lanes.readChildrenLengthAfterEachMs.mean -
        legacy.lanes.readChildrenLengthAfterEachMs.mean
    ),
    nodesAtRootAfterEachMs: round(
      current.lanes.nodesAtRootAfterEachMs.mean -
        legacy.lanes.nodesAtRootAfterEachMs.mean
    ),
    positionsFirstBlockAfterEachMs: round(
      current.lanes.positionsFirstBlockAfterEachMs.mean -
        legacy.lanes.positionsFirstBlockAfterEachMs.mean
    ),
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-core-observation-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
