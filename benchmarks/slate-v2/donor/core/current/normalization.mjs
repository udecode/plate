import assert from 'node:assert/strict';

import { createEditor } from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number(process.env.NORMALIZATION_BENCH_ITERATIONS || 3);
const explicitBlocks = Number(
  process.env.NORMALIZATION_BENCH_EXPLICIT_BLOCKS || 250
);
const observedBlocks = Number(
  process.env.NORMALIZATION_BENCH_OBSERVED_BLOCKS || 500
);
const observedOps = Number(process.env.NORMALIZATION_BENCH_OBSERVED_OPS || 50);

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

const createObservedChildren = (blocks) =>
  Array.from({ length: blocks }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `block-${index}` }],
  }));

const insertText = (editor, text, options) => {
  editor.update((tx) => {
    tx.text.insert(text, options);
  });
};

const normalizeEditor = (editor) => {
  editor.update(() => {
    Editor.normalize(editor);
  });
};

const measureLane = (setup, run) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    const start = performance.now();
    run(editor);
    const duration = performance.now() - start;

    if (iteration > 0) {
      samples.push(duration);
    }
  }

  return summarize(samples);
};

const explicitAdjacentTextNormalizeMs = measureLane(
  () => {
    const editor = createEditor();
    Editor.replace(editor, {
      children: createAdjacentTextChildren(explicitBlocks),
      selection: null,
      marks: null,
    });
    return editor;
  },
  (editor) => {
    normalizeEditor(editor);
    const firstBlock = Editor.getSnapshot(editor).children[0];
    assert.deepEqual(firstBlock?.children, [{ text: 'alphabeta', bold: true }]);
  }
);

const explicitInlineFlattenNormalizeMs = measureLane(
  () => {
    const editor = createEditor();
    editor.extend({
      name: 'normalization-benchmark-inline',
      elements: [{ type: 'inline', inline: true }],
    });
    Editor.replace(editor, {
      children: createInlineFlattenChildren(explicitBlocks),
      selection: null,
      marks: null,
    });
    return editor;
  },
  (editor) => {
    normalizeEditor(editor);
    const firstInline = Editor.getSnapshot(editor).children[0]?.children[1];
    assert.deepEqual(firstInline?.children, [{ text: 'onetwothreefour' }]);
  }
);

const observedInsertTextReadAfterEachMs = measureLane(
  () => {
    const editor = createEditor();
    Editor.replace(editor, {
      children: createObservedChildren(observedBlocks),
      selection: null,
      marks: null,
    });
    return editor;
  },
  (editor) => {
    for (let index = 0; index < observedOps; index += 1) {
      insertText(editor, 'X', {
        at: { path: [index % observedBlocks, 0], offset: 0 },
      });

      void Editor.getChildren(editor).length;
    }

    const firstText = Editor.getSnapshot(editor).children[0]?.children[0]?.text;
    assert.equal(firstText?.startsWith('X'), true);
  }
);

const summary = {
  lane: 'normalization-local',
  iterations,
  config: {
    explicitBlocks,
    observedBlocks,
    observedOps,
  },
  current: {
    explicitAdjacentTextNormalizeMs,
    explicitInlineFlattenNormalizeMs,
    observedInsertTextReadAfterEachMs,
  },
};

await writeBenchmarkArtifact('tmp/slate-normalization-benchmark.json', summary);

console.log(JSON.stringify(summary, null, 2));
