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
  process.env.HISTORY_BENCH_LEGACY_REPO || defaultLegacyRepo
);

const iterations = Number(process.env.HISTORY_BENCH_ITERATIONS || 15);
const blocks = Number(process.env.HISTORY_BENCH_BLOCKS || 5000);
const typeOps = Number(process.env.HISTORY_BENCH_TYPE_OPS || 20);
const fragmentBlocks = Number(process.env.HISTORY_BENCH_FRAGMENT_BLOCKS || 200);

const benchmarkSource = `
import assert from 'node:assert/strict';

let Slate;
let SlateInternal = {};
let SlateHistory;

try {
  Slate = await import('../../packages/slate/src/index.ts');
  SlateInternal = await import('../../packages/slate/src/internal/index.ts');
  SlateHistory = await import('../../packages/slate-history/src/index.ts');
} catch {
  Slate = await import('@platejs/slate');
  SlateHistory = await import('@platejs/slate-history');

  try {
    SlateInternal = await import('@platejs/slate/internal');
  } catch {}
}

const { createEditor } = Slate;
const Editor = Slate.Editor ?? SlateInternal.Editor;
const historyExtension = SlateHistory.history;
const withHistory = SlateHistory.withHistory;

const iterations = Number(process.env.HISTORY_BENCH_ITERATIONS || 15);
const blocks = Number(process.env.HISTORY_BENCH_BLOCKS || 5000);
const typeOps = Number(process.env.HISTORY_BENCH_TYPE_OPS || 20);
const fragmentBlocks = Number(process.env.HISTORY_BENCH_FRAGMENT_BLOCKS || 200);

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

const createFragment = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: \`fragment-\${index}\` }],
  }));

const withHistoryEditor = () => {
  if (typeof historyExtension === 'function') {
    return createEditor({ extensions: [historyExtension()] });
  }

  if (typeof withHistory === 'function') {
    return withHistory(createEditor());
  }

  throw new Error('No supported slate-history API found');
};

const readHistory = (editor) => {
  if (editor.history) {
    return editor.history;
  }

  if (typeof editor.read === 'function') {
    return editor.read((state) => state.history.get());
  }

  throw new Error('No supported history state API found');
};

const undo = (editor) => {
  if (typeof editor.undo === 'function') {
    editor.undo();
    return;
  }

  editor.update((tx) => {
    tx.history.undo();
  });
};

const redo = (editor) => {
  if (typeof editor.redo === 'function') {
    editor.redo();
    return;
  }

  editor.update((tx) => {
    tx.history.redo();
  });
};

const replaceEditor = (editor, input) => {
  if (typeof Editor.replace === 'function') {
    Editor.replace(editor, input);
    return;
  }

  editor.children = input.children;
  editor.selection = input.selection ?? null;
  editor.marks = input.marks ?? null;
};

const getChildren = (editor) =>
  typeof Editor.getSnapshot === 'function'
    ? Editor.getSnapshot(editor).children
    : typeof editor.getChildren === 'function'
      ? editor.getChildren()
      : editor.children;

const write = (editor, fn) => {
  if (typeof editor.update === 'function') {
    editor.update(fn);
    return;
  }

  fn(null);
};

const typeEditor = () => {
  const editor = withHistoryEditor();

  replaceEditor(editor, {
    children: createChildren(blocks),
    selection: {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    },
  });

  write(editor, (tx) => {
    for (let index = 0; index < typeOps; index += 1) {
      if (tx) {
        tx.text.insert('X');
      } else {
        editor.insertText('X');
      }
    }
  });

  assert.equal(readHistory(editor).undos.length > 0, true);

  return editor;
};

const fragmentEditor = () => {
  const editor = withHistoryEditor();

  replaceEditor(editor, {
    children: createChildren(blocks),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  write(editor, (tx) => {
    if (tx) {
      tx.fragment.insert(createFragment(fragmentBlocks));
    } else {
      editor.insertFragment(createFragment(fragmentBlocks));
    }
  });

  assert.equal(readHistory(editor).undos.length > 0, true);
  editor.__fragmentChildrenLength = getChildren(editor).length;

  return editor;
};

const measureLane = (setup, run, assertFn) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    const start = now();
    run(editor);
    const duration = now() - start;
    assertFn(editor);

    if (iteration > 0) {
      samples.push(duration);
    }
  }

  return summarize(samples);
};

const typingUndoMs = measureLane(
  typeEditor,
  undo,
  (editor) => {
    assert.equal(readHistory(editor).redos.length > 0, true);
    assert.equal(
      getChildren(editor)[0]?.children[0]?.text,
      'block-0'
    );
  }
);

const typingRedoMs = measureLane(
  () => {
    const editor = typeEditor();
    undo(editor);
    return editor;
  },
  redo,
  (editor) => {
    assert.equal(readHistory(editor).undos.length > 0, true);
    assert.equal(
      getChildren(editor)[0]?.children[0]?.text.startsWith('block-0'),
      true
    );
  }
);

const fragmentUndoMs = measureLane(
  fragmentEditor,
  undo,
  (editor) => {
    assert.equal(readHistory(editor).redos.length > 0, true);
    assert.equal(getChildren(editor).length, blocks);
  }
);

const fragmentRedoMs = measureLane(
  () => {
    const editor = fragmentEditor();
    undo(editor);
    return editor;
  },
  redo,
  (editor) => {
    assert.equal(readHistory(editor).undos.length > 0, true);
    assert.equal(
      getChildren(editor).length,
      editor.__fragmentChildrenLength
    );
  }
);

console.log(JSON.stringify({
  iterations,
  config: {
    blocks,
    typeOps,
    fragmentBlocks,
  },
  lanes: {
    typingUndoMs,
    typingRedoMs,
    fragmentUndoMs,
    fragmentRedoMs,
  },
}));
`;

const currentPackageManager = await parsePackageManager(currentRepo);
const legacyPackageManager = await parsePackageManager(legacyRepo);

await buildRepo(currentRepo, currentPackageManager, './packages/slate-history');
await buildRepo(legacyRepo, legacyPackageManager, './packages/slate-history');

const env = {
  HISTORY_BENCH_ITERATIONS: String(iterations),
  HISTORY_BENCH_BLOCKS: String(blocks),
  HISTORY_BENCH_TYPE_OPS: String(typeOps),
  HISTORY_BENCH_FRAGMENT_BLOCKS: String(fragmentBlocks),
};

const current = await benchmarkRepo({
  benchmarkSource,
  env,
  packageManager: currentPackageManager,
  repo: currentRepo,
});
const legacy = await benchmarkRepo({
  benchmarkSource,
  env,
  packageManager: legacyPackageManager,
  repo: legacyRepo,
});

const laneNames = [
  'typingUndoMs',
  'typingRedoMs',
  'fragmentUndoMs',
  'fragmentRedoMs',
];
const ratio = (currentValue, legacyValue) => {
  if (legacyValue === 0) {
    return currentValue === 0 ? 1 : 999_999;
  }

  return round(currentValue / legacyValue);
};
const laneMetric = (stat, metric) =>
  Object.fromEntries(
    laneNames.map((lane) => [
      lane,
      stat === 'ratio'
        ? ratio(current.lanes[lane][metric], legacy.lanes[lane][metric])
        : round(current.lanes[lane][metric] - legacy.lanes[lane][metric]),
    ])
  );
const worstLane = (values) =>
  laneNames.reduce((worst, lane) =>
    values[lane] > values[worst] ? lane : worst
  );

const p95Ratio = laneMetric('ratio', 'p95');
const meanRatio = laneMetric('ratio', 'mean');
const p95DeltaMs = laneMetric('delta', 'p95');
const meanDeltaMs = laneMetric('delta', 'mean');
const worstP95Lane = worstLane(p95Ratio);
const worstMeanLane = worstLane(meanRatio);

const summary = {
  lane: 'history-compare-local',
  currentRepo,
  legacyRepo,
  iterations,
  config: {
    blocks,
    typeOps,
    fragmentBlocks,
  },
  current: current.lanes,
  legacy: legacy.lanes,
  comparison: {
    p95Ratio,
    meanRatio,
    p95DeltaMs,
    meanDeltaMs,
    worstP95: {
      lane: worstP95Lane,
      ratio: p95Ratio[worstP95Lane],
      deltaMs: p95DeltaMs[worstP95Lane],
      currentMs: current.lanes[worstP95Lane].p95,
      legacyMs: legacy.lanes[worstP95Lane].p95,
    },
    worstMean: {
      lane: worstMeanLane,
      ratio: meanRatio[worstMeanLane],
      deltaMs: meanDeltaMs[worstMeanLane],
      currentMs: current.lanes[worstMeanLane].mean,
      legacyMs: legacy.lanes[worstMeanLane].mean,
    },
  },
  deltaMeanMs: {
    typingUndoMs: round(
      current.lanes.typingUndoMs.mean - legacy.lanes.typingUndoMs.mean
    ),
    typingRedoMs: round(
      current.lanes.typingRedoMs.mean - legacy.lanes.typingRedoMs.mean
    ),
    fragmentUndoMs: round(
      current.lanes.fragmentUndoMs.mean - legacy.lanes.fragmentUndoMs.mean
    ),
    fragmentRedoMs: round(
      current.lanes.fragmentRedoMs.mean - legacy.lanes.fragmentRedoMs.mean
    ),
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-history-compare-benchmark.json',
  summary
);

console.log(
  `METRIC history_compare_worst_p95_ratio=${summary.comparison.worstP95.ratio}`
);
console.log(
  `METRIC history_compare_worst_p95_delta_ms=${summary.comparison.worstP95.deltaMs}`
);
console.log(
  `METRIC history_compare_worst_mean_ratio=${summary.comparison.worstMean.ratio}`
);
console.log(
  `METRIC history_compare_worst_mean_delta_ms=${summary.comparison.worstMean.deltaMs}`
);
console.log(
  `WORST history lane p95=${summary.comparison.worstP95.lane} current=${summary.comparison.worstP95.currentMs}ms legacy=${summary.comparison.worstP95.legacyMs}ms`
);
console.log(JSON.stringify(summary, null, 2));
