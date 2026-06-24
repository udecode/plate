import { createEditor } from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number(process.env.DRIFT_BENCH_ITERATIONS || 5);
const blockCount = Number(process.env.DRIFT_BENCH_BLOCKS || 120);
const selectionBlocks = Number(process.env.DRIFT_BENCH_SELECTION_BLOCKS || 24);

const createParagraph = (index, text = `block-${index}`) => ({
  type: 'paragraph',
  children: [{ text }],
});

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => createParagraph(index));

const createFragment = () => [
  createParagraph(0, 'fragment-alpha'),
  createParagraph(1, 'fragment-beta'),
  createParagraph(2, 'fragment-gamma'),
];

const createEditorWithChildren = (children = createChildren(blockCount)) => {
  const editor = createEditor();

  Editor.replace(editor, {
    children,
    selection: null,
    marks: null,
  });

  return editor;
};

const write = (editor, fn) => {
  editor.update(fn);
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

const insertFragmentMs = measureLane(createEditorWithChildren, (editor) => {
  const path = [Math.floor(blockCount / 2), 0];

  write(editor, (tx) => {
    tx.selection.set({
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    });
    tx.fragment.insert(createFragment());
  });

  if (Editor.getSnapshot(editor).children.length <= blockCount) {
    throw new Error('insertFragmentMs did not insert new blocks');
  }
});

const insertNodesMs = measureLane(createEditorWithChildren, (editor) => {
  write(editor, (tx) => {
    tx.nodes.insert(createParagraph(999, 'inserted-node'), {
      at: [Math.floor(blockCount / 2)],
    });
  });

  const inserted =
    Editor.getSnapshot(editor).children[Math.floor(blockCount / 2)];

  if (
    !('children' in inserted) ||
    inserted.children[0]?.text !== 'inserted-node'
  ) {
    throw new Error('insertNodesMs did not insert at the expected path');
  }
});

const setNodesMs = measureLane(createEditorWithChildren, (editor) => {
  const focusIndex = selectionBlocks - 1;
  const selectedRange = {
    anchor: { path: [0, 0], offset: 0 },
    focus: {
      path: [focusIndex, 0],
      offset: Editor.string(editor, [focusIndex]).length,
    },
  };

  write(editor, (tx) => {
    tx.selection.set(selectedRange);
    tx.nodes.set(
      { type: 'heading-one' },
      {
        at: selectedRange,
        match: (node) =>
          Editor.isBlock(editor, node) && node.type === 'paragraph',
      }
    );
  });

  const changed = Editor.getSnapshot(editor).children.slice(0, selectionBlocks);

  if (
    !changed.every((node) => 'children' in node && node.type === 'heading-one')
  ) {
    throw new Error('setNodesMs did not rewrite the selected block range');
  }

  const next = Editor.getSnapshot(editor).children[selectionBlocks];

  if (next && (!('children' in next) || next.type !== 'paragraph')) {
    throw new Error('setNodesMs rewrote blocks outside the selected range');
  }
});

const moveNodesMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = selectionBlocks - 1; index >= 0; index -= 1) {
    write(editor, (tx) => {
      tx.nodes.move({
        at: [index],
        to: [blockCount - 1],
      });
    });
  }

  const snapshot = Editor.getSnapshot(editor);

  if (snapshot.children.length !== blockCount) {
    throw new Error('moveNodesMs changed the block count');
  }
});

const splitNodesMs = measureLane(
  () => createEditorWithChildren(createChildren(selectionBlocks)),
  (editor) => {
    for (let index = selectionBlocks - 1; index >= 0; index -= 1) {
      write(editor, (tx) => {
        tx.nodes.split({
          at: { path: [index, 0], offset: 3 },
        });
      });
    }

    if (Editor.getSnapshot(editor).children.length !== selectionBlocks * 2) {
      throw new Error('splitNodesMs did not split every selected block');
    }
  }
);

const mergeNodesMs = measureLane(
  () => createEditorWithChildren(createChildren(selectionBlocks * 2)),
  (editor) => {
    for (let index = selectionBlocks * 2 - 1; index >= 1; index -= 2) {
      write(editor, (tx) => {
        tx.nodes.merge({ at: [index] });
      });
    }

    if (Editor.getSnapshot(editor).children.length !== selectionBlocks) {
      throw new Error('mergeNodesMs did not merge the expected blocks');
    }
  }
);

const removeNodesMs = measureLane(createEditorWithChildren, (editor) => {
  for (let index = selectionBlocks - 1; index >= 0; index -= 1) {
    write(editor, (tx) => {
      tx.nodes.remove({ at: [index] });
    });
  }

  if (
    Editor.getSnapshot(editor).children.length !==
    blockCount - selectionBlocks
  ) {
    throw new Error('removeNodesMs did not remove the expected blocks');
  }
});

const wrapNodesMs = measureLane(createEditorWithChildren, (editor) => {
  write(editor, (tx) => {
    tx.nodes.wrap(
      { type: 'quote', children: [] },
      {
        at: [],
        match: (node) =>
          Editor.isBlock(editor, node) && node.type === 'paragraph',
        mode: 'lowest',
      }
    );
  });

  const first = Editor.getSnapshot(editor).children[0];

  if (!('children' in first) || first.type !== 'quote') {
    throw new Error('wrapNodesMs did not wrap the target blocks');
  }
});

const unwrapNodesMs = measureLane(
  () => {
    const editor = createEditorWithChildren();

    write(editor, (tx) => {
      tx.nodes.wrap(
        { type: 'quote', children: [] },
        {
          at: [],
          match: (node) =>
            Editor.isBlock(editor, node) && node.type === 'paragraph',
          mode: 'lowest',
        }
      );
    });

    return editor;
  },
  (editor) => {
    write(editor, (tx) => {
      tx.nodes.unwrap({
        at: [],
        match: (node) => Editor.isBlock(editor, node) && node.type === 'quote',
        mode: 'all',
      });
    });

    const first = Editor.getSnapshot(editor).children[0];

    if (!('children' in first) || first.type !== 'paragraph') {
      throw new Error('unwrapNodesMs did not restore paragraph blocks');
    }
  }
);

const liftNodesMs = measureLane(
  () => {
    const editor = createEditorWithChildren([
      {
        type: 'quote',
        children: Array.from({ length: selectionBlocks }, (_, index) =>
          createParagraph(index, `nested-${index}`)
        ),
      },
    ]);

    return editor;
  },
  (editor) => {
    for (let index = selectionBlocks - 1; index >= 0; index -= 1) {
      write(editor, (tx) => {
        tx.nodes.lift({
          at: [0, index],
        });
      });
    }

    const snapshot = Editor.getSnapshot(editor);
    const topLevelParagraphs = snapshot.children.filter(
      (node) => 'children' in node && node.type === 'paragraph'
    );

    if (topLevelParagraphs.length !== selectionBlocks) {
      throw new Error('liftNodesMs did not lift the nested blocks');
    }
  }
);

const summary = {
  lane: 'drift-node-transforms',
  iterations,
  config: {
    blockCount,
    selectionBlocks,
  },
  lanes: {
    insertFragmentMs,
    insertNodesMs,
    setNodesMs,
    moveNodesMs,
    splitNodesMs,
    mergeNodesMs,
    removeNodesMs,
    wrapNodesMs,
    unwrapNodesMs,
    liftNodesMs,
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-node-transform-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
