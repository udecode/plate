import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  Descendant,
  Editor as EditorType,
  Range,
  Selection,
} from 'plitejs';
import {
  createEditor,
  defineExtension,
  editorCommands,
  SelectionApi,
} from 'plitejs';

import { history } from '../../src/history';
import {
  addMark as editorAddMark,
  getLastCommit as editorGetLastCommit,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  move as editorMove,
  replace as editorReplace,
  subscribe as editorSubscribe,
} from '../../src/internal';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const historyTestEditor = () => createEditor({ extensions: [history()] });

const getHistory = (editor: EditorType) =>
  editor.read((state: any) => state.history());

const undo = (editor: EditorType) => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

const replace = (
  editor: EditorType,
  children: Descendant[],
  selection: Range | Selection = null
) => {
  editorReplace(editor, {
    children: structuredClone(children),
    selection:
      selection && !SelectionApi.isSelection(selection)
        ? SelectionApi.text(structuredClone(selection))
        : structuredClone(selection),
  });
};

const getText = (editor: EditorType) =>
  ((editorGetSnapshot(editor).children[0] as any)?.children?.[0]?.text ??
    null) as string | null;

const getVisibleState = (editor: EditorType) => {
  const snapshot = editorGetSnapshot(editor);

  return {
    children: snapshot.children,
    selection: snapshot.selection,
  };
};

const write = (editor: EditorType, fn: Parameters<EditorType['update']>[0]) => {
  editor.update(fn);
};

describe('plite-history integrity contract', () => {
  it('splits automatic groups at the exact idle boundary', () => {
    let now = 0;
    const clock = Object.getOwnPropertyDescriptor(
      globalThis.performance,
      'now'
    );

    Object.defineProperty(globalThis.performance, 'now', {
      configurable: true,
      value: () => now,
    });

    try {
      const editor = createEditor({
        extensions: [history({ newBatchDelay: 500 })],
        initialSelection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        initialValue: [paragraph('')],
      });

      editor.update((tx) => tx.text.insert('a'));
      now = 499;
      editor.update((tx) => tx.text.insert('b'));
      now = 999;
      editor.update((tx) => tx.text.insert('c'));
      assert.equal(getHistory(editor).undos.length, 1);

      now = 1500;
      editor.update((tx) => tx.text.insert('d'));
      assert.equal(getHistory(editor).undos.length, 2);

      now = 5000;
      editor.update({ history: 'merge' }, (tx) => tx.text.insert('e'));
      assert.equal(getHistory(editor).undos.length, 2);

      now = 5001;
      editor.update({ history: 'new-batch' }, (tx) => tx.text.insert('f'));
      assert.equal(getHistory(editor).undos.length, 3);

      now = 5002;
      editor.update((tx) => tx.text.insert('g'));
      assert.equal(getHistory(editor).undos.length, 4);
    } finally {
      if (clock) {
        Object.defineProperty(globalThis.performance, 'now', clock);
      } else {
        Reflect.deleteProperty(globalThis.performance, 'now');
      }
    }
  });

  it('treats one outer transaction as one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    editor.update((tx) => {
      tx.text.insert('a');
      tx.text.insert('b');
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(
      getHistory(editor).undos[0]?.selectionBefore,
      before.selection
    );

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('history new-batch policy starts a fresh batch for the transaction', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    write(editor, (tx) => {
      tx.text.insert('a');
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('b');
      tx.text.insert('c');
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);
    assert.equal(getText(editor), 'onea');

    undo(editor);
    assert.equal(getText(editor), 'one');
  });

  it('tx.history.newBatch() forces a fresh batch', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    write(editor, (tx) => {
      tx.text.insert('a');
    });

    editor.update((tx) => {
      tx.history.newBatch();
      tx.text.insert('b');
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);
    assert.equal(getText(editor), 'onea');

    undo(editor);
    assert.equal(getText(editor), 'one');
  });

  it('history skip policy suppresses history recording', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('a');
    });

    assert.equal(getText(editor), 'onea');
    assert.equal(getHistory(editor).undos.length, 0);
  });

  it('does not save direct selection-only commits to history', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    write(editor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(editorGetLastCommit(editor)?.changed.has('selection'), true);
  });

  it('does not save movement command commits to history', () => {
    const editor = historyTestEditor();
    const seenCommands: string[] = [];

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    const unsubscribe = editor.install(
      defineExtension('test-move-command', {
        commands: ({ handle }) => [
          handle(editorCommands.move, () => {
            seenCommands.push(editorCommands.move.id);
            return false;
          }),
        ],
      })
    );

    editorMove(editor);
    const movementCommit = editorGetLastCommit(editor);

    unsubscribe();

    assert.deepEqual(seenCommands, ['selection.move']);
    assert.equal(movementCommit?.tags.includes('semantic-command'), true);
    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(movementCommit?.changed.has('selection'), true);
  });

  it('does not save collapsed mark command commits to history', () => {
    const editor = historyTestEditor();
    const seenCommands: string[] = [];

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribe = editor.install(
      defineExtension('test-add-mark-command', {
        commands: ({ handle }) => [
          handle(editorCommands.addMark, () => {
            seenCommands.push(editorCommands.addMark.id);
            return false;
          }),
        ],
      })
    );

    editorAddMark(editor, 'bold', true);
    const markCommit = editorGetLastCommit(editor);

    unsubscribe();

    assert.deepEqual(seenCommands, ['mark.add']);
    assert.equal(markCommit?.tags.includes('semantic-command'), true);
    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(markCommit?.changed.has('marks'), true);
  });

  it('tx.history.undo moves the current undo batch onto the redo stack', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    write(editor, (tx) => {
      tx.text.insert('a');
    });
    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(getHistory(editor).redos.length, 0);

    undo(editor);

    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(getHistory(editor).redos.length, 1);
  });

  it('captures committed batches before subscriber reentry mutates the editor again', () => {
    const editor = historyTestEditor();
    let reentered = false;

    replace(editor, [paragraph('one')]);

    const unsubscribe = editorSubscribe(editor, () => {
      if (reentered) return;
      reentered = true;

      const snapshot = editorGetSnapshot(editor);
      const offset = ((snapshot.children[0] as any)?.children?.[0]?.text
        .length ?? 0) as number;

      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset } });
      });
    });

    editor.update((tx) => {
      tx.text.insert('a', { at: { path: [0, 0], offset: 3 } });
    });
    unsubscribe();

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(getText(editor), 'onea!');
  });

  it('exposes insertText transaction commit data to history', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const textNodeKey = editorGetNodeKey(editor, [0, 0]);
    const selectionBefore = structuredClone(
      editorGetSnapshot(editor).selection
    );
    const commits: Array<NonNullable<ReturnType<typeof editorGetLastCommit>>> =
      [];
    const unsubscribe = editorSubscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    write(editor, (tx) => {
      tx.text.insert('!');
    });
    unsubscribe();

    assert.equal(commits.length, 1);

    const commit = commits[0];
    assert.equal(editorGetLastCommit(editor), commit);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.previousVersion, 1);
    assert.equal(commit.version, 2);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(commit.changed.has('document'), true);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.selectionBefore, selectionBefore);
    assert.deepEqual(
      commit.selectionAfter,
      editorGetSnapshot(editor).selection
    );
    assert.deepEqual(commit.changed.nodeKeys('text'), [textNodeKey]);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.deepEqual(
      getHistory(editor).undos[0]?.selectionBefore,
      selectionBefore
    );
  });
});
