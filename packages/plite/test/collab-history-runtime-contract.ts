import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
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
  defineExtension,
  DocumentChange,
  type EditorTransactionSpecBuilder,
  type EditorUpdatePolicy,
  type Element,
} from '@platejs/plite';
import { createRangeAnchor } from './support/anchor';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const createCollabEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two'), paragraph('three')],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

const createHistoryCollabEditor = () => {
  const editor = createEditor({ extensions: [history()] as const });

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two'), paragraph('three')],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
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

const firstUndoChange = (editor: HistoryCollabEditor) =>
  editor.read((state) => state.history.undos()[0]?.change);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const serializeChange = (change: DocumentChange) =>
  DocumentChange.fromJSON(clone(change.toJSON()));

const buildChange = (
  editor: CollabEditor,
  build: (tx: EditorTransactionSpecBuilder) => void
) => {
  const spec = editor.read((state) => state.transaction(build));

  assert(spec);

  return serializeChange(spec.changes);
};

const remoteReplayPolicy = (tag: string) =>
  ({
    tags: ['collaboration', tag, 'skip-dom-selection', 'history-skip'],
  }) satisfies EditorUpdatePolicy;

const importRemoteCommit = (
  editor: CollabEditor,
  commit: CollabCommit,
  tag: string
) => {
  editor.update(remoteReplayPolicy(tag), (tx) => {
    tx.changes.apply(serializeChange(commit.changes));
  });
};

describe('collab and history runtime contract', () => {
  it('publishes one commit truth for collab subscribers, extension listeners, and history', () => {
    const extensionCommits: NonNullable<
      ReturnType<typeof editorGetLastCommit>
    >[] = [];
    const editor = createEditor({
      extensions: [
        history(),
        defineExtension('collab-commit-listener', {
          on: {
            commit({ commit }) {
              extensionCommits.push(commit);
            },
          },
        }),
      ] as const,
    });

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    extensionCommits.length = 0;

    const runtimeId = editorGetRuntimeId(editor, [0, 0]);

    assert(runtimeId);

    const subscribedCommits: NonNullable<
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
    editor.update({ tags: 'collab-local' }, (tx) => {
      tx.text.insert('a');
      tx.text.insert('b');
    });

    unsubscribeSubscribe();

    assert.equal(subscribedCommits.length, 1);
    assert.equal(extensionCommits.length, 1);

    const commit = subscribedCommits[0]!;

    assert.equal(extensionCommits[0], commit);
    assert.equal(editorGetLastCommit(editor), commit);
    assert.equal(commit.changed.has('text'), true);
    assert.deepEqual(commit.tags, ['collab-local']);
    assert.deepEqual(commit.selectionBefore, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(commit.selectionAfter, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.changed.has('snapshot'), true);
    assert(commit.changed.runtimeIds('node').includes(runtimeId));
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.equal(
      commit.inverseChanges,
      commit.inverseChanges,
      'inverse changes materialize once per commit'
    );

    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.change.toJSON()),
      commit.inverseChanges.toJSON()
    );
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.selectionBefore),
      commit.selectionBefore
    );
  });

  it('imports local canonical changes with deterministic snapshot tags', () => {
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
      tx.changes.apply(serializeChange(sourceCommit.changes));
    });
    unsubscribe();

    assert.deepEqual(
      editorGetSnapshot(remote).children,
      editorGetSnapshot(source).children
    );
    assert.equal(remoteCommits.length, 1);
    assert.deepEqual(remoteCommits[0]?.tags, ['remote-import']);
    assert.deepEqual(
      remoteCommits[0]?.changes.toJSON(),
      sourceCommit.changes.toJSON()
    );
    assert.equal(remoteCommits[0]?.changed.has('snapshot'), true);
  });

  it('imports serialized zero text changes during collaboration', () => {
    const source = createCollabEditor();
    const remote = createCollabEditor();

    source.update({ tags: 'local-zero' }, (tx) => {
      tx.text.insert('0');
    });

    const change = serializeChange(lastCommit(source).changes);

    remote.update((tx) => {
      tx.tags.add('remote-zero');
      tx.changes.apply(change);
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
      tx.changes.apply(serializeChange(sourceCommit.changes));
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

      importRemoteCommit(peerB, sourceCommit, `${tag}-peer-b`);
      importRemoteCommit(peerC, sourceCommit, `${tag}-peer-c`);

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
          selection: {
            kind: 'text' as const,
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
              kind: 'text',
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

  it('imports a canonical paste change through the collaboration path', () => {
    const source = createCollabEditor();
    const remote = createHistoryCollabEditor();

    editorReplace(source, {
      children: editorGetSnapshot(source).children,
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'one'.length },
      },
    });

    source.update({ tags: ['local-edit', 'collab-export'] }, (tx) => {
      tx.fragment.replace([
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
    assert.equal(sourceCommit.changed.has('document'), true);
    assert.equal(sourceCommit.changed.has('structure'), true);

    remote.update(remoteReplayPolicy('remote-import'), (tx) => {
      tx.changes.apply(serializeChange(sourceCommit.changes));
    });

    const remoteCommit = editorGetLastCommit(remote);

    assert(remoteCommit);
    assert.deepEqual(
      remoteCommit.changes.toJSON(),
      sourceCommit.changes.toJSON()
    );
    assert.deepEqual(
      editorGetSnapshot(remote).children,
      editorGetSnapshot(source).children
    );
    assert.equal(historyUndoCount(remote), 0);
  });

  it('stores a range delete as one canonical undo batch', () => {
    const editor = createHistoryCollabEditor();
    const before = editorGetSnapshot(editor);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0], offset: 'two'.length },
        },
      });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('three')]);
    assert.equal(historyUndoCount(editor), 1);
    const undoChange = firstUndoChange(editor);

    assert(undoChange);
    assert.equal(undoChange.empty, false);
    assert.deepEqual(
      undoChange.apply(editor.read.value()).children,
      before.children
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
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 'hello '.length },
        focus: { path: [0, 0], offset: 'hello world'.length },
      },
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 'hello '.length },
      focus: { path: [0, 0], offset: 'hello world'.length },
    });
  });

  it('rebases local undo and redo batches across remote text commits', () => {
    const editor = createHistoryCollabEditor();

    editor.update({ tags: ['local-edit', 'history'] }, (tx) => {
      tx.text.insert('!');
    });

    const remoteChange = buildChange(editor, (tx) => {
      tx.text.insert('?', { at: { path: [0, 0], offset: 0 } });
    });

    editor.update(remoteReplayPolicy('remote-prefix'), (tx) => {
      tx.changes.apply(remoteChange);
    });

    assert.equal(editorString(editor, [0]), '?one!');

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.equal(editorString(editor, [0]), '?one');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.history.redo();
    });

    assert.equal(editorString(editor, [0]), '?one!');
  });

  it('imports remote changes without losing local anchor ranges', () => {
    const remote = createCollabEditor();
    const anchor = createRangeAnchor(remote, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });

    const change = buildChange(remote, (tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 0 } });
    });

    remote.update((tx) => {
      tx.tags.add('remote-import');
      tx.changes.apply(change);
    });

    const commit = editorGetLastCommit(remote);

    assert(commit);
    assert.deepEqual(commit.tags, ['remote-import']);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 4 },
    });
    assert.equal(editorString(remote, anchor.resolve()!), 'wo');

    anchor.release();
  });

  it('keeps runtime targets local while remote remove and move changes rebase or null them', () => {
    const removeEditor = createCollabEditor();
    const removedBlockId = editorGetRuntimeId(removeEditor, [1]);
    const removedTextId = editorGetRuntimeId(removeEditor, [1, 0]);
    assert(removedBlockId);
    assert(removedTextId);

    const removeChange = buildChange(removeEditor, (tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.equal(
      JSON.stringify(removeChange.toJSON()).includes(removedBlockId),
      false
    );

    removeEditor.update((tx) => {
      tx.tags.add('remote-remove');
      tx.changes.apply(removeChange);
    });

    const removeCommit = editorGetLastCommit(removeEditor);

    assert(removeCommit);
    assert.deepEqual(removeCommit.tags, ['remote-remove']);
    assert.equal(editorGetPathByRuntimeId(removeEditor, removedBlockId), null);
    assert.equal(editorGetPathByRuntimeId(removeEditor, removedTextId), null);

    const moveEditor = createCollabEditor();
    const movedBlockId = editorGetRuntimeId(moveEditor, [2]);
    const movedTextId = editorGetRuntimeId(moveEditor, [2, 0]);
    assert(movedBlockId);
    assert(movedTextId);
    const moveChange = buildChange(moveEditor, (tx) => {
      tx.nodes.move({ at: [2], to: [0] });
    });

    assert.equal(
      JSON.stringify(moveChange.toJSON()).includes(movedBlockId),
      false
    );

    moveEditor.update((tx) => {
      tx.tags.add('remote-move');
      tx.changes.apply(moveChange);
    });

    const moveCommit = editorGetLastCommit(moveEditor);

    assert(moveCommit);
    assert.deepEqual(moveCommit.tags, ['remote-move']);
    assert.deepEqual(editorGetPathByRuntimeId(moveEditor, movedBlockId), [0]);
    assert.deepEqual(editorGetPathByRuntimeId(moveEditor, movedTextId), [0, 0]);
    assert.equal(editorString(moveEditor, [0]), 'three');
  });
});
