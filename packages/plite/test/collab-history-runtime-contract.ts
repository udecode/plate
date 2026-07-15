import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  bookmark as editorBookmark,
  getLastCommit as editorGetLastCommit,
  getPathByRuntimeId as editorGetPathByRuntimeId,
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  registerCommitListener as editorRegisterCommitListener,
  replace as editorReplace,
  string as editorString,
  subscribe as editorSubscribe,
} from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import {
  createEditor,
  type EditorUpdatePolicy,
  type Element,
  type Operation,
} from '@platejs/plite';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const createCollabEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two'), paragraph('three')],
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
    marks: null,
  });

  return editor;
};

const createHistoryCollabEditor = () => {
  const editor = createEditor({ extensions: [history()] as const });

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two'), paragraph('three')],
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
    marks: null,
  });

  return editor;
};

type CollabEditor = ReturnType<typeof createCollabEditor>;
type HistoryCollabEditor = ReturnType<typeof createHistoryCollabEditor>;
type CollabCommit = NonNullable<ReturnType<typeof editorGetLastCommit>>;

const lastCommit = (editor: CollabEditor): CollabCommit => {
  const commit = editorGetLastCommit(editor);

  assert(commit);

  return commit;
};

const historyUndoCount = (editor: HistoryCollabEditor) =>
  editor.read((state) => state.history.undos().length);

const firstUndoOperations = (editor: HistoryCollabEditor) =>
  editor.read((state) => state.history.undos()[0]?.operations);

const remoteReplayPolicy = (tag: string) =>
  ({
    tags: ['collaboration', tag, 'skip-dom-selection', 'history-skip'],
  }) satisfies EditorUpdatePolicy;

const replayRemoteCommit = (
  editor: CollabEditor,
  commit: CollabCommit,
  tag: string
) => {
  editor.update(remoteReplayPolicy(tag), (tx) => {
    tx.operations.replay(commit.operations);
  });
};

describe('collab and history runtime contract', () => {
  it('publishes one commit truth for collab subscribers, extension listeners, and history', () => {
    const editor = createEditor({ extensions: [history()] as const });

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    const runtimeId = editorGetRuntimeId(editor, [0, 0]);
    const subscribedCommits: NonNullable<
      ReturnType<typeof editorGetLastCommit>
    >[] = [];
    const extensionCommits: NonNullable<
      ReturnType<typeof editorGetLastCommit>
    >[] = [];

    const unsubscribeSubscribe = editorSubscribe(
      editor,
      (_snapshot, commit) => {
        if (commit) {
          subscribedCommits.push(commit);
        }
      }
    );
    const unsubscribeCommit = editorRegisterCommitListener(editor, (commit) => {
      extensionCommits.push(commit);
    });

    editor.update({ tags: 'collab-local' }, (tx) => {
      tx.text.insert('a');
      tx.text.insert('b');
    });

    unsubscribeSubscribe();
    unsubscribeCommit();

    assert.equal(subscribedCommits.length, 1);
    assert.equal(extensionCommits.length, 1);

    const commit = subscribedCommits[0]!;

    assert.equal(extensionCommits[0], commit);
    assert.equal(editorGetLastCommit(editor), commit);
    assert.deepEqual(commit.classes, ['text']);
    assert.deepEqual(
      commit.operations.map((operation) => operation.type),
      ['insert_text', 'insert_text']
    );
    assert.deepEqual(commit.tags, ['collab-local']);
    assert.deepEqual(commit.selectionBefore, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(commit.selectionAfter, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.textChanged, true);
    assert.equal(commit.snapshotChanged, true);
    assert.deepEqual(commit.dirty.paths, [[], [0], [0, 0]]);
    assert.deepEqual(commit.dirty.runtimeIds, [runtimeId]);
    assert.deepEqual(commit.dirty.topLevelRange, [0, 0]);
    assert.equal(commit.dirty.wholeDocument, false);
    assert.equal(Object.isFrozen(commit.operations), true);

    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.operations),
      commit.operations
    );
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.selectionBefore),
      commit.selectionBefore
    );
  });

  it('replays local operations remotely with deterministic snapshot tags', () => {
    const source = createCollabEditor();
    const remote = createCollabEditor();
    const remoteCommits: NonNullable<ReturnType<typeof editorGetLastCommit>>[] =
      [];
    const unsubscribe = editorSubscribe(remote, (_snapshot, commit) => {
      if (commit) {
        remoteCommits.push(commit);
      }
    });

    source.update({ tags: 'local-edit' }, (tx) => {
      tx.text.insert('!');
    });

    const sourceCommit = editorGetLastCommit(source);

    assert(sourceCommit);

    remote.update((tx) => {
      tx.tags.add('remote-import');
      tx.operations.replay(sourceCommit.operations);
    });
    unsubscribe();

    assert.deepEqual(
      editorGetSnapshot(remote).children,
      editorGetSnapshot(source).children
    );
    assert.equal(remoteCommits.length, 1);
    assert.deepEqual(remoteCommits[0]?.tags, ['remote-import']);
    assert.deepEqual(
      remoteCommits[0]?.operations.map((operation) => operation.type),
      sourceCommit.operations.map((operation) => operation.type)
    );
    assert.equal(remoteCommits[0]?.snapshotChanged, true);
  });

  it('replays serialized zero text operations during collaboration', () => {
    const source = createCollabEditor();
    const remote = createCollabEditor();

    source.update({ tags: 'local-zero' }, (tx) => {
      tx.text.insert('0');
    });

    const operations = JSON.parse(
      JSON.stringify(lastCommit(source).operations)
    ) as Operation[];

    remote.update((tx) => {
      tx.tags.add('remote-zero');
      tx.operations.replay(operations);
    });

    assert.deepEqual(
      editorGetSnapshot(remote).children,
      editorGetSnapshot(source).children
    );
    assert.deepEqual(editorGetSnapshot(remote).children[0], paragraph('one0'));
  });

  it('uses remote collaboration policy to skip local undo history', () => {
    const source = createCollabEditor();
    const remote = createHistoryCollabEditor();

    source.update({ tags: 'local-edit' }, (tx) => {
      tx.text.insert('!');
    });

    const sourceCommit = editorGetLastCommit(source);

    assert(sourceCommit);

    remote.update(remoteReplayPolicy('remote-import'), (tx) => {
      tx.operations.replay(sourceCommit.operations);
    });

    const remoteCommit = editorGetLastCommit(remote);

    assert(remoteCommit);
    assert.deepEqual(remoteCommit.tags, [
      'collaboration',
      'remote-import',
      'skip-dom-selection',
      'history-skip',
    ]);
    assert.equal(historyUndoCount(remote), 0);
    assert.deepEqual(
      editorGetSnapshot(remote).children,
      editorGetSnapshot(source).children
    );
  });

  it('converges three peers across text, mark, delete, and move commits', () => {
    const assertThreePeerConvergence = ({
      edit,
      expectedChildren,
      tag,
    }: {
      edit: (editor: CollabEditor) => void;
      expectedChildren: Element[];
      tag: string;
    }) => {
      const source = createHistoryCollabEditor();
      const peerB = createHistoryCollabEditor();
      const peerC = createHistoryCollabEditor();

      edit(source);

      const sourceCommit = lastCommit(source);

      replayRemoteCommit(peerB, sourceCommit, `${tag}-peer-b`);
      replayRemoteCommit(peerC, sourceCommit, `${tag}-peer-c`);

      assert.deepEqual(editorGetSnapshot(source).children, expectedChildren);
      assert.deepEqual(
        editorGetSnapshot(peerB).children,
        editorGetSnapshot(source).children
      );
      assert.deepEqual(
        editorGetSnapshot(peerC).children,
        editorGetSnapshot(source).children
      );
      assert.equal(historyUndoCount(source), 1);
      assert.equal(historyUndoCount(peerB), 0);
      assert.equal(historyUndoCount(peerC), 0);
      assert(lastCommit(peerB).tags.includes('history-skip'));
      assert(lastCommit(peerC).tags.includes('history-skip'));
    };

    assertThreePeerConvergence({
      edit(source) {
        source.update({ tags: ['local-edit', 'text'] }, (tx) => {
          tx.text.insert('!');
        });
      },
      expectedChildren: [
        paragraph('one!'),
        paragraph('two'),
        paragraph('three'),
      ],
      tag: 'text',
    });

    assertThreePeerConvergence({
      edit(source) {
        editorReplace(source, {
          children: editorGetSnapshot(source).children,
          marks: null,
          selection: {
            anchor: { path: [1, 0], offset: 0 },
            focus: { path: [1, 0], offset: 'two'.length },
          },
        });

        source.update({ tags: ['local-edit', 'mark'] }, (tx) => {
          tx.marks.add('bold', true);
        });
      },
      expectedChildren: [
        paragraph('one'),
        {
          type: 'paragraph',
          children: [{ text: 'two', bold: true }],
        },
        paragraph('three'),
      ],
      tag: 'mark',
    });

    assertThreePeerConvergence({
      edit(source) {
        source.update({ tags: ['local-edit', 'delete'] }, (tx) => {
          tx.text.delete({
            at: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [1, 0], offset: 'two'.length },
            },
          });
        });
      },
      expectedChildren: [paragraph('three')],
      tag: 'delete',
    });

    assertThreePeerConvergence({
      edit(source) {
        source.update({ tags: ['local-edit', 'move'] }, (tx) => {
          tx.nodes.move({ at: [2], to: [0] });
        });
      },
      expectedChildren: [
        paragraph('three'),
        paragraph('one'),
        paragraph('two'),
      ],
      tag: 'move',
    });
  });

  it('replays replace_children paste operations through the collaboration import path', () => {
    const source = createCollabEditor();
    const remote = createHistoryCollabEditor();

    editorReplace(source, {
      children: editorGetSnapshot(source).children,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'one'.length },
      },
      marks: null,
    });

    source.update({ tags: ['local-edit', 'collab-export'] }, (tx) => {
      tx.fragment.insert([
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
          ],
        },
      ]);
    });

    const sourceCommit = editorGetLastCommit(source);

    assert(sourceCommit);
    assert.deepEqual(
      sourceCommit.operations.map((operation) => operation.type),
      ['replace_children']
    );

    remote.update(remoteReplayPolicy('remote-import'), (tx) => {
      tx.operations.replay(sourceCommit.operations);
    });

    const remoteCommit = editorGetLastCommit(remote);

    assert(remoteCommit);
    assert.deepEqual(
      remoteCommit.operations.map((operation) => operation.type),
      ['replace_children']
    );
    assert.deepEqual(
      editorGetSnapshot(remote).children,
      editorGetSnapshot(source).children
    );
    assert.deepEqual(
      editorGetSnapshot(remote).selection,
      editorGetSnapshot(source).selection
    );
    assert.equal(historyUndoCount(remote), 0);
  });

  it('stores replace_children range delete as one undoable history batch', () => {
    const editor = createHistoryCollabEditor();
    const before = editorGetSnapshot(editor);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0], offset: 'two'.length },
        },
      });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('three')]);
    assert.equal(historyUndoCount(editor), 1);
    assert.deepEqual(
      firstUndoOperations(editor)?.map((operation) => operation.type),
      ['replace_children']
    );

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, before.children);
    assert.deepEqual(editorGetSnapshot(editor).selection, before.selection);
  });

  it('undoes selected text replacement while collaboration tags are present', () => {
    const editor = createHistoryCollabEditor();

    editorReplace(editor, {
      children: [paragraph('hello world')],
      selection: {
        anchor: { path: [0, 0], offset: 'hello '.length },
        focus: { path: [0, 0], offset: 'hello world'.length },
      },
      marks: null,
    });

    editor.update({ tags: ['local-edit', 'collab-active'] }, (tx) => {
      tx.text.insert('test');
    });

    assert.equal(editorString(editor, []), 'hello test');
    assert.equal(historyUndoCount(editor), 1);

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.equal(editorString(editor, []), 'hello world');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 'hello '.length },
      focus: { path: [0, 0], offset: 'hello world'.length },
    });
  });

  it('rebases local undo and redo batches across remote text commits', () => {
    const editor = createHistoryCollabEditor();

    editor.update({ tags: ['local-edit', 'history'] }, (tx) => {
      tx.text.insert('!');
    });

    editor.update(remoteReplayPolicy('remote-prefix'), (tx) => {
      tx.operations.replay([
        {
          type: 'insert_text',
          path: [0, 0],
          offset: 0,
          text: '?',
        },
      ]);
    });

    assert.equal(editorString(editor, [0]), '?one!');
    const firstUndoOperation = firstUndoOperations(editor)?.[0];

    assert.equal(firstUndoOperation?.type, 'insert_text');
    assert.equal(
      firstUndoOperation?.type === 'insert_text'
        ? firstUndoOperation.offset
        : undefined,
      4
    );

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.equal(editorString(editor, [0]), '?one');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.history.redo();
    });

    assert.equal(editorString(editor, [0]), '?one!');
  });

  it('replays remote operations without losing local bookmark ranges', () => {
    const remote = createCollabEditor();
    const bookmark = editorBookmark(remote, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });

    remote.update((tx) => {
      tx.tags.add('remote-import');
      tx.operations.replay([
        {
          type: 'insert_text',
          path: [1, 0],
          offset: 0,
          text: '!',
        },
      ]);
    });

    const commit = editorGetLastCommit(remote);

    assert(commit);
    assert.deepEqual(commit.tags, ['remote-import']);
    assert.deepEqual(bookmark.resolve(), {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 4 },
    });
    assert.equal(editorString(remote, bookmark.resolve()!), 'wo');

    bookmark.unref();
  });

  it('keeps runtime targets local while remote remove and move operations rebase or null them', () => {
    const removeEditor = createCollabEditor();
    const removedBlockId = editorGetRuntimeId(removeEditor, [1]);
    const removedTextId = editorGetRuntimeId(removeEditor, [1, 0]);
    const removedNode = editorGetSnapshot(removeEditor).children[1]!;

    assert(removedBlockId);
    assert(removedTextId);

    const removeOperation: Operation = {
      type: 'remove_node',
      path: [1],
      node: removedNode,
    };

    assert.equal(
      JSON.stringify(removeOperation).includes(removedBlockId),
      false
    );

    removeEditor.update((tx) => {
      tx.tags.add('remote-remove');
      tx.operations.replay([removeOperation]);
    });

    const removeCommit = editorGetLastCommit(removeEditor);

    assert(removeCommit);
    assert.deepEqual(removeCommit.tags, ['remote-remove']);
    assert.equal(editorGetPathByRuntimeId(removeEditor, removedBlockId), null);
    assert.equal(editorGetPathByRuntimeId(removeEditor, removedTextId), null);

    const moveEditor = createCollabEditor();
    const movedBlockId = editorGetRuntimeId(moveEditor, [2]);
    const movedTextId = editorGetRuntimeId(moveEditor, [2, 0]);
    const moveOperation: Operation = {
      type: 'move_node',
      path: [2],
      newPath: [0],
    };

    assert(movedBlockId);
    assert(movedTextId);
    assert.equal(JSON.stringify(moveOperation).includes(movedBlockId), false);

    moveEditor.update((tx) => {
      tx.tags.add('remote-move');
      tx.operations.replay([moveOperation]);
    });

    const moveCommit = editorGetLastCommit(moveEditor);

    assert(moveCommit);
    assert.deepEqual(moveCommit.tags, ['remote-move']);
    assert.deepEqual(editorGetPathByRuntimeId(moveEditor, movedBlockId), [0]);
    assert.deepEqual(editorGetPathByRuntimeId(moveEditor, movedTextId), [0, 0]);
    assert.equal(editorString(moveEditor, [0]), 'three');
  });
});
