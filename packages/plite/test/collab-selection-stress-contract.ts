import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  DocumentChange,
  type Element,
  type EditorTransactionSpecBuilder,
  type EditorUpdatePolicy,
  type TextSelection,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';
import {
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const remoteCollabTags = [
  'collaboration',
  'remote-import',
  'history-skip',
  'skip-dom-selection',
  'skip-selection-focus',
  'skip-scroll-into-view',
] as const;

const remoteCollabPolicy = {
  tags: remoteCollabTags,
} satisfies EditorUpdatePolicy;

const createCollabEditor = ({
  children = [paragraph('one')],
  selection,
}: {
  children?: Element[];
  selection: TextSelection;
}) => {
  const editor = createEditor({ extensions: [history()] as const });

  editorReplace(editor, {
    children,
    selection,
  });

  return editor;
};

const collapsed = (path: number[], offset: number): TextSelection => ({
  anchor: { path, offset },
  focus: { path, offset },
  kind: 'text',
});

const importRemote = (
  editor: ReturnType<typeof createCollabEditor>,
  build: (tx: EditorTransactionSpecBuilder) => void
) => {
  const spec = editor.read((state) => state.transaction(build));

  assert.ok(spec);
  const change = DocumentChange.fromJSON(clone(spec.changes.toJSON()));

  editor.update(remoteCollabPolicy, (tx) => {
    tx.changes.apply(change);
  });
};

const insertLocal = (
  editor: ReturnType<typeof createCollabEditor>,
  text: string
) => {
  editor.update({ tags: ['local-edit', 'history'] }, (tx) => {
    tx.text.insert(text);
  });
};

const assertSelectionValidOrNull = (
  editor: ReturnType<typeof createCollabEditor>
) => {
  const { selection } = editorGetSnapshot(editor);

  if (!selection) {
    return;
  }

  assert.doesNotThrow(() => {
    editorString(editor, selection);
  });
};

const assertLastRemoteCommit = (
  editor: ReturnType<typeof createCollabEditor>
) => {
  const commit = editorGetLastCommit(editor);

  assert.ok(commit);
  assert.deepEqual(commit.tags, remoteCollabTags);
};

describe('collab remote selection stress contract', () => {
  it('keeps a collapsed local selection valid through high-QPS remote prefix inserts', () => {
    const editor = createCollabEditor({ selection: collapsed([0, 0], 3) });
    importRemote(editor, (tx) => {
      for (let index = 0; index < 50; index++) {
        tx.text.insert(String(index % 10), {
          at: { path: [0, 0], offset: 0 },
        });
      }
    });

    assertSelectionValidOrNull(editor);
    assert.deepEqual(
      editorGetSnapshot(editor).selection,
      collapsed([0, 0], 53)
    );
    assertLastRemoteCommit(editor);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    insertLocal(editor, '!');

    assert.equal(editorString(editor, [0]).endsWith('one!'), true);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
  });

  it('keeps same-offset remote contention deterministic for follow-up local typing', () => {
    const editor = createCollabEditor({ selection: collapsed([0, 0], 1) });

    importRemote(editor, (tx) => {
      tx.text.insert('A', { at: { path: [0, 0], offset: 1 } });
      tx.text.insert('B', { at: { path: [0, 0], offset: 1 } });
      tx.text.insert('C', { at: { path: [0, 0], offset: 1 } });
    });

    assertSelectionValidOrNull(editor);
    assertLastRemoteCommit(editor);

    const selectionAfterRemote = editorGetSnapshot(editor).selection;

    assert.ok(selectionAfterRemote);
    insertLocal(editor, '!');

    const localCommit = editorGetLastCommit(editor);

    assert.ok(localCommit);
    assert.deepEqual(localCommit.selectionBefore, selectionAfterRemote);
    assert.equal(editorString(editor, [0]), 'oCBA!ne');
  });

  it('does not move a collapsed selection for remote suffix inserts after the local point', () => {
    const editor = createCollabEditor({ selection: collapsed([0, 0], 1) });

    importRemote(editor, (tx) => {
      tx.text.insert('XYZ', { at: { path: [0, 0], offset: 3 } });
    });

    assertSelectionValidOrNull(editor);
    assert.deepEqual(editorGetSnapshot(editor).selection, collapsed([0, 0], 1));

    insertLocal(editor, '!');

    assert.equal(editorString(editor, [0]), 'o!neXYZ');
  });

  it('rebases local typing through remote split and merge changes around the local point', () => {
    const editor = createCollabEditor({
      children: [paragraph('abcd')],
      selection: collapsed([0, 0], 2),
    });

    importRemote(editor, (tx) => {
      tx.nodes.split({ at: { path: [0, 0], offset: 1 } });
      tx.nodes.merge({ at: [1] });
    });

    assertSelectionValidOrNull(editor);
    assert.deepEqual(editorGetSnapshot(editor).selection, collapsed([0, 0], 2));

    insertLocal(editor, '!');

    assert.equal(editorString(editor, [0]), 'ab!cd');
  });

  it('resolves selection instead of leaving stale paths when remote remove deletes the selected node', () => {
    const editor = createCollabEditor({
      children: [paragraph('one'), paragraph('two')],
      selection: collapsed([1, 0], 1),
    });
    importRemote(editor, (tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.deepEqual(editorGetSnapshot(editor).selection, collapsed([0, 0], 3));
    assertLastRemoteCommit(editor);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    editor.update((tx) => {
      tx.text.insert('!');
    });

    assert.equal(editorString(editor, [0]), 'one!');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
  });
});
