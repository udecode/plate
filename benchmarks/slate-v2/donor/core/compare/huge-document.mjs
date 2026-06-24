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
  process.env.CORE_HUGE_BENCH_LEGACY_REPO || defaultLegacyRepo
);

const iterations = Number(process.env.CORE_HUGE_BENCH_ITERATIONS || 3);
const blocks = Number(process.env.CORE_HUGE_BENCH_BLOCKS || 1000);
const typeOps = Number(process.env.CORE_HUGE_BENCH_TYPE_OPS || 20);
const profile = process.env.CORE_HUGE_BENCH_PROFILE === '1';
const currentOnly = process.env.CORE_HUGE_BENCH_CURRENT_ONLY === '1';
const replacementText = 'replacement marker';

const benchmarkSource = `
import assert from 'node:assert/strict';

let Slate;
let SlateInternal = {};

try {
  Slate = await import('../../packages/slate/src/index.ts');
  SlateInternal = await import('../../packages/slate/src/internal/index.ts');
} catch {
  Slate = await import('@platejs/slate');

  try {
    SlateInternal = await import('@platejs/slate/internal');
  } catch {}
}

let SlateHistory = {};

try {
  SlateHistory = await import('../../packages/slate-history/src/index.ts');
} catch {
  try {
    SlateHistory = await import('@platejs/slate-history');
  } catch {}
}

const { createEditor } = Slate;
const Editor = Slate.Editor ?? SlateInternal.Editor;
const legacyTransforms = Slate.Transforms;
const historyExtension = SlateHistory.history;
const legacyWithHistory = SlateHistory.withHistory;

const iterations = Number(process.env.CORE_HUGE_BENCH_ITERATIONS || 3);
const blocks = Number(process.env.CORE_HUGE_BENCH_BLOCKS || 1000);
const typeOps = Number(process.env.CORE_HUGE_BENCH_TYPE_OPS || 20);
const profile = process.env.CORE_HUGE_BENCH_PROFILE === '1';
const replacementText = ${JSON.stringify(replacementText)};

let profileEvents = [];

if (profile) {
  globalThis.__SLATE_REACT_RENDER_PROFILER__ = {
    record(event) {
      if (event?.kind === 'core-time') {
        profileEvents.push(event);
      }
    },
  };
}

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

const summarizeProfile = (events) => {
  const buckets = new Map();

  for (const event of events) {
    const samples = buckets.get(event.id) ?? [];
    samples.push(event.duration);
    buckets.set(event.id, samples);
  }

  return Object.fromEntries(
    [...buckets.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, samples]) => [id, summarize(samples)])
  );
};

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: \`block-\${index}\` }],
  }));

const createFragment = () => [
  {
    type: 'paragraph',
    children: [{ text: replacementText }],
  },
];

const replaceEditor = (editor, input) => {
  if (typeof Editor.replace === 'function') {
    Editor.replace(editor, input);
    return;
  }

  editor.children = input.children;
  editor.selection = input.selection ?? null;
  editor.marks = input.marks ?? null;
};

const createHistoryEditor = () => {
  if (typeof historyExtension === 'function') {
    return createEditor({ extensions: [historyExtension()] });
  }

  const editor = createEditor();

  return typeof legacyWithHistory === 'function'
    ? legacyWithHistory(editor)
    : editor;
};

const subscribeSnapshot = (editor) => {
  if (typeof Editor.subscribe !== 'function') {
    return () => {};
  }

  return Editor.subscribe(editor, () => {});
};

const getChildren = (editor) =>
  typeof Editor.getChildren === 'function'
      ? Editor.getChildren(editor)
      : typeof Editor.getSnapshot === 'function'
        ? Editor.getSnapshot(editor).children
        : editor.children;

const getSelection = (editor) =>
  typeof Editor.getSelection === 'function'
    ? Editor.getSelection(editor)
    : typeof editor.getSelection === 'function'
      ? editor.getSelection()
      : typeof Editor.getSnapshot === 'function'
        ? Editor.getSnapshot(editor).selection
        : editor.selection;

const select = (editor, target) => {
  if (typeof editor.update === 'function') {
    editor.update((tx) => {
      tx.selection.set(target);
    });
    return;
  }

  legacyTransforms.select(editor, target);
};

const deleteFragment = (editor) => {
  if (typeof editor.update === 'function') {
    editor.update((tx) => {
      tx.fragment.delete({ direction: 'backward' });
    });
    return;
  }

  legacyTransforms.delete(editor);
};

const insertText = (editor, text, options) => {
  if (typeof editor.update === 'function') {
    editor.update((tx) => {
      tx.text.insert(text, options);
    });
    return;
  }

  legacyTransforms.insertText(editor, text, options);
};

const insertFragment = (editor, fragment) => {
  if (typeof editor.update === 'function') {
    editor.update((tx) => {
      tx.fragment.insert(fragment);
    });
    return;
  }

  legacyTransforms.insertFragment(editor, fragment);
};

const undo = (editor) => {
  if (typeof editor.update === 'function') {
    editor.update((tx) => {
      tx.history.undo();
    });
    return;
  }

  if (typeof editor.undo === 'function') {
    editor.undo();
    return;
  }

  throw new Error('Missing history undo adapter');
};

const measureLane = (setup, run) => {
  const samples = [];
  const profileSamples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    profileEvents = [];
    const start = now();
    run(editor);
    const duration = now() - start;

    if (iteration > 0) {
      samples.push(duration);
      if (profile) {
        profileSamples.push(...profileEvents);
      }
    }
  }

  return profile
    ? {
        ...summarize(samples),
        profile: summarizeProfile(profileSamples),
      }
    : summarize(samples);
};

const typeAtBlock = (blockIndex) =>
  measureLane(
    () => {
      const editor = createEditor();
      replaceEditor(editor, {
        children: createChildren(blocks),
        selection: null,
      });
      return editor;
    },
    (editor) => {
      for (let index = 0; index < typeOps; index += 1) {
        insertText(editor, 'X', {
          at: { path: [blockIndex, 0], offset: index },
        });
      }

      const typedText = getChildren(editor)[blockIndex]?.children[0]?.text ?? '';
      assert.equal((typedText.match(/X/g) ?? []).length, typeOps);
    }
  );

const replaceFullDocumentWithText = () =>
  measureLane(
    () => {
      const editor = createEditor();
      replaceEditor(editor, {
        children: createChildren(blocks),
        selection: null,
      });
      return editor;
    },
    (editor) => {
      const children = getChildren(editor);
      select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: {
          path: [blocks - 1, 0],
          offset: children[blocks - 1]?.children[0]?.text.length ?? 0,
        },
      });
      insertText(editor, replacementText);

      assert.equal(
        getChildren(editor).map((node) => node.children[0]?.text).join(''),
        replacementText
      );
    }
  );

const insertFragmentFullDocument = () =>
  measureLane(
    () => {
      const editor = createEditor();
      replaceEditor(editor, {
        children: createChildren(blocks),
        selection: null,
      });
      return editor;
    },
    (editor) => {
      const children = getChildren(editor);
      select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: {
          path: [blocks - 1, 0],
          offset: children[blocks - 1]?.children[0]?.text.length ?? 0,
        },
      });
      insertFragment(editor, createFragment());

      assert.equal(
        getChildren(editor).map((node) => node.children[0]?.text).join(''),
        replacementText
      );
    }
  );

const selectAll = () =>
  measureLane(
    () => {
      const editor = createEditor();
      replaceEditor(editor, {
        children: createChildren(blocks),
        selection: null,
      });
      return editor;
    },
    (editor) => {
      const children = getChildren(editor);
      select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: {
          path: [blocks - 1, 0],
          offset: children[blocks - 1]?.children[0]?.text.length ?? 0,
        },
      });

      assert.deepEqual(getSelection(editor)?.anchor, { path: [0, 0], offset: 0 });
    }
  );

const selectAllDeleteTypeUndo = () =>
  measureLane(
    () => {
      const editor = createHistoryEditor();
      replaceEditor(editor, {
        children: createChildren(blocks),
        selection: null,
      });
      subscribeSnapshot(editor);
      return editor;
    },
    (editor) => {
      const children = getChildren(editor);
      select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: {
          path: [blocks - 1, 0],
          offset: children[blocks - 1]?.children[0]?.text.length ?? 0,
        },
      });
      deleteFragment(editor);
      insertText(editor, 'after');
      undo(editor);
      undo(editor);

      const restored = getChildren(editor);
      assert.equal(restored.length, blocks);
      assert.equal(restored[0]?.children[0]?.text, 'block-0');
      assert.equal(restored.at(-1)?.children[0]?.text, \`block-\${blocks - 1}\`);
    }
  );

const startBlockTypeMs = typeAtBlock(0);
const middleBlockTypeMs = typeAtBlock(Math.floor(blocks / 2));
const replaceFullDocumentWithTextMs = replaceFullDocumentWithText();
const insertFragmentFullDocumentMs = insertFragmentFullDocument();
const selectAllMs = selectAll();
const selectAllDeleteTypeUndoMs = selectAllDeleteTypeUndo();

console.log(JSON.stringify({
  iterations,
  config: {
    blocks,
    typeOps,
  },
  lanes: {
    startBlockTypeMs,
    middleBlockTypeMs,
    replaceFullDocumentWithTextMs,
    insertFragmentFullDocumentMs,
    selectAllMs,
    selectAllDeleteTypeUndoMs,
  },
}));
`;

const currentPackageManager = await parsePackageManager(currentRepo);
const legacyPackageManager = currentOnly
  ? null
  : await parsePackageManager(legacyRepo);

await buildRepo(currentRepo, currentPackageManager, './packages/slate');
if (legacyPackageManager) {
  await buildRepo(legacyRepo, legacyPackageManager, './packages/slate');
}

const env = {
  CORE_HUGE_BENCH_ITERATIONS: String(iterations),
  CORE_HUGE_BENCH_BLOCKS: String(blocks),
  CORE_HUGE_BENCH_TYPE_OPS: String(typeOps),
  CORE_HUGE_BENCH_PROFILE: profile ? '1' : '0',
};

const current = await benchmarkRepo({
  benchmarkSource,
  env,
  packageManager: currentPackageManager,
  repo: currentRepo,
});
const legacy = legacyPackageManager
  ? await benchmarkRepo({
      benchmarkSource,
      env,
      packageManager: legacyPackageManager,
      repo: legacyRepo,
    })
  : null;

const summary = {
  lane: 'core-huge-document-compare-local',
  currentRepo,
  legacyRepo,
  iterations,
  config: {
    blocks,
    currentOnly,
    profile,
    typeOps,
  },
  current: current.lanes,
  legacy: legacy?.lanes ?? null,
  deltaMeanMs: legacy
    ? {
        startBlockTypeMs: round(
          current.lanes.startBlockTypeMs.mean -
            legacy.lanes.startBlockTypeMs.mean
        ),
        middleBlockTypeMs: round(
          current.lanes.middleBlockTypeMs.mean -
            legacy.lanes.middleBlockTypeMs.mean
        ),
        replaceFullDocumentWithTextMs: round(
          current.lanes.replaceFullDocumentWithTextMs.mean -
            legacy.lanes.replaceFullDocumentWithTextMs.mean
        ),
        insertFragmentFullDocumentMs: round(
          current.lanes.insertFragmentFullDocumentMs.mean -
            legacy.lanes.insertFragmentFullDocumentMs.mean
        ),
        selectAllMs: round(
          current.lanes.selectAllMs.mean - legacy.lanes.selectAllMs.mean
        ),
        selectAllDeleteTypeUndoMs: round(
          current.lanes.selectAllDeleteTypeUndoMs.mean -
            legacy.lanes.selectAllDeleteTypeUndoMs.mean
        ),
      }
    : null,
};

await writeBenchmarkArtifact(
  'tmp/slate-core-huge-document-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
