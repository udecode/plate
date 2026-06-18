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
  process.env.RICH_TEXT_OPS_COMPARE_LEGACY_REPO || defaultLegacyRepo
);

const iterations = Number(process.env.RICH_TEXT_OPS_COMPARE_ITERATIONS || 3);
const blockCount = Number(process.env.RICH_TEXT_OPS_COMPARE_BLOCKS || 1000);
const selectionBlocks = Number(
  process.env.RICH_TEXT_OPS_COMPARE_SELECTION_BLOCKS || 32
);
const typeOps = Number(process.env.RICH_TEXT_OPS_COMPARE_TYPE_OPS || 40);
const navigationSteps = Number(
  process.env.RICH_TEXT_OPS_COMPARE_NAVIGATION_STEPS || 200
);

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

const { createEditor } = Slate;
const Editor = Slate.Editor ?? SlateInternal.Editor;
const NodeApi = Slate.NodeApi ?? Slate.Node ?? SlateInternal.NodeApi ?? SlateInternal.Node;
const legacyTransforms = Slate.Transforms;

const iterations = Number(process.env.RICH_TEXT_OPS_COMPARE_ITERATIONS || 3);
const blockCount = Number(process.env.RICH_TEXT_OPS_COMPARE_BLOCKS || 1000);
const selectionBlocks = Number(
  process.env.RICH_TEXT_OPS_COMPARE_SELECTION_BLOCKS || 32
);
const typeOps = Number(process.env.RICH_TEXT_OPS_COMPARE_TYPE_OPS || 40);
const navigationSteps = Number(
  process.env.RICH_TEXT_OPS_COMPARE_NAVIGATION_STEPS || 200
);

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

const createTextLeaves = (index) => [
  { text: 'block-' + index + ' alpha ' },
  { bold: true, text: 'bold-' + index + ' ' },
  { italic: true, text: 'italic-' + index + ' ' },
  { code: true, text: 'code-' + index },
];

const createParagraph = (index, text) => ({
  type: 'paragraph',
  children: text === undefined ? createTextLeaves(index) : [{ text }],
});

const createHeading = (index) => ({
  type: 'heading-one',
  children: [{ bold: true, text: 'Heading ' + index }],
});

const createList = (index) => ({
  type: 'bulleted-list',
  children: [
    {
      type: 'list-item',
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'item ' + index }],
        },
      ],
    },
  ],
});

const createRichBlock = (index) => {
  if (index % 11 === 4) {
    return createList(index);
  }

  if (index % 7 === 0) {
    return createHeading(index);
  }

  return createParagraph(index);
};

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => createRichBlock(index));

const createSimpleChildren = (count, prefix = 'simple') =>
  Array.from({ length: count }, (_, index) =>
    createParagraph(index, prefix + '-' + index)
  );

const createFragment = () => [
  createHeading(9000),
  createParagraph(9001, 'fragment alpha'),
  {
    type: 'paragraph',
    children: [
      { text: 'fragment ' },
      { bold: true, text: 'bold ' },
      { italic: true, text: 'italic' },
    ],
  },
  createList(9002),
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

const getSnapshot = (editor) =>
  typeof Editor.getSnapshot === 'function'
    ? Editor.getSnapshot(editor)
    : editor;

const getChildren = (editor) =>
  typeof Editor.getChildren === 'function'
    ? Editor.getChildren(editor)
    : getSnapshot(editor).children;

const getSelection = (editor) =>
  typeof Editor.getSelection === 'function'
    ? Editor.getSelection(editor)
    : typeof editor.getSelection === 'function'
      ? editor.getSelection()
      : getSnapshot(editor).selection;

const getTextLength = (editor, path) => {
  try {
    return Editor.string(editor, path).length;
  } catch {
    const node = getChildren(editor)[path[0]];
    if (!node || !Array.isArray(node.children)) {
      return 0;
    }

    return node.children
      .map((child) => (typeof child.text === 'string' ? child.text : ''))
      .join('').length;
  }
};

const isTextNode = (node) => Boolean(node && typeof node.text === 'string');

const isBlock = (editor, node) => {
  if (!node || typeof node !== 'object' || !('children' in node)) {
    return false;
  }

  if (typeof Editor.isBlock === 'function') {
    return Editor.isBlock(editor, node);
  }

  return true;
};

const createEditorWithChildren = (children = createChildren(blockCount)) => {
  const editor = createEditor();

  replaceEditor(editor, {
    children,
    selection: null,
    marks: null,
  });

  return editor;
};

const update = (editor, fn) => {
  if (typeof editor.update === 'function') {
    editor.update(fn);
    return;
  }

  fn();
};

const select = (editor, target) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.selection.set(target);
    });
    return;
  }

  legacyTransforms.select(editor, target);
};

const insertText = (editor, text, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.text.insert(text, options);
    });
    return;
  }

  legacyTransforms.insertText(editor, text, options);
};

const deleteText = (editor, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.text.delete(options);
    });
    return;
  }

  legacyTransforms.delete(editor, options);
};

const deleteBackward = (editor) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.text.deleteBackward();
    });
    return;
  }

  legacyTransforms.delete(editor, {
    distance: 1,
    reverse: true,
    unit: 'character',
  });
};

const insertFragment = (editor, fragment) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.fragment.insert(fragment);
    });
    return;
  }

  legacyTransforms.insertFragment(editor, fragment);
};

const insertNodes = (editor, nodes, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.nodes.insert(nodes, options);
    });
    return;
  }

  legacyTransforms.insertNodes(editor, nodes, options);
};

const setNodes = (editor, props, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.nodes.set(props, options);
    });
    return;
  }

  legacyTransforms.setNodes(editor, props, options);
};

const moveNodes = (editor, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.nodes.move(options);
    });
    return;
  }

  legacyTransforms.moveNodes(editor, options);
};

const splitNodes = (editor, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.nodes.split(options);
    });
    return;
  }

  legacyTransforms.splitNodes(editor, options);
};

const removeNodes = (editor, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.nodes.remove(options);
    });
    return;
  }

  legacyTransforms.removeNodes(editor, options);
};

const wrapNodes = (editor, element, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.nodes.wrap(element, options);
    });
    return;
  }

  legacyTransforms.wrapNodes(editor, element, options);
};

const unwrapNodes = (editor, options) => {
  if (typeof editor.update === 'function') {
    update(editor, (tx) => {
      tx.nodes.unwrap(options);
    });
    return;
  }

  legacyTransforms.unwrapNodes(editor, options);
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

const textPointAt = (blockIndex, offset = 0) => ({
  path: [blockIndex, 0],
  offset,
});

const richRange = (editor, count = selectionBlocks) => {
  const lastBlock = Math.min(getChildren(editor).length, count) - 1;

  return {
    anchor: textPointAt(0, 0),
    focus: textPointAt(lastBlock, getTextLength(editor, [lastBlock])),
  };
};

const insertTextCollapsedMs = measureLane(createEditorWithChildren, (editor) => {
  const middle = Math.floor(blockCount / 2);
  select(editor, {
    anchor: textPointAt(middle, 0),
    focus: textPointAt(middle, 0),
  });

  for (let index = 0; index < typeOps; index += 1) {
    insertText(editor, 'x');
  }

  assert.equal(
    (Editor.string(editor, [middle]).match(/x/g) ?? []).length,
    typeOps
  );
});

const deleteBackwardMarkedTextMs = measureLane(
  () =>
    createEditorWithChildren([
      {
        type: 'paragraph',
        children: [
          { text: 'prefix ' },
          { bold: true, text: 'x'.repeat(typeOps + 8) },
        ],
      },
    ]),
  (editor) => {
    select(editor, {
      anchor: { path: [0, 1], offset: typeOps },
      focus: { path: [0, 1], offset: typeOps },
    });

    for (let index = 0; index < typeOps; index += 1) {
      deleteBackward(editor);
    }

    assert.equal(Editor.string(editor, []).includes('x'.repeat(typeOps)), false);
  }
);

const deleteExpandedRangeMs = measureLane(
  () => createEditorWithChildren(createSimpleChildren(blockCount)),
  (editor) => {
    const range = richRange(editor);
    deleteText(editor, { at: range });

    assert.ok(Editor.string(editor, []).length < blockCount * 30);
  }
);

const insertFragmentMixedBlocksMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    const middle = Math.floor(blockCount / 2);
    select(editor, {
      anchor: textPointAt(middle, 0),
      focus: textPointAt(middle, 0),
    });

    insertFragment(editor, createFragment());

    assert.ok(getChildren(editor).length > blockCount);
  }
);

const insertNodesBatchMs = measureLane(createEditorWithChildren, (editor) => {
  insertNodes(
    editor,
    Array.from({ length: selectionBlocks }, (_, index) =>
      createParagraph(10000 + index, 'inserted ' + index)
    ),
    { at: [Math.floor(blockCount / 2)] }
  );

  assert.equal(getChildren(editor).length, blockCount + selectionBlocks);
});

const setNodesSelectedBlocksMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    const range = richRange(editor);
    select(editor, range);
    setNodes(
      editor,
      { type: 'benchmark-heading' },
      {
        at: range,
        match: (node) => isBlock(editor, node) && node.type !== 'bulleted-list',
      }
    );

    const changed = getChildren(editor).slice(0, selectionBlocks);
    assert.ok(
      changed.some(
        (node) => 'children' in node && node.type === 'benchmark-heading'
      )
    );
  }
);

const moveNodesWindowMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = selectionBlocks - 1; index >= 0; index -= 1) {
    moveNodes(editor, {
      at: [index],
      to: [blockCount - 1],
    });
  }

  assert.equal(getChildren(editor).length, blockCount);
});

const splitBlocksMs = measureLane(
  () =>
    createEditorWithChildren(
      Array.from({ length: selectionBlocks }, (_, index) =>
        createParagraph(index, 'split-target-' + index)
      )
    ),
  (editor) => {
    for (let index = selectionBlocks - 1; index >= 0; index -= 1) {
      splitNodes(editor, {
        at: { path: [index, 0], offset: 5 },
      });
    }

    assert.equal(getChildren(editor).length, selectionBlocks * 2);
  }
);

const removeNodesWindowMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = selectionBlocks - 1; index >= 0; index -= 1) {
    removeNodes(editor, { at: [index] });
  }

  assert.equal(getChildren(editor).length, blockCount - selectionBlocks);
});

const wrapUnwrapBlocksMs = measureLane(createEditorWithChildren, (editor) => {
  wrapNodes(
    editor,
    { type: 'quote', children: [] },
    {
      at: richRange(editor),
      match: (node) => isBlock(editor, node) && node.type === 'paragraph',
      mode: 'lowest',
    }
  );

  unwrapNodes(editor, {
    at: [],
    match: (node) => isBlock(editor, node) && node.type === 'quote',
    mode: 'all',
  });

  assert.ok(getChildren(editor).some((node) => node.type === 'paragraph'));
});

const positionsCharacterFullDocumentMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    const positions = Array.from(
      Editor.positions(editor, { at: [], unit: 'character' })
    );

    assert.ok(positions.length > blockCount);
  }
);

const nodesTextScanMs = measureLane(createEditorWithChildren, (editor) => {
  assert.ok(NodeApi?.nodes, 'Slate Node API with nodes() is required');

  const entries = [];

  for (const [node, path] of NodeApi.nodes(editor, { at: [] })) {
    if (isTextNode(node)) {
      entries.push([node, path]);
    }
  }

  assert.ok(entries.length >= blockCount);
});

const beforeAfterWalkMs = measureLane(createEditorWithChildren, (editor) => {
  let point = textPointAt(0, 0);
  let visits = 0;

  for (let index = 0; index < navigationSteps; index += 1) {
    const next =
      Editor.after(editor, point, { unit: 'character' }) ??
      Editor.before(editor, point, { unit: 'character' });

    if (!next) {
      break;
    }

    point = next;
    visits += 1;
  }

  assert.ok(visits > 0);
});

const unhangRangeMs = measureLane(createEditorWithChildren, (editor) => {
  const range = {
    anchor: textPointAt(0, 0),
    focus: textPointAt(Math.min(selectionBlocks, blockCount) - 1, 0),
  };
  const unhung = Editor.unhangRange(editor, range);

  assert.ok(unhung);
});

const selectAllMs = measureLane(createEditorWithChildren, (editor) => {
  const children = getChildren(editor);
  const lastBlock = children.length - 1;

  select(editor, {
    anchor: textPointAt(0, 0),
    focus: textPointAt(lastBlock, getTextLength(editor, [lastBlock])),
  });

  assert.deepEqual(getSelection(editor)?.anchor, textPointAt(0, 0));
});

console.log(JSON.stringify({
  iterations,
  config: {
    blockCount,
    selectionBlocks,
    typeOps,
    navigationSteps,
  },
  lanes: {
    insertTextCollapsedMs,
    deleteBackwardMarkedTextMs,
    deleteExpandedRangeMs,
    insertFragmentMixedBlocksMs,
    insertNodesBatchMs,
    setNodesSelectedBlocksMs,
    moveNodesWindowMs,
    splitBlocksMs,
    removeNodesWindowMs,
    wrapUnwrapBlocksMs,
    positionsCharacterFullDocumentMs,
    nodesTextScanMs,
    beforeAfterWalkMs,
    unhangRangeMs,
    selectAllMs,
  },
}));
`;

const currentPackageManager = await parsePackageManager(currentRepo);
const legacyPackageManager = await parsePackageManager(legacyRepo);

await buildRepo(currentRepo, currentPackageManager, './packages/slate');
await buildRepo(legacyRepo, legacyPackageManager, './packages/slate');

const env = {
  RICH_TEXT_OPS_COMPARE_BLOCKS: String(blockCount),
  RICH_TEXT_OPS_COMPARE_ITERATIONS: String(iterations),
  RICH_TEXT_OPS_COMPARE_NAVIGATION_STEPS: String(navigationSteps),
  RICH_TEXT_OPS_COMPARE_SELECTION_BLOCKS: String(selectionBlocks),
  RICH_TEXT_OPS_COMPARE_TYPE_OPS: String(typeOps),
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

const deltaMeanMs = Object.fromEntries(
  Object.keys(current.lanes)
    .filter((metricName) => legacy.lanes[metricName])
    .sort()
    .map((metricName) => [
      metricName,
      round(current.lanes[metricName].mean - legacy.lanes[metricName].mean),
    ])
);

const structuralLaneNames = [
  'beforeAfterWalkMs',
  'removeNodesWindowMs',
  'moveNodesWindowMs',
  'insertFragmentMixedBlocksMs',
  'setNodesSelectedBlocksMs',
];

const getRatio = (currentValue, legacyValue) =>
  legacyValue > 0 ? round(currentValue / legacyValue) : 0;

const structuralOps = Object.fromEntries(
  structuralLaneNames.map((metricName) => {
    const currentLane = current.lanes[metricName];
    const legacyLane = legacy.lanes[metricName];

    return [
      metricName,
      {
        currentMeanMs: currentLane.mean,
        currentP95Ms: currentLane.p95,
        legacyMeanMs: legacyLane.mean,
        legacyP95Ms: legacyLane.p95,
        meanRatio: getRatio(currentLane.mean, legacyLane.mean),
        p95Ratio: getRatio(currentLane.p95, legacyLane.p95),
      },
    ];
  })
);
const worstP95Entry = Object.entries(structuralOps).reduce((worst, entry) =>
  entry[1].p95Ratio > worst[1].p95Ratio ? entry : worst
);
const worstMeanEntry = Object.entries(structuralOps).reduce((worst, entry) =>
  entry[1].meanRatio > worst[1].meanRatio ? entry : worst
);
const structuralComposite = {
  p95Ms: Math.max(
    ...Object.values(structuralOps).map((lane) => lane.currentP95Ms)
  ),
  worstMeanLane: worstMeanEntry[0],
  worstMeanRatio: worstMeanEntry[1].meanRatio,
  worstP95Lane: worstP95Entry[0],
  worstP95Ratio: worstP95Entry[1].p95Ratio,
};

const summary = {
  lane: 'core-rich-text-operations-compare-local',
  currentRepo,
  legacyRepo,
  iterations,
  config: {
    blockCount,
    navigationSteps,
    selectionBlocks,
    typeOps,
  },
  current: current.lanes,
  legacy: legacy.lanes,
  deltaMeanMs,
  structuralComposite,
  structuralOps,
};

await writeBenchmarkArtifact(
  'tmp/slate-rich-text-operations-compare-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
console.log(
  `METRIC rich_text_structural_ops_p95_ms=${round(structuralComposite.p95Ms)}`
);
console.log(
  `METRIC rich_text_structural_ops_worst_ratio=${structuralComposite.worstP95Ratio}`
);
console.log(
  `METRIC rich_text_structural_ops_worst_mean_ratio=${structuralComposite.worstMeanRatio}`
);
console.log(
  `rich-text structural worst p95 lane=${structuralComposite.worstP95Lane} worst mean lane=${structuralComposite.worstMeanLane}`
);
