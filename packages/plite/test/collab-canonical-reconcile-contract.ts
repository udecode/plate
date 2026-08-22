import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type Element,
  type EditorUpdatePolicy,
  type Range,
  type TextSelection,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';
import {
  getLastCommit as editorGetLastCommit,
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
  subscribe as editorSubscribe,
} from '@platejs/plite/internal';

import { createRangeAnchor } from './support/anchor';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const remoteCollabTags = [
  'collaboration',
  'remote-canonical-reconcile',
  'history-skip',
  'skip-dom-selection',
  'skip-selection-focus',
  'skip-scroll-into-view',
] as const;

const remoteCollabPolicy = {
  tags: remoteCollabTags,
} satisfies EditorUpdatePolicy;

const createCollabEditor = () => {
  const editor = createEditor({ extensions: [history()] as const });

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two')],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

const range = (
  anchor: { path: number[]; offset: number },
  focus: { path: number[]; offset: number }
): Range => ({ anchor, focus });

const collapsed = (path: number[], offset: number): TextSelection => ({
  anchor: { path, offset },
  focus: { path, offset },
  kind: 'text',
});

describe('collab canonical remote reconcile contract', () => {
  it('publishes one remote replace commit, skips history, and preserves same-position anchors', () => {
    const editor = createCollabEditor();
    const commits: Array<NonNullable<ReturnType<typeof editorGetLastCommit>>> =
      [];
    const unsubscribe = editorSubscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });
    const oldBlockNodeKey = editorGetNodeKey(editor, [0]);
    const oldTextNodeKey = editorGetNodeKey(editor, [0, 0]);
    const anchor = createRangeAnchor(
      editor,
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 3 })
    );

    assert.ok(oldBlockNodeKey);
    assert.ok(oldTextNodeKey);
    commits.length = 0;

    editor.update(remoteCollabPolicy, (tx) => {
      tx.value.replace({
        children: [paragraph('remote'), paragraph('canonical')],
        selection: collapsed([1, 0], 'canonical'.length),
      });
    });

    unsubscribe();

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.equal(commits.length, 1);
    assert.equal(commits[0], commit);
    assert.deepEqual(commit.tags, remoteCollabTags);
    assert.equal(commit.changed.has('replace'), true);
    assert.equal(commit.changed.has('root-order'), false);
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
    assert.deepEqual(editorGetPathByNodeKey(editor, oldBlockNodeKey), [0]);
    assert.deepEqual(editorGetPathByNodeKey(editor, oldTextNodeKey), [0, 0]);
    assert.ok(editorGetNodeKey(editor, [0]));
    assert.ok(editorGetNodeKey(editor, [0, 0]));
    assert.deepEqual(
      anchor.resolve(),
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 3 })
    );
    assert.equal(editorString(editor, anchor.resolve()!), 'em');
    assert.deepEqual(
      anchor.release(),
      range({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 3 })
    );
  });

  it('can intentionally clear model selection during remote canonical reconcile', () => {
    const editor = createCollabEditor();

    editor.update(remoteCollabPolicy, (tx) => {
      tx.value.replace({
        children: [paragraph('remote')],
        selection: null,
      });
    });

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.deepEqual(editorGetSnapshot(editor).selection, null);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.tags, remoteCollabTags);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );
  });
});
