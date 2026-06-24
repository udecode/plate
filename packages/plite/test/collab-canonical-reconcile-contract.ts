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
  subscribe as editorSubscribe,
} from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import {
  createEditor,
  type Descendant,
  type EditorUpdateOptions,
  type Range,
} from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const remoteCollabOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'remote-canonical-reconcile'],
} satisfies EditorUpdateOptions;

const createCollabEditor = () => {
  const editor = createEditor({ extensions: [history()] });

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two')],
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
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

describe('collab canonical remote reconcile contract', () => {
  it('publishes one remote replace commit, skips history, and preserves same-position bookmarks', () => {
    const editor = createCollabEditor();
    const commits: NonNullable<ReturnType<typeof editorGetLastCommit>>[] = [];
    const unsubscribe = editorSubscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });
    const oldBlockRuntimeId = editorGetRuntimeId(editor, [0]);
    const oldTextRuntimeId = editorGetRuntimeId(editor, [0, 0]);
    const bookmark = editorBookmark(
      editor,
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 3 })
    );

    assert(oldBlockRuntimeId);
    assert(oldTextRuntimeId);
    commits.length = 0;

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('remote'), paragraph('canonical')],
        marks: null,
        selection: collapsed([1, 0], 'canonical'.length),
      });
    }, remoteCollabOptions);

    unsubscribe();

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.equal(commits.length, 1);
    assert.equal(commits[0], commit);
    assert.deepEqual(commit.classes, ['replace']);
    assert.deepEqual(commit.tags, [
      'collaboration',
      'remote-canonical-reconcile',
    ]);
    assert.deepEqual(commit.metadata, remoteCollabOptions.metadata);
    assert.equal(commit.fullDocumentChanged, true);
    assert.equal(commit.rootRuntimeIdsChanged, true);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );
    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('remote'),
      paragraph('canonical'),
    ]);
    assert.deepEqual(
      editorGetSnapshot(editor).selection,
      collapsed([1, 0], 'canonical'.length)
    );
    assert.deepEqual(editorGetPathByRuntimeId(editor, oldBlockRuntimeId), [0]);
    assert.deepEqual(
      editorGetPathByRuntimeId(editor, oldTextRuntimeId),
      [0, 0]
    );
    assert(editorGetRuntimeId(editor, [0]));
    assert(editorGetRuntimeId(editor, [0, 0]));
    assert.deepEqual(
      bookmark.resolve(),
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 3 })
    );
    assert.equal(editorString(editor, bookmark.resolve()!), 'em');
    assert.deepEqual(
      bookmark.unref(),
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 3 })
    );
  });

  it('can intentionally clear model selection during remote canonical reconcile', () => {
    const editor = createCollabEditor();

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('remote')],
        marks: null,
        selection: null,
      });
    }, remoteCollabOptions);

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.deepEqual(editorGetSnapshot(editor).selection, null);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.metadata.selection, {
      dom: 'preserve',
      focus: false,
      scroll: false,
    });
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );
  });
});
