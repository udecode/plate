import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createEditor } from '../../../../../packages/plitejs/src/index.ts';
import { DocumentIndex } from '../../../../../packages/plitejs/src/core/change/document-index.ts';
import { RootChange, splitNodeChange } from '../../../../../packages/plitejs/src/core/change/root-change.ts';
import { getSnapshotIndexMappingStats } from '../../../../../packages/plitejs/src/core/snapshot-index.ts';
import * as Editor from '../../../../../packages/plitejs/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number(process.env.PLITE_NODE_TRANSFORMS_ITERATIONS || 5);
const blockCount = Number(process.env.PLITE_NODE_TRANSFORMS_BLOCKS || 120);
const selectionBlocks = Number(
  process.env.PLITE_NODE_TRANSFORMS_SELECTION_BLOCKS || 24
);
const measuredFiles = [
  'packages/plitejs/src/core/public-state.ts',
  'packages/plitejs/src/core/snapshot-index.ts',
  'packages/plitejs/src/core/commit.ts',
  'packages/plitejs/src/core/change/root-change.ts',
  'packages/plitejs/src/core/change/document-index.ts',
  'packages/plitejs/src/interfaces/node.ts',
  'benchmarks/slate-v2/donor/core/current/node-transforms.mjs',
];
const fingerprint = () => Object.fromEntries(measuredFiles.map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
const sourceBefore = fingerprint();

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

const replaceFragmentMs = measureLane(createEditorWithChildren, (editor) => {
  const path = [Math.floor(blockCount / 2), 0];

  write(editor, (tx) => {
    tx.selection.set({
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
      kind: 'text',
    });
    tx.fragment.replace(createFragment());
  });

  if (Editor.getSnapshot(editor).children.length <= blockCount) {
    throw new Error('replaceFragmentMs did not insert new blocks');
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
    kind: 'text',
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

const replacementLocality = [100, 1000, 10_000].map((count) => {
  const durations = [];
  let materializedIndexes = 0;
  for (let sample = 0; sample < 21; sample++) {
    const editor = createEditorWithChildren(createChildren(count));
    const original = Editor.getSnapshot(editor);
    const replaced = original.index.keyAt([count - 1]);
    const surviving = original.index.keyAt([1]);
    assert.ok(replaced && surviving);
    editor.update.nodes.remove({ at: [0] });
    const before = Editor.getSnapshot(editor);
    const lazy = getSnapshotIndexMappingStats(before.index);
    assert.ok(lazy.segments > 0);
    const start = performance.now();
    editor.update.nodes.replace(createParagraph(sample, 'replacement'), { at: [count - 2] });
    const duration = performance.now() - start;
    if (getSnapshotIndexMappingStats(before.index).segments !== lazy.segments) materializedIndexes++;
    const after = Editor.getSnapshot(editor);
    assert.equal(after.index.keyAt([0]), surviving);
    assert.notEqual(after.index.keyAt([count - 2]), replaced);
    assert.equal(after.index.pathOf(replaced), null);
    assert.deepEqual(before.index.pathOf(replaced), [count - 2]);
    if (sample > 0) durations.push(duration);
  }
  const durationMs = summarize(durations);
  return { count, durationMs, materializedIndexes, pass: materializedIndexes === 0 && durationMs.p95 <= 100 };
});
const splitLocality = [100, 1000, 10_000].flatMap((count) =>
  ['text', 'element'].map((kind) => {
    const document = DocumentIndex.fromValue(createChildren(count));
    const at = Math.floor(count / 2);
    const path = kind === 'text' ? [at, 0] : [at];
    const position = kind === 'text' ? 3 : 1;
    const props = kind === 'text' ? { bold: true } : { type: 'quote' };
    const tokens = Object.getOwnPropertyDescriptor(DocumentIndex.prototype, 'tokens');
    let fullTokenReads = 0;
    Object.defineProperty(document, 'tokens', {
      configurable: true,
      get() {
        fullTokenReads++;
        return tokens.get.call(document);
      },
    });
    try {
      splitNodeChange(document, path, position, props);
    } finally {
      Reflect.deleteProperty(document, 'tokens');
    }
    const durations = [];
    let change;
    for (let sample = 0; sample < 21; sample++) {
      const start = performance.now();
      change = splitNodeChange(document, path, position, props);
      const duration = performance.now() - start;
      if (sample > 0) durations.push(duration);
    }
    const after = change.apply(document);
    assert.deepEqual(RootChange.fromJSON(change.toJSON()).apply(document).value, after.value);
    assert.deepEqual(change.invert(document).apply(after).value, document.value);
    assert.equal(after.node([0]), document.node([0]));
    if (kind === 'text') {
      assert.deepEqual(after.node([at]), {
        type: 'paragraph', children: [{ text: 'blo' }, { bold: true, text: `ck-${at}` }],
      });
    } else {
      assert.deepEqual(after.node([at + 1]), { type: 'quote', children: [] });
    }
    const durationMs = summarize(durations);
    return { count, kind, fullTokenReads, durationMs, pass: fullTokenReads === 0 && durationMs.p95 <= 16.67 };
  })
);
const replacementLocalityFailures = replacementLocality.filter((row) => !row.pass).length;
const splitLocalityFailures = splitLocality.filter((row) => !row.pass).length;
const localityFailures = replacementLocalityFailures + splitLocalityFailures;
const sourceAfter = fingerprint();
assert.deepEqual(sourceAfter, sourceBefore, 'Measured source changed during the benchmark');
const summary = {
  lane: 'plite-node-transforms',
  iterations,
  replacementLocality,
  splitLocality,
  sourceIdentity: { measuredInputs: sourceAfter },
  config: {
    blockCount,
    selectionBlocks,
  },
  lanes: {
    replaceFragmentMs,
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

console.log(`METRIC plite_node_replacement_locality_failures=${replacementLocalityFailures}`);
console.log(`METRIC plite_node_replacement_worst_p95_ms=${Math.max(...replacementLocality.map((row) => row.durationMs.p95))}`);
console.log(`METRIC plite_node_split_locality_failures=${splitLocalityFailures}`);
console.log(`METRIC plite_node_split_worst_p95_ms=${Math.max(...splitLocality.map((row) => row.durationMs.p95))}`);
console.log(`METRIC plite_node_split_full_token_reads=${Math.max(...splitLocality.map((row) => row.fullTokenReads))}`);
if (process.env.PLITE_NODE_TRANSFORMS_STRICT === '1' && localityFailures > 0) {
  throw new Error(`Node transforms missed ${localityFailures} locality guards`);
}
