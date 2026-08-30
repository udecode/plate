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
  process.env.NORMALIZATION_BENCH_LEGACY_REPO || defaultLegacyRepo
);

const iterations = Number(process.env.NORMALIZATION_BENCH_ITERATIONS || 3);
const explicitBlocks = Number(
  process.env.NORMALIZATION_BENCH_EXPLICIT_BLOCKS || 250
);
const insertBlocks = Number(
  process.env.NORMALIZATION_BENCH_INSERT_BLOCKS || 500
);
const insertOps = Number(process.env.NORMALIZATION_BENCH_INSERT_OPS || 50);
const forcedLayoutCases = Number(
  process.env.NORMALIZATION_BENCH_FORCED_LAYOUT_CASES || 100
);
const skipBuild = process.env.BENCHMARK_SKIP_BUILD === '1';

const benchmarkSource = `
import assert from 'node:assert/strict';

const isPlite = process.env.BENCHMARK_ENGINE === 'current';
let Slate;
let SlateInternal = {};

if (isPlite) {
  Slate = await import('platejs');
  SlateInternal = await import('@platejs/test');
} else {
  Slate = await import('slate');
}

const { createEditor } = Slate;
const Editor = Slate.Editor ?? SlateInternal.Editor ?? SlateInternal;
const legacyTransforms = Slate.Transforms;
const currentInlineSchema = isPlite
  ? Slate.defineEditorSchema({
      elements: {
        inline: { content: Slate.schema.content.open(), inline: true },
        paragraph: { content: Slate.schema.content.open() },
      },
      id: 'normalization-compare-inline',
      root: { content: Slate.schema.content.type('paragraph') },
      unknown: 'preserve',
      version: 1,
    })
  : null;

const iterations = Number(process.env.NORMALIZATION_BENCH_ITERATIONS || 3);
const explicitBlocks = Number(process.env.NORMALIZATION_BENCH_EXPLICIT_BLOCKS || 250);
const insertBlocks = Number(process.env.NORMALIZATION_BENCH_INSERT_BLOCKS || 500);
const insertOps = Number(process.env.NORMALIZATION_BENCH_INSERT_OPS || 50);
const forcedLayoutCases = Number(process.env.NORMALIZATION_BENCH_FORCED_LAYOUT_CASES || 100);

const now = () => performance.now();
const round = (value) => Number(value.toFixed(2));

const summarize = (samples) => {
  if (samples.length === 0) {
    return {
      samples: [],
      mean: 0,
      median: 0,
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
    min: round(sorted[0] ?? 0),
    max: round(sorted.at(-1) ?? 0),
  };
};

const createAdjacentTextChildren = (blocks) =>
  Array.from({ length: blocks }, () => ({
    type: 'paragraph',
    children: [
      { text: 'alpha', bold: true },
      { text: 'beta', bold: true },
    ],
  }));

const createInlineFlattenChildren = (blocks) =>
  Array.from({ length: blocks }, () => ({
    type: 'paragraph',
    children: [
      { text: '' },
      {
        type: 'inline',
        children: [
          { type: 'paragraph', children: [{ text: 'one' }] },
          { text: 'two' },
          { type: 'paragraph', children: [{ text: 'three' }] },
          { text: 'four' },
        ],
      },
      { text: '' },
    ],
  }));

const createInsertChildren = (blocks) =>
  Array.from({ length: blocks }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: \`block-\${index}\` }],
  }));

const createForcedLayoutChildren = () => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
];

const createTitle = () => ({
  type: 'title',
  children: [{ text: 'Untitled' }],
});

const createParagraph = () => ({
  type: 'paragraph',
  children: [{ text: '' }],
});

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
  typeof Editor.getChildren === 'function'
    ? Editor.getChildren(editor)
    : typeof Editor.getSnapshot === 'function'
      ? Editor.getSnapshot(editor).children
      : typeof editor.getChildren === 'function'
        ? editor.getChildren()
        : editor.children;

const normalizeEditor = (editor, options) => {
  if (isPlite) {
    editor.update.value.repair();
    return;
  }

  if (typeof editor.update === 'function') {
    editor.update(() => {
      Editor.normalize(editor, options);
    });
    return;
  }

  Editor.normalize(editor, options);
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

const isEditorNode = (node) => Editor.isEditor(node);

const nodeString = (node) => {
  if (!node) {
    return '';
  }

  if (typeof Slate.NodeApi?.string === 'function') {
    return Slate.NodeApi.string(node);
  }

  return Slate.Node.string(node);
};

const installNoopNormalizer = (editor) => {
  if (typeof editor.extend === 'function') {
    editor.extend({
      name: 'benchmark-noop-normalizer',
      corrections: [
        {
          event: 'content',
          correct() {
            // Measure registered correction dispatch without changing content.
          },
        },
      ],
    });
    return;
  }

  const normalizeNode = editor.normalizeNode;
  editor.normalizeNode = (entry) => {
    normalizeNode(entry);
  };
};

const installForcedLayoutNormalizer = (editor) => {
  if (typeof editor.extend === 'function') {
    editor.extend({
      name: 'benchmark-forced-layout-normalizer',
      corrections: [
        {
          event: 'children',
          query: 'root',
          correct({ tx }) {
            const children = tx.nodes.children();
            const first = children[0];
            const second = children[1];
            const firstText = nodeString(first);

            if (children.length <= 1 && firstText === '') {
              tx.nodes.insert(createTitle(), { at: [0], select: true });
              return;
            }

            if (children.length < 2) {
              tx.nodes.insert(createParagraph(), { at: [1] });
              return;
            }

            if (first && 'children' in first && first.type !== 'title') {
              tx.nodes.set({ type: 'title' }, { at: [0] });
              return;
            }

            if (
              second &&
              'children' in second &&
              second.type !== 'paragraph'
            ) {
              tx.nodes.set({ type: 'paragraph' }, { at: [1] });
            }
          },
        },
      ],
    });
    return;
  }

  const normalizeNode = editor.normalizeNode;
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (!isEditorNode(node) || path.length !== 0) {
      normalizeNode(entry);
      return;
    }

    const children = getChildren(editor);
    const first = children[0];
    const second = children[1];
    const firstText = nodeString(first);

    if (children.length <= 1 && firstText === '') {
      legacyTransforms.insertNodes(editor, createTitle(), {
        at: [0],
        select: true,
      });
      return;
    }

    if (children.length < 2) {
      legacyTransforms.insertNodes(editor, createParagraph(), { at: [1] });
      return;
    }

    if (first && 'children' in first && first.type !== 'title') {
      legacyTransforms.setNodes(editor, { type: 'title' }, { at: [0] });
      return;
    }

    if (second && 'children' in second && second.type !== 'paragraph') {
      legacyTransforms.setNodes(editor, { type: 'paragraph' }, { at: [1] });
      return;
    }

    normalizeNode(entry);
  };
};

const measureLane = (setup, run, options = {}) => {
  const samples = [];
  const sampleDivisor = options.sampleDivisor ?? 1;

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    const start = now();
    run(editor);
    const duration = now() - start;

    if (iteration > 0) {
      samples.push(duration / sampleDivisor);
    }
  }

  return summarize(samples);
};

const explicitAdjacentTextNormalizeMs = measureLane(
  () => {
    const editor = createEditor();
    replaceEditor(editor, {
      children: createAdjacentTextChildren(explicitBlocks),
      selection: null,
    });
    return editor;
  },
  (editor) => {
    normalizeEditor(editor, { force: true });
    assert.deepEqual(getChildren(editor)[0]?.children, [{ text: 'alphabeta', bold: true }]);
  }
);

const explicitInlineFlattenNormalizeMs = measureLane(
  () => {
    const editor = isPlite
      ? createEditor({ extensions: [currentInlineSchema] })
      : createEditor();
    if (!isPlite) {
      editor.isInline = (element) => element.type === 'inline';
    }
    replaceEditor(editor, {
      children: createInlineFlattenChildren(explicitBlocks),
      selection: null,
    });
    return editor;
  },
  (editor) => {
    normalizeEditor(editor, { force: true });
    assert.deepEqual(getChildren(editor)[0]?.children[1]?.children, [{ text: 'onetwothreefour' }]);
  }
);

const insertTextReadAfterEachMs = measureLane(
  () => {
    const editor = createEditor();
    replaceEditor(editor, {
      children: createInsertChildren(insertBlocks),
      selection: null,
    });
    return editor;
  },
  (editor) => {
    for (let index = 0; index < insertOps; index += 1) {
      insertText(editor, 'X', {
        at: { path: [index % insertBlocks, 0], offset: 0 },
      });

      void getChildren(editor).length;
    }

    assert.equal(getChildren(editor)[0]?.children[0]?.text.startsWith('X'), true);
  }
);

const noopNormalizerExplicitAdjacentTextNormalizeMs = measureLane(
  () => {
    const editor = createEditor();
    installNoopNormalizer(editor);
    replaceEditor(editor, {
      children: createAdjacentTextChildren(explicitBlocks),
      selection: null,
    });
    return editor;
  },
  (editor) => {
    normalizeEditor(editor, { force: true });
    assert.deepEqual(getChildren(editor)[0]?.children, [{ text: 'alphabeta', bold: true }]);
  }
);

const forcedLayoutRepairMs = measureLane(
  () => {
    return Array.from({ length: forcedLayoutCases }, () => {
      const editor = createEditor();
      installForcedLayoutNormalizer(editor);
      replaceEditor(editor, {
        children: createForcedLayoutChildren(),
        selection: null,
      });
      return editor;
    });
  },
  (editors) => {
    for (const editor of editors) {
      normalizeEditor(editor, { force: true });
      assert.deepEqual(getChildren(editor).slice(0, 2), [
        {
          type: 'title',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
    }
  },
  { sampleDivisor: forcedLayoutCases }
);

console.log(JSON.stringify({
  iterations,
  config: {
    explicitBlocks,
    insertBlocks,
    insertOps,
    forcedLayoutCases,
  },
  lanes: {
    explicitAdjacentTextNormalizeMs,
    explicitInlineFlattenNormalizeMs,
    insertTextReadAfterEachMs,
    noopNormalizerExplicitAdjacentTextNormalizeMs,
    forcedLayoutRepairMs,
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
  NORMALIZATION_BENCH_ITERATIONS: String(iterations),
  NORMALIZATION_BENCH_EXPLICIT_BLOCKS: String(explicitBlocks),
  NORMALIZATION_BENCH_INSERT_BLOCKS: String(insertBlocks),
  NORMALIZATION_BENCH_INSERT_OPS: String(insertOps),
  NORMALIZATION_BENCH_FORCED_LAYOUT_CASES: String(forcedLayoutCases),
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

const summary = {
  lane: 'normalization-compare-local',
  currentRepo,
  legacyRepo,
  iterations,
  config: {
    explicitBlocks,
    insertBlocks,
    insertOps,
    forcedLayoutCases,
  },
  current: current.lanes,
  legacy: legacy.lanes,
  deltaMeanMs: {
    explicitAdjacentTextNormalizeMs: round(
      current.lanes.explicitAdjacentTextNormalizeMs.mean -
        legacy.lanes.explicitAdjacentTextNormalizeMs.mean
    ),
    explicitInlineFlattenNormalizeMs: round(
      current.lanes.explicitInlineFlattenNormalizeMs.mean -
        legacy.lanes.explicitInlineFlattenNormalizeMs.mean
    ),
    insertTextReadAfterEachMs: round(
      current.lanes.insertTextReadAfterEachMs.mean -
        legacy.lanes.insertTextReadAfterEachMs.mean
    ),
    noopNormalizerExplicitAdjacentTextNormalizeMs: round(
      current.lanes.noopNormalizerExplicitAdjacentTextNormalizeMs.mean -
        legacy.lanes.noopNormalizerExplicitAdjacentTextNormalizeMs.mean
    ),
    forcedLayoutRepairMs: round(
      current.lanes.forcedLayoutRepairMs.mean -
        legacy.lanes.forcedLayoutRepairMs.mean
    ),
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-normalization-compare-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
