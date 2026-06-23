import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import { createEditor, type Descendant, type Operation } from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const createCollabEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
  const editor = createEditor({ extensions: [history()] });

  Editor.replace(editor, {
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
type CollabCommit = NonNullable<ReturnType<typeof Editor.getLastCommit>>;

const lastCommit = (editor: CollabEditor): CollabCommit => {
  const commit = Editor.getLastCommit(editor);

  assert(commit);

  return commit;
};

const historyUndoCount = (editor: HistoryCollabEditor) =>
  editor.read((state) => state.history.undos().length);

const firstUndoOperations = (editor: HistoryCollabEditor) =>
  editor.read((state) => state.history.undos()[0]?.operations);

const remoteReplayMetadata = {
  collab: { origin: 'remote', saveToHistory: false },
  history: { mode: 'skip' },
  selection: { dom: 'preserve' },
} as const;

const replayRemoteCommit = (
  editor: CollabEditor,
  commit: CollabCommit,
  tag: string
) => {
  editor.update(
    (tx) => {
      tx.operations.replay(commit.operations);
    },
    {
      metadata: remoteReplayMetadata,
      tag: ['collaboration', tag],
    }
  );
};

describe('collab and history runtime contract', () => {
  it('publishes one commit truth for collab subscribers, extension listeners, and history', () => {
    const editor = createEditor({ extensions: [history()] });

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    const runtimeId = Editor.getRuntimeId(editor, [0, 0]);
    const subscribedCommits: NonNullable<
      ReturnType<typeof Editor.getLastCommit>
    >[] = [];
    const extensionCommits: NonNullable<
      ReturnType<typeof Editor.getLastCommit>
    >[] = [];

    const unsubscribeSubscribe = Editor.subscribe(
      editor,
      (_snapshot, commit) => {
        if (commit) {
          subscribedCommits.push(commit);
        }
      }
    );
    const unsubscribeCommit = Editor.registerCommitListener(
      editor,
      (commit) => {
        extensionCommits.push(commit);
      }
    );

    editor.update(
      (tx) => {
        tx.text.insert('a');
        tx.text.insert('b');
      },
      { tag: 'collab-local' }
    );

    unsubscribeSubscribe();
    unsubscribeCommit();

    assert.equal(subscribedCommits.length, 1);
    assert.equal(extensionCommits.length, 1);

    const commit = subscribedCommits[0]!;

    assert.equal(extensionCommits[0], commit);
    assert.equal(Editor.getLastCommit(editor), commit);
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

  it('replays local operations remotely with deterministic snapshot and metadata', () => {
    const source = createCollabEditor();
    const remote = createCollabEditor();
    const remoteCommits: NonNullable<
      ReturnType<typeof Editor.getLastCommit>
    >[] = [];
    const unsubscribe = Editor.subscribe(remote, (_snapshot, commit) => {
      if (commit) {
        remoteCommits.push(commit);
      }
    });

    source.update(
      (tx) => {
        tx.text.insert('!');
      },
      { tag: 'local-edit' }
    );

    const sourceCommit = Editor.getLastCommit(source);

    assert(sourceCommit);

    remote.update((tx) => {
      tx.operations.replay(sourceCommit.operations, { tag: 'remote-import' });
    });
    unsubscribe();

    assert.deepEqual(
      Editor.getSnapshot(remote).children,
      Editor.getSnapshot(source).children
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

    source.update(
      (tx) => {
        tx.text.insert('0');
      },
      { tag: 'local-zero' }
    );

    const operations = JSON.parse(
      JSON.stringify(lastCommit(source).operations)
    ) as Operation[];

    remote.update((tx) => {
      tx.operations.replay(operations, { tag: 'remote-zero' });
    });

    assert.deepEqual(
      Editor.getSnapshot(remote).children,
      Editor.getSnapshot(source).children
    );
    assert.deepEqual(Editor.getSnapshot(remote).children[0], paragraph('one0'));
  });

  it('uses typed remote collaboration metadata to skip local undo history', () => {
    const source = createCollabEditor();
    const remote = createHistoryCollabEditor();

    source.update(
      (tx) => {
        tx.text.insert('!');
      },
      { tag: 'local-edit' }
    );

    const sourceCommit = Editor.getLastCommit(source);

    assert(sourceCommit);

    remote.update(
      (tx) => {
        tx.operations.replay(sourceCommit.operations);
      },
      {
        metadata: {
          collab: { origin: 'remote', saveToHistory: false },
          history: { mode: 'skip' },
          selection: { dom: 'preserve' },
        },
        tag: ['collaboration', 'remote-import'],
      }
    );

    const remoteCommit = Editor.getLastCommit(remote);

    assert(remoteCommit);
    assert.deepEqual(remoteCommit.tags, ['collaboration', 'remote-import']);
    assert.deepEqual(remoteCommit.metadata.collab, {
      origin: 'remote',
      saveToHistory: false,
    });
    assert.deepEqual(remoteCommit.metadata.history, { mode: 'skip' });
    assert.equal(historyUndoCount(remote), 0);
    assert.deepEqual(
      Editor.getSnapshot(remote).children,
      Editor.getSnapshot(source).children
    );
  });

  it('converges three peers across text, mark, delete, and move commits', () => {
    const assertThreePeerConvergence = ({
      edit,
      expectedChildren,
      tag,
    }: {
      edit: (editor: CollabEditor) => void;
      expectedChildren: Descendant[];
      tag: string;
    }) => {
      const source = createHistoryCollabEditor();
      const peerB = createHistoryCollabEditor();
      const peerC = createHistoryCollabEditor();

      edit(source);

      const sourceCommit = lastCommit(source);

      replayRemoteCommit(peerB, sourceCommit, `${tag}-peer-b`);
      replayRemoteCommit(peerC, sourceCommit, `${tag}-peer-c`);

      assert.deepEqual(Editor.getSnapshot(source).children, expectedChildren);
      assert.deepEqual(
        Editor.getSnapshot(peerB).children,
        Editor.getSnapshot(source).children
      );
      assert.deepEqual(
        Editor.getSnapshot(peerC).children,
        Editor.getSnapshot(source).children
      );
      assert.equal(historyUndoCount(source), 1);
      assert.equal(historyUndoCount(peerB), 0);
      assert.equal(historyUndoCount(peerC), 0);
      assert.deepEqual(lastCommit(peerB).metadata, remoteReplayMetadata);
      assert.deepEqual(lastCommit(peerC).metadata, remoteReplayMetadata);
    };

    assertThreePeerConvergence({
      edit(source) {
        source.update(
          (tx) => {
            tx.text.insert('!');
          },
          { tag: ['local-edit', 'text'] }
        );
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
        Editor.replace(source, {
          children: Editor.getSnapshot(source).children,
          marks: null,
          selection: {
            anchor: { path: [1, 0], offset: 0 },
            focus: { path: [1, 0], offset: 'two'.length },
          },
        });

        source.update(
          (tx) => {
            tx.marks.add('bold', true);
          },
          { tag: ['local-edit', 'mark'] }
        );
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
        source.update(
          (tx) => {
            tx.text.delete({
              at: {
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [1, 0], offset: 'two'.length },
              },
            });
          },
          { tag: ['local-edit', 'delete'] }
        );
      },
      expectedChildren: [paragraph('three')],
      tag: 'delete',
    });

    assertThreePeerConvergence({
      edit(source) {
        source.update(
          (tx) => {
            tx.nodes.move({ at: [2], to: [0] });
          },
          { tag: ['local-edit', 'move'] }
        );
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

    Editor.replace(source, {
      children: Editor.getSnapshot(source).children,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'one'.length },
      },
      marks: null,
    });

    source.update(
      (tx) => {
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
      },
      { tag: ['local-edit', 'collab-export'] }
    );

    const sourceCommit = Editor.getLastCommit(source);

    assert(sourceCommit);
    assert.deepEqual(
      sourceCommit.operations.map((operation) => operation.type),
      ['replace_children']
    );

    remote.update(
      (tx) => {
        tx.operations.replay(sourceCommit.operations);
      },
      {
        metadata: {
          collab: { origin: 'remote', saveToHistory: false },
          history: { mode: 'skip' },
          selection: { dom: 'preserve' },
        },
        tag: ['collaboration', 'remote-import'],
      }
    );

    const remoteCommit = Editor.getLastCommit(remote);

    assert(remoteCommit);
    assert.deepEqual(
      remoteCommit.operations.map((operation) => operation.type),
      ['replace_children']
    );
    assert.deepEqual(
      Editor.getSnapshot(remote).children,
      Editor.getSnapshot(source).children
    );
    assert.deepEqual(
      Editor.getSnapshot(remote).selection,
      Editor.getSnapshot(source).selection
    );
    assert.equal(historyUndoCount(remote), 0);
  });

  it('stores replace_children range delete as one undoable history batch', () => {
    const editor = createHistoryCollabEditor();
    const before = Editor.getSnapshot(editor);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0], offset: 'two'.length },
        },
      });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [paragraph('three')]);
    assert.equal(historyUndoCount(editor), 1);
    assert.deepEqual(
      firstUndoOperations(editor)?.map((operation) => operation.type),
      ['replace_children']
    );

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, before.children);
    assert.deepEqual(Editor.getSnapshot(editor).selection, before.selection);
  });

  it('undoes selected text replacement while collaboration metadata is present', () => {
    const editor = createHistoryCollabEditor();

    Editor.replace(editor, {
      children: [paragraph('hello world')],
      selection: {
        anchor: { path: [0, 0], offset: 'hello '.length },
        focus: { path: [0, 0], offset: 'hello world'.length },
      },
      marks: null,
    });

    editor.update(
      (tx) => {
        tx.text.insert('test');
      },
      { tag: ['local-edit', 'collab-active'] }
    );

    assert.equal(Editor.string(editor, []), 'hello test');
    assert.equal(historyUndoCount(editor), 1);

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.equal(Editor.string(editor, []), 'hello world');
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 'hello '.length },
      focus: { path: [0, 0], offset: 'hello world'.length },
    });
  });

  it('rebases local undo and redo batches across remote text commits', () => {
    const editor = createHistoryCollabEditor();

    editor.update(
      (tx) => {
        tx.text.insert('!');
      },
      { tag: ['local-edit', 'history'] }
    );

    editor.update(
      (tx) => {
        tx.operations.replay([
          {
            type: 'insert_text',
            path: [0, 0],
            offset: 0,
            text: '?',
          },
        ]);
      },
      {
        metadata: remoteReplayMetadata,
        tag: ['collaboration', 'remote-prefix'],
      }
    );

    assert.equal(Editor.string(editor, [0]), '?one!');
    assert.equal(firstUndoOperations(editor)?.[0]?.type, 'insert_text');
    assert.equal(firstUndoOperations(editor)?.[0]?.offset, 4);

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.equal(Editor.string(editor, [0]), '?one');
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.history.redo();
    });

    assert.equal(Editor.string(editor, [0]), '?one!');
  });

  it('replays remote operations without losing local bookmark ranges', () => {
    const remote = createCollabEditor();
    const bookmark = Editor.bookmark(remote, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });

    remote.update((tx) => {
      tx.operations.replay(
        [
          {
            type: 'insert_text',
            path: [1, 0],
            offset: 0,
            text: '!',
          },
        ],
        { tag: 'remote-import' }
      );
    });

    const commit = Editor.getLastCommit(remote);

    assert(commit);
    assert.deepEqual(commit.tags, ['remote-import']);
    assert.deepEqual(bookmark.resolve(), {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 4 },
    });
    assert.equal(Editor.string(remote, bookmark.resolve()!), 'wo');

    bookmark.unref();
  });

  it('keeps runtime targets local while remote remove and move operations rebase or null them', () => {
    const removeEditor = createCollabEditor();
    const removedBlockId = Editor.getRuntimeId(removeEditor, [1]);
    const removedTextId = Editor.getRuntimeId(removeEditor, [1, 0]);
    const removedNode = Editor.getSnapshot(removeEditor).children[1]!;

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
      tx.operations.replay([removeOperation], { tag: 'remote-remove' });
    });

    const removeCommit = Editor.getLastCommit(removeEditor);

    assert(removeCommit);
    assert.deepEqual(removeCommit.tags, ['remote-remove']);
    assert.equal(Editor.getPathByRuntimeId(removeEditor, removedBlockId), null);
    assert.equal(Editor.getPathByRuntimeId(removeEditor, removedTextId), null);

    const moveEditor = createCollabEditor();
    const movedBlockId = Editor.getRuntimeId(moveEditor, [2]);
    const movedTextId = Editor.getRuntimeId(moveEditor, [2, 0]);
    const moveOperation: Operation = {
      type: 'move_node',
      path: [2],
      newPath: [0],
    };

    assert(movedBlockId);
    assert(movedTextId);
    assert.equal(JSON.stringify(moveOperation).includes(movedBlockId), false);

    moveEditor.update((tx) => {
      tx.operations.replay([moveOperation], { tag: 'remote-move' });
    });

    const moveCommit = Editor.getLastCommit(moveEditor);

    assert(moveCommit);
    assert.deepEqual(moveCommit.tags, ['remote-move']);
    assert.deepEqual(Editor.getPathByRuntimeId(moveEditor, movedBlockId), [0]);
    assert.deepEqual(
      Editor.getPathByRuntimeId(moveEditor, movedTextId),
      [0, 0]
    );
    assert.equal(Editor.string(moveEditor, [0]), 'three');
  });
});
