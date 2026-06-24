import assert from 'node:assert/strict';

import { createEditor } from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

function rangeIsCollapsed(selection) {
  return (
    selection != null &&
    selection.anchor.offset === selection.focus.offset &&
    selection.anchor.path.join('.') === selection.focus.path.join('.')
  );
}

const iterations = Number(process.env.TEXT_SELECTION_BENCH_ITERATIONS || 5);
const blockCount = Number(process.env.TEXT_SELECTION_BENCH_BLOCKS || 120);
const steps = Number(process.env.TEXT_SELECTION_BENCH_STEPS || 40);

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `block-${index}-content` }],
  }));

const createEditorWithChildren = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(blockCount),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  return editor;
};

const createMoveEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'x'.repeat(steps + 20) }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  return editor;
};

const write = (editor, fn) => {
  editor.update(fn);
};

const select = (editor, target) => {
  write(editor, (tx) => tx.selection.set(target));
};

const insertText = (editor, text, options) => {
  write(editor, (tx) => tx.text.insert(text, options));
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

const insertTextMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    insertText(editor, 'X');
  }

  assert.equal(
    Editor.getSnapshot(editor).children[0]?.children[0]?.text.startsWith(
      'X'.repeat(steps)
    ),
    true
  );
});

const deleteExpandedMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    const blockIndex = index % blockCount;

    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [blockIndex, 0], offset: 0 },
        focus: { path: [blockIndex, 0], offset: 5 },
      });

      tx.text.delete();
    });
  }

  assert.equal(
    Editor.getSnapshot(editor).children[0]?.children[0]?.text.startsWith(
      'block'
    ),
    false
  );
});

const selectMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    const blockIndex = index % blockCount;

    select(editor, {
      anchor: { path: [blockIndex, 0], offset: 0 },
      focus: { path: [blockIndex, 0], offset: 3 },
    });
  }

  assert.deepEqual(Editor.getSnapshot(editor).selection, {
    anchor: { path: [(steps - 1) % blockCount, 0], offset: 0 },
    focus: { path: [(steps - 1) % blockCount, 0], offset: 3 },
  });
});

const setSelectionMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });

      tx.selection.setRange({
        anchor: { path: [0, 0], offset: index % 4 },
        focus: { path: [0, 0], offset: 4 + (index % 4) },
      });
    });
  }

  assert.ok(Editor.getSnapshot(editor).selection);
});

const setPointMs = measureLane(createEditorWithChildren, (editor) => {
  select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 4 },
  });

  for (let index = 0; index < steps; index += 1) {
    write(editor, (tx) =>
      tx.selection.setPoint(
        { offset: 1 + (index % 4) },
        { edge: index % 2 === 0 ? 'anchor' : 'focus' }
      )
    );
  }

  assert.ok(Editor.getSnapshot(editor).selection);
});

const moveMs = measureLane(createMoveEditor, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    write(editor, (tx) => tx.selection.move({ distance: 1, unit: 'offset' }));
  }

  assert.equal(Editor.getSnapshot(editor).selection?.anchor.offset, steps);
});

const collapseMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
      tx.selection.collapse({
        edge: index % 2 === 0 ? 'start' : 'end',
      });
    });
  }

  assert.equal(rangeIsCollapsed(Editor.getSnapshot(editor).selection), true);
});

const summary = {
  lane: 'slate-text-selection',
  iterations,
  config: {
    blockCount,
    steps,
  },
  lanes: {
    insertTextMs,
    deleteExpandedMs,
    selectMs,
    setSelectionMs,
    setPointMs,
    moveMs,
    collapseMs,
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-text-selection-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
