import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getLastCommit as editorGetLastCommit,
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import {
  createEditor,
  DocumentChange,
  type Element,
  type EditorTransactionSpecBuilder,
  type EditorUpdatePolicy,
  type Range,
} from '@platejs/plite';
import { createRangeAnchor } from './support/anchor';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const listItem = (text: string): Element => ({
  type: 'list-item',
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

const createCollabEditor = (children: Element[]) => {
  const editor = createEditor({ extensions: [history()] as const });

  editorReplace(editor, {
    children,
    selection: null,
  });

  return editor;
};

const range = (
  anchor: { path: number[]; offset: number },
  focus: { path: number[]; offset: number }
): Range => ({ anchor, focus });

const collapsed = (path: number[], offset: number): Range =>
  range({ path, offset }, { path, offset });

const importRemote = (
  editor: ReturnType<typeof createCollabEditor>,
  build: (tx: EditorTransactionSpecBuilder) => void
) => {
  const spec = editor.read((state) => state.transaction(build));

  assert(spec);
  const change = DocumentChange.fromJSON(clone(spec.changes.toJSON()));

  editor.update(remoteCollabPolicy, (tx) => {
    tx.changes.apply(change);
  });
};

const assertLastRemoteCommit = (
  editor: ReturnType<typeof createCollabEditor>
) => {
  const commit = editorGetLastCommit(editor);

  assert(commit);
  assert.deepEqual(commit.tags, remoteCollabTags);
  assert.equal(
    editor.read((state) => state.history.undos().length),
    0
  );
};

describe('collab anchor position contract', () => {
  it('rebases collapsed anchors before and after remote text inserts', () => {
    const editor = createCollabEditor([paragraph('alpha')]);
    const beforeInsert = createRangeAnchor(editor, collapsed([0, 0], 1));
    const afterInsert = createRangeAnchor(editor, collapsed([0, 0], 4));

    importRemote(editor, (tx) => {
      tx.text.insert('++', { at: { path: [0, 0], offset: 2 } });
    });

    assertLastRemoteCommit(editor);
    assert.deepEqual(beforeInsert.resolve(), collapsed([0, 0], 1));
    assert.deepEqual(afterInsert.resolve(), collapsed([0, 0], 6));
    assert.deepEqual(beforeInsert.release(), collapsed([0, 0], 1));
    assert.deepEqual(afterInsert.release(), collapsed([0, 0], 6));
  });

  it('nulls anchors inside text nodes removed by a remote change', () => {
    const editor = createCollabEditor([paragraph('alpha'), paragraph('beta')]);
    const removedAnchor = createRangeAnchor(
      editor,
      range({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    importRemote(editor, (tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assertLastRemoteCommit(editor);
    assert.equal(removedAnchor.resolve(), null);
    assert.equal(removedAnchor.release(), null);
  });

  it('rebases an anchored range across a remote text split', () => {
    const editor = createCollabEditor([paragraph('alpha')]);
    const anchor = createRangeAnchor(
      editor,
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    importRemote(editor, (tx) => {
      tx.nodes.split({ at: { path: [0, 0], offset: 2 } });
    });

    const resolved = anchor.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
    assert.equal(editorString(editor, resolved!), 'lph');
    assert.deepEqual(anchor.release(), resolved);
  });

  it('rebases an anchored range across a remote block merge', () => {
    const editor = createCollabEditor([paragraph('alpha'), paragraph('beta')]);
    const anchor = createRangeAnchor(
      editor,
      range({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    importRemote(editor, (tx) => {
      tx.nodes.merge({ at: [1] });
    });

    const resolved = anchor.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 8 },
    });
    assert.equal(editorString(editor, resolved!), 'et');
    assert.deepEqual(anchor.release(), resolved);
  });

  it('rebases an anchored range when its containing block moves remotely', () => {
    const editor = createCollabEditor([paragraph('alpha'), paragraph('beta')]);
    const movedBlockNodeKey = editorGetNodeKey(editor, [1]);
    const movedTextNodeKey = editorGetNodeKey(editor, [1, 0]);
    const anchor = createRangeAnchor(
      editor,
      range({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    assert(movedBlockNodeKey);
    assert(movedTextNodeKey);

    importRemote(editor, (tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    const resolved = anchor.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(editorGetPathByNodeKey(editor, movedBlockNodeKey), [0]);
    assert.deepEqual(editorGetPathByNodeKey(editor, movedTextNodeKey), [0, 0]);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(editorString(editor, resolved!), 'et');
    assert.deepEqual(anchor.release(), resolved);
  });

  it('rebases a range spanning a remote replace_children window', () => {
    const editor = createCollabEditor([
      paragraph('zero'),
      listItem('one'),
      listItem('two'),
      paragraph('three'),
    ]);
    const anchor = createRangeAnchor(
      editor,
      range({ path: [0, 0], offset: 1 }, { path: [3, 0], offset: 2 })
    );

    importRemote(editor, (tx) => {
      tx.nodes.replaceChildren(
        [
          {
            type: 'bulleted-list',
            children: [listItem('one-two')],
          },
        ],
        { at: [], count: 2, index: 1 }
      );
    });

    const resolved = anchor.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [2, 0], offset: 2 },
    });
    assert.equal(editorString(editor, resolved!), 'eroone-twoth');
    assert.deepEqual(anchor.release(), resolved);
  });
});
