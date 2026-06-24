import assert from 'node:assert/strict';

import { createEditor } from '../../../../../packages/slate/src/index.ts';
import {
  Editor,
  setEditorChildren,
} from '../../../../../packages/slate/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number(process.env.EDITOR_STORE_BENCH_ITERATIONS || 5);
const blockCount = Number(process.env.EDITOR_STORE_BENCH_BLOCKS || 120);
const steps = Number(process.env.EDITOR_STORE_BENCH_STEPS || 30);

const createChildren = (count, prefix = 'block') =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `${prefix}-${index}` }],
  }));

const createSnapshotInput = (prefix) => ({
  children: createChildren(blockCount, prefix),
  selection: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
  marks: null,
});

const createEditorWithChildren = () => {
  const editor = createEditor();
  Editor.replace(editor, createSnapshotInput('initial'));
  return editor;
};

const insertText = (editor, text, options) => {
  editor.update((tx) => {
    tx.text.insert(text, options);
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

const replaceMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    Editor.replace(editor, createSnapshotInput(`replace-${index}`));
  }

  assert.equal(
    Editor.getSnapshot(editor).children[0]?.children[0]?.text,
    `replace-${steps - 1}-0`
  );
});

const resetMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = 0; index < steps; index += 1) {
    Editor.reset(editor, createSnapshotInput(`reset-${index}`));
  }

  assert.equal(
    Editor.getSnapshot(editor).children[0]?.children[0]?.text,
    `reset-${steps - 1}-0`
  );
});

const setChildrenAndGetChildrenMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < steps; index += 1) {
      setEditorChildren(
        editor,
        createChildren(blockCount, `children-${index}`)
      );
      const children = Editor.getSnapshot(editor).children;

      if (children.length !== blockCount) {
        throw new Error('setChildrenAndGetChildrenMs lost children');
      }
    }

    assert.equal(
      Editor.getSnapshot(editor).children[0]?.children[0]?.text,
      `children-${steps - 1}-0`
    );
  }
);

const getSnapshotAfterEachWriteMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    const baseVersion = Editor.getSnapshot(editor).version;

    for (let index = 0; index < steps; index += 1) {
      insertText(editor, 'X', {
        at: { path: [index % blockCount, 0], offset: 0 },
      });
      const snapshot = Editor.getSnapshot(editor);

      if (snapshot.version !== baseVersion + index + 1) {
        throw new Error('getSnapshotAfterEachWriteMs saw the wrong version');
      }
    }

    assert.equal(Editor.getSnapshot(editor).version, baseVersion + steps);
  }
);

const subscribeDispatchMs = measureLane(createEditorWithChildren, (editor) => {
  let notifications = 0;
  const unsubscribe = Editor.subscribe(editor, () => {
    notifications += 1;
  });

  for (let index = 0; index < steps; index += 1) {
    editor.update((tx) => {
      tx.text.insert('X', {
        at: { path: [index % blockCount, 0], offset: 0 },
      });
    });
  }

  unsubscribe();

  assert.equal(notifications, steps);
});

const summary = {
  lane: 'slate-editor-store',
  iterations,
  config: {
    blockCount,
    steps,
  },
  lanes: {
    replaceMs,
    resetMs,
    setChildrenAndGetChildrenMs,
    getSnapshotAfterEachWriteMs,
    subscribeDispatchMs,
  },
};

await writeBenchmarkArtifact('tmp/slate-editor-store-benchmark.json', summary);

console.log(JSON.stringify(summary, null, 2));
