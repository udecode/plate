import assert from 'node:assert/strict';

import { createEditor } from '../../../../../packages/plitejs/src/index.ts';
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

const createEditorWithChildren = () =>
  createEditor({
    initialValue: { children: createChildren(blockCount) },
    initialSelection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
      kind: 'text',
    },
  });

const createMoveEditor = () =>
  createEditor({
    initialValue: {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'x'.repeat(steps + 20) }],
        },
      ],
    },
    initialSelection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
      kind: 'text',
    },
  });

const write = (editor, fn) => {
  editor.update(fn);
};

const select = (editor, target) => {
  write(editor, (tx) => tx.selection.set(target));
};

const insertText = (editor, text, options) => {
  write(editor, (tx) => tx.text.insert(text, options));
};

const measureLane = (setup, run, verify) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    const start = performance.now();
    run(editor);
    const duration = performance.now() - start;
    verify(editor);

    if (iteration > 0) {
      samples.push(duration);
    }
  }

  return summarize(samples);
};

const insertTextMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < steps; index += 1) {
      insertText(editor, 'X');
    }
  },
  (editor) => {
    assert.equal(
      editor.read.runtime
        .snapshot()
        .children[0]?.children[0]?.text.startsWith('X'.repeat(steps)),
      true
    );
  }
);

const deleteExpandedMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < steps; index += 1) {
      const blockIndex = index % blockCount;

      write(editor, (tx) => {
        tx.selection.set({
          anchor: { path: [blockIndex, 0], offset: 0 },
          focus: { path: [blockIndex, 0], offset: 5 },
          kind: 'text',
        });

        tx.text.delete();
      });
    }
  },
  (editor) => {
    assert.equal(
      editor.read.runtime
        .snapshot()
        .children[0]?.children[0]?.text.startsWith('block'),
      false
    );
  }
);

const selectMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < steps; index += 1) {
      const blockIndex = index % blockCount;

      select(editor, {
        anchor: { path: [blockIndex, 0], offset: 0 },
        focus: { path: [blockIndex, 0], offset: 3 },
        kind: 'text',
      });
    }
  },
  (editor) => {
    assert.deepEqual(editor.read.runtime.snapshot().selection, {
      anchor: { path: [(steps - 1) % blockCount, 0], offset: 0 },
      focus: { path: [(steps - 1) % blockCount, 0], offset: 3 },
      kind: 'text',
    });
  }
);

const setSelectionMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < steps; index += 1) {
      write(editor, (tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
          kind: 'text',
        });

        tx.selection.set({
          anchor: { path: [0, 0], offset: index % 4 },
          focus: { path: [0, 0], offset: 4 + (index % 4) },
          kind: 'text',
        });
      });
    }
  },
  (editor) => {
    assert.ok(editor.read.runtime.snapshot().selection);
  }
);

const setPointMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
      kind: 'text',
    });

    for (let index = 0; index < steps; index += 1) {
      write(editor, (tx) =>
        tx.selection.setPoint(
          { offset: 1 + (index % 4) },
          { edge: index % 2 === 0 ? 'anchor' : 'focus' }
        )
      );
    }
  },
  (editor) => {
    assert.ok(editor.read.runtime.snapshot().selection);
  }
);

const moveMs = measureLane(
  createMoveEditor,
  (editor) => {
    for (let index = 0; index < steps; index += 1) {
      write(editor, (tx) => tx.selection.move({ distance: 1, unit: 'offset' }));
    }
  },
  (editor) => {
    assert.equal(
      editor.read.runtime.snapshot().selection?.anchor.offset,
      steps
    );
  }
);

const collapseMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < steps; index += 1) {
      write(editor, (tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
          kind: 'text',
        });
        tx.selection.collapse({
          edge: index % 2 === 0 ? 'start' : 'end',
        });
      });
    }
  },
  (editor) => {
    assert.equal(
      rangeIsCollapsed(editor.read.runtime.snapshot().selection),
      true
    );
  }
);

const summary = {
  lane: 'plite-text-selection',
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
