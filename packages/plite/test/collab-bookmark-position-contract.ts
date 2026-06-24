import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  bookmark as editorBookmark,
  getLastCommit as editorGetLastCommit,
  getPathByRuntimeId as editorGetPathByRuntimeId,
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

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

const listItem = (text: string): Descendant => ({
  type: 'list-item',
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

const createCollabEditor = (children: Descendant[]) => {
  const editor = createEditor({ extensions: [history()] });

  editorReplace(editor, {
    children,
    selection: null,
    marks: null,
  });

  return editor;
};

const range = (
  anchor: { path: number[]; offset: number },
  focus: { path: number[]; offset: number }
): Range => ({ anchor, focus });

const collapsed = (path: number[], offset: number): Range =>
  range({ path, offset }, { path, offset });

const replayRemote = (
  editor: ReturnType<typeof createCollabEditor>,
  operations: Operation[]
) => {
  editor.update((tx) => {
    tx.operations.replay(clone(operations));
  }, remoteCollabOptions);
};

const assertLastRemoteCommit = (
  editor: ReturnType<typeof createCollabEditor>
) => {
  const commit = editorGetLastCommit(editor);

  assert(commit);
  assert.deepEqual(commit.tags, ['collaboration', 'remote-import']);
  assert.deepEqual(commit.metadata, remoteCollabOptions.metadata);
  assert.equal(
    editor.read((state) => state.history.undos().length),
    0
  );
};

describe('collab bookmark position contract', () => {
  it('rebases collapsed bookmarks before and after remote text inserts', () => {
    const editor = createCollabEditor([paragraph('alpha')]);
    const beforeInsert = editorBookmark(editor, collapsed([0, 0], 1));
    const afterInsert = editorBookmark(editor, collapsed([0, 0], 4));

    replayRemote(editor, [
      {
        type: 'insert_text',
        path: [0, 0],
        offset: 2,
        text: '++',
      },
    ]);

    assertLastRemoteCommit(editor);
    assert.deepEqual(beforeInsert.resolve(), collapsed([0, 0], 1));
    assert.deepEqual(afterInsert.resolve(), collapsed([0, 0], 6));
    assert.deepEqual(beforeInsert.unref(), collapsed([0, 0], 1));
    assert.deepEqual(afterInsert.unref(), collapsed([0, 0], 6));
  });

  it('nulls bookmarks inside text nodes removed by remote replay', () => {
    const editor = createCollabEditor([paragraph('alpha'), paragraph('beta')]);
    const removedNode = editorGetSnapshot(editor).children[1]!;
    const removedBookmark = editorBookmark(
      editor,
      range({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    replayRemote(editor, [
      {
        type: 'remove_node',
        path: [1],
        node: removedNode,
      },
    ]);

    assertLastRemoteCommit(editor);
    assert.equal(removedBookmark.resolve(), null);
    assert.equal(removedBookmark.unref(), null);
  });

  it('rebases a bookmarked range across remote text split', () => {
    const editor = createCollabEditor([paragraph('alpha')]);
    const bookmark = editorBookmark(
      editor,
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    replayRemote(editor, [
      {
        type: 'split_node',
        path: [0, 0],
        position: 2,
        properties: {},
      },
    ]);

    const resolved = bookmark.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 2 },
    });
    assert.equal(editorString(editor, resolved!), 'lph');
    assert.deepEqual(bookmark.unref(), resolved);
  });

  it('rebases a bookmarked range across remote block merge', () => {
    const editor = createCollabEditor([paragraph('alpha'), paragraph('beta')]);
    const bookmark = editorBookmark(
      editor,
      range({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    replayRemote(editor, [
      {
        type: 'merge_node',
        path: [1],
        position: 1,
        properties: { type: 'paragraph' },
      },
    ]);

    const resolved = bookmark.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 3 },
    });
    assert.equal(editorString(editor, resolved!), 'et');
    assert.deepEqual(bookmark.unref(), resolved);
  });

  it('rebases a bookmarked range when its containing block moves remotely', () => {
    const editor = createCollabEditor([paragraph('alpha'), paragraph('beta')]);
    const movedBlockRuntimeId = editorGetRuntimeId(editor, [1]);
    const movedTextRuntimeId = editorGetRuntimeId(editor, [1, 0]);
    const bookmark = editorBookmark(
      editor,
      range({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    assert(movedBlockRuntimeId);
    assert(movedTextRuntimeId);

    replayRemote(editor, [
      {
        type: 'move_node',
        path: [1],
        newPath: [0],
      },
    ]);

    const resolved = bookmark.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(
      editorGetPathByRuntimeId(editor, movedBlockRuntimeId),
      [0]
    );
    assert.deepEqual(
      editorGetPathByRuntimeId(editor, movedTextRuntimeId),
      [0, 0]
    );
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(editorString(editor, resolved!), 'et');
    assert.deepEqual(bookmark.unref(), resolved);
  });

  it('rebases a range spanning a remote replace_children window', () => {
    const editor = createCollabEditor([
      paragraph('zero'),
      listItem('one'),
      listItem('two'),
      paragraph('three'),
    ]);
    const bookmark = editorBookmark(
      editor,
      range({ path: [0, 0], offset: 1 }, { path: [3, 0], offset: 2 })
    );

    replayRemote(editor, [
      {
        type: 'replace_children',
        path: [],
        index: 1,
        children: [listItem('one'), listItem('two')],
        newChildren: [
          {
            type: 'bulleted-list',
            children: [listItem('one-two')],
          },
        ],
        selection: null,
        newSelection: null,
      },
    ]);

    const resolved = bookmark.resolve();

    assertLastRemoteCommit(editor);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [2, 0], offset: 2 },
    });
    assert.equal(editorString(editor, resolved!), 'eroone-twoth');
    assert.deepEqual(bookmark.unref(), resolved);
  });
});
