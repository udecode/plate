import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import {
  createEditor,
  type Descendant,
  type EditorUpdateOptions,
  type Operation,
  type Range,
} from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const remoteCollabOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'remote-import'],
} satisfies EditorUpdateOptions;

const createCollabEditor = ({
  children = [paragraph('one')],
  selection,
}: {
  children?: Descendant[];
  selection: Range;
}) => {
  const editor = createEditor({ extensions: [history()] });

  Editor.replace(editor, {
    children,
    selection,
    marks: null,
  });

  return editor;
};

const collapsed = (path: number[], offset: number): Range => ({
  anchor: { path, offset },
  focus: { path, offset },
});

const replayRemote = (
  editor: ReturnType<typeof createCollabEditor>,
  operations: Operation[]
) => {
  editor.update((tx) => {
    tx.operations.replay(clone(operations));
  }, remoteCollabOptions);
};

const insertLocal = (
  editor: ReturnType<typeof createCollabEditor>,
  text: string
) => {
  editor.update(
    (tx) => {
      tx.text.insert(text);
    },
    { tag: ['local-edit', 'history'] }
  );
};

const assertSelectionValidOrNull = (
  editor: ReturnType<typeof createCollabEditor>
) => {
  const { selection } = Editor.getSnapshot(editor);

  if (!selection) {
    return;
  }

  assert.doesNotThrow(() => {
    Editor.string(editor, selection);
  });
};

const assertLastRemoteCommit = (
  editor: ReturnType<typeof createCollabEditor>
) => {
  const commit = Editor.getLastCommit(editor);

  assert(commit);
  assert.deepEqual(commit.tags, ['collaboration', 'remote-import']);
  assert.deepEqual(commit.metadata, remoteCollabOptions.metadata);
};

describe('collab remote selection stress contract', () => {
  it('keeps a collapsed local selection valid through high-QPS remote prefix inserts', () => {
    const editor = createCollabEditor({ selection: collapsed([0, 0], 3) });
    const remoteOperations = Array.from({ length: 50 }, (_, index) => ({
      type: 'insert_text' as const,
      path: [0, 0],
      offset: 0,
      text: String(index % 10),
    }));

    replayRemote(editor, remoteOperations);

    assertSelectionValidOrNull(editor);
    assert.deepEqual(
      Editor.getSnapshot(editor).selection,
      collapsed([0, 0], 53)
    );
    assertLastRemoteCommit(editor);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    insertLocal(editor, '!');

    assert.equal(Editor.string(editor, [0]).endsWith('one!'), true);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
  });

  it('keeps same-offset remote contention deterministic for follow-up local typing', () => {
    const editor = createCollabEditor({ selection: collapsed([0, 0], 1) });

    replayRemote(editor, [
      { type: 'insert_text', path: [0, 0], offset: 1, text: 'A' },
      { type: 'insert_text', path: [0, 0], offset: 1, text: 'B' },
      { type: 'insert_text', path: [0, 0], offset: 1, text: 'C' },
    ]);

    assertSelectionValidOrNull(editor);
    assertLastRemoteCommit(editor);

    const selectionAfterRemote = Editor.getSnapshot(editor).selection;

    assert(selectionAfterRemote);
    insertLocal(editor, '!');

    const localCommit = Editor.getLastCommit(editor);

    assert(localCommit);
    assert.deepEqual(localCommit.selectionBefore, selectionAfterRemote);
    assert.equal(Editor.string(editor, [0]), 'oCBA!ne');
  });

  it('does not move a collapsed selection for remote suffix inserts after the local point', () => {
    const editor = createCollabEditor({ selection: collapsed([0, 0], 1) });

    replayRemote(editor, [
      { type: 'insert_text', path: [0, 0], offset: 3, text: 'XYZ' },
    ]);

    assertSelectionValidOrNull(editor);
    assert.deepEqual(
      Editor.getSnapshot(editor).selection,
      collapsed([0, 0], 1)
    );

    insertLocal(editor, '!');

    assert.equal(Editor.string(editor, [0]), 'o!neXYZ');
  });

  it('rebases local typing through remote split and merge operations around the local point', () => {
    const editor = createCollabEditor({
      children: [paragraph('abcd')],
      selection: collapsed([0, 0], 2),
    });

    replayRemote(editor, [
      { type: 'split_node', path: [0, 0], position: 1, properties: {} },
      { type: 'merge_node', path: [0, 1], position: 1, properties: {} },
    ]);

    assertSelectionValidOrNull(editor);
    assert.deepEqual(
      Editor.getSnapshot(editor).selection,
      collapsed([0, 0], 2)
    );

    insertLocal(editor, '!');

    assert.equal(Editor.string(editor, [0]), 'ab!cd');
  });

  it('resolves selection instead of leaving stale paths when remote remove deletes the selected node', () => {
    const editor = createCollabEditor({
      children: [paragraph('one'), paragraph('two')],
      selection: collapsed([1, 0], 1),
    });
    const removedNode = Editor.getSnapshot(editor).children[1]!;

    replayRemote(editor, [
      {
        type: 'remove_node',
        path: [1],
        node: removedNode,
      },
    ]);

    assert.deepEqual(
      Editor.getSnapshot(editor).selection,
      collapsed([0, 0], 3)
    );
    assertLastRemoteCommit(editor);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    editor.update((tx) => {
      tx.text.insert('!');
    });

    assert.equal(Editor.string(editor, [0]), 'one!');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
  });
});
