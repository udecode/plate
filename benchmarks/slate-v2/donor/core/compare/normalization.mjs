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

if (isPlite) {
  Slate = await import('platejs');
} else {
  Slate = await import('slate');
}

const { createEditor } = Slate;
const Editor = Slate.Editor;
const legacyTransforms = Slate.Transforms;
const currentSchema = isPlite
  ? Slate.defineEditorSchema('normalization-compare', {
      elements: {
        paragraph: { content: Slate.schema.content.text() },
        title: { content: Slate.schema.content.text() },
      },
      properties: [Slate.schema.textProperty('bold', Slate.property.boolean())],
      root: Slate.schema.content.types(['paragraph', 'title']),
      unknown: 'preserve',
    })
  : null;
const currentInlineSchema = isPlite
  ? Slate.defineEditorSchema('normalization-compare-inline', {
      elements: {
        inline: { content: Slate.schema.content.text(), inline: true },
        paragraph: { content: Slate.schema.content.open() },
      },
      id: 'normalization-compare-inline',
      root: Slate.schema.content.type('paragraph'),
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

const createBenchmarkEditor = (extensions = isPlite ? [currentSchema] : []) => {
  const initialValue = [createParagraph()];
  if (isPlite) return createEditor({ extensions, initialValue });
  const editor = createEditor();
  editor.children = initialValue;
  return editor;
};

const replaceEditor = (editor, children) => {
  if (isPlite) {
    editor.update((tx) => tx.value.replace({ children, selection: null }));
    return;
  }
  editor.children = children;
  editor.selection = null;
  editor.marks = null;
};

const getChildren = (editor) =>
  isPlite ? editor.read.children() : editor.children;

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
  if (isPlite) {
    editor.install(Slate.defineExtension('benchmark-noop-normalizer', {
      corrections: [
        {
          event: 'content',
          correct() {
            // Measure registered correction dispatch without changing content.
          },
        },
      ],
    }));
    return;
  }

  const normalizeNode = editor.normalizeNode;
  editor.normalizeNode = (entry) => {
    normalizeNode(entry);
  };
};

const installForcedLayoutNormalizer = (editor) => {
  if (isPlite) {
    editor.install(Slate.defineExtension('benchmark-forced-layout-normalizer', {
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
    }));
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
    try {
      const editor = setup();
      const start = now();
      run(editor);
      const duration = now() - start;

      if (iteration > 0) {
        samples.push(duration / sampleDivisor);
      }
    } catch (error) {
      return {
        status: 'invalid',
        error: { name: error.name, message: error.message },
        samples: [],
        mean: null,
        median: null,
        min: null,
        max: null,
      };
    }
  }

  return { status: 'pass', ...summarize(samples) };
};

const explicitAdjacentTextNormalizeMs = measureLane(
  () => createBenchmarkEditor(),
  (editor) => {
    replaceEditor(editor, createAdjacentTextChildren(explicitBlocks));
    normalizeEditor(editor, { force: true });
    assert.deepEqual(getChildren(editor)[0]?.children, [{ text: 'alphabeta', bold: true }]);
  }
);

const explicitInlineFlattenNormalizeMs = measureLane(
  () => {
    const editor = createBenchmarkEditor(isPlite ? [currentInlineSchema] : []);
    if (!isPlite) {
      editor.isInline = (element) => element.type === 'inline';
    }
    return editor;
  },
  (editor) => {
    replaceEditor(editor, createInlineFlattenChildren(explicitBlocks));
    normalizeEditor(editor, { force: true });
    assert.deepEqual(getChildren(editor)[0]?.children[1]?.children, [{ text: 'onetwothreefour' }]);
  }
);

const insertTextReadAfterEachMs = measureLane(
  () => {
    const editor = createBenchmarkEditor();
    replaceEditor(editor, createInsertChildren(insertBlocks));
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
    const editor = createBenchmarkEditor();
    installNoopNormalizer(editor);
    return editor;
  },
  (editor) => {
    replaceEditor(editor, createAdjacentTextChildren(explicitBlocks));
    normalizeEditor(editor, { force: true });
    assert.deepEqual(getChildren(editor)[0]?.children, [{ text: 'alphabeta', bold: true }]);
  }
);

const forcedLayoutRepairMs = measureLane(
  () => {
    return Array.from({ length: forcedLayoutCases }, () => {
      const editor = createBenchmarkEditor();
      installForcedLayoutNormalizer(editor);
      return editor;
    });
  },
  (editors) => {
    for (const editor of editors) {
      replaceEditor(editor, createForcedLayoutChildren());
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
  await buildRepo(currentRepo, currentPackageManager, './packages/test');
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
  metricContract: 'Replacement plus canonical repair is timed for explicit and forced-layout lanes on both engines. The insert lane times edits and reads after valid setup. Invalid fixture or correctness rows have null metrics, remain in the denominator and fail the comparison.',
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
  deltaMeanMs: Object.fromEntries(Object.keys(current.lanes).map((lane) => [lane,
    current.lanes[lane].status === 'pass' && legacy.lanes[lane].status === 'pass'
      ? round(current.lanes[lane].mean - legacy.lanes[lane].mean)
      : null,
  ])),
  invalidRows: ['current', 'legacy'].flatMap((engine) =>
    Object.entries(engine === 'current' ? current.lanes : legacy.lanes)
      .filter(([, result]) => result.status !== 'pass')
      .map(([lane, result]) => ({ engine, lane, error: result.error }))
  ),
};

await writeBenchmarkArtifact(
  'tmp/slate-normalization-compare-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
if (summary.invalidRows.length > 0) process.exitCode = 1;
