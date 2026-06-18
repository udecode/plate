import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  Descendant,
  Selection,
  Editor as SlateEditor,
} from '@platejs/slate';
import { createEditor } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';

import { history } from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const historyTestEditor = () => createEditor({ extensions: [history()] });

const getHistory = (editor: SlateEditor) =>
  editor.read((state: any) => state.history.get());

const undo = (editor: SlateEditor) => {
  editor.update((tx: any) => {
    tx.history.undo();
  });
};

const replace = (
  editor: SlateEditor,
  children: Descendant[],
  selection: Selection = null
) => {
  Editor.replace(editor, {
    children: structuredClone(children),
    selection: structuredClone(selection),
    marks: null,
  });
};

const getText = (editor: SlateEditor) =>
  ((Editor.getSnapshot(editor).children[0] as any)?.children?.[0]?.text ??
    null) as string | null;

const getVisibleState = (editor: SlateEditor) => {
  const snapshot = Editor.getSnapshot(editor);

  return {
    children: snapshot.children,
    selection: snapshot.selection,
  };
};

const write = (
  editor: SlateEditor,
  fn: Parameters<SlateEditor['update']>[0]
) => {
  editor.update(fn);
};

describe('slate-history integrity contract', () => {
  it('treats one outer transaction as one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    editor.update((tx) => {
      tx.text.insert('a');
      tx.text.insert('b');
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(getHistory(editor).undos[0]?.operations.length, 2);
    assert.deepEqual(
      getHistory(editor).undos[0]?.selectionBefore,
      before.selection
    );

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('withNewBatch splits once then merges the rest of the scope', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    write(editor, (tx) => {
      tx.text.insert('a');
    });

    editor.api.history.withNewBatch(() => {
      write(editor, (tx) => {
        tx.text.insert('b');
        tx.text.insert('c');
      });
    });

    assert.equal(getHistory(editor).undos.length, 2);
    assert.equal(getHistory(editor).undos[0]?.operations.length, 1);
    assert.equal(getHistory(editor).undos[1]?.operations.length, 2);

    undo(editor);
    assert.equal(getText(editor), 'onea');

    undo(editor);
    assert.equal(getText(editor), 'one');
  });

  it('withoutMerging forces a fresh batch', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    write(editor, (tx) => {
      tx.text.insert('a');
    });

    editor.api.history.withoutMerging(() => {
      write(editor, (tx) => {
        tx.text.insert('b');
      });
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);
    assert.equal(getText(editor), 'onea');

    undo(editor);
    assert.equal(getText(editor), 'one');
  });

  it('withoutSaving suppresses history recording', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    editor.api.history.withoutSaving(() => {
      write(editor, (tx) => {
        tx.text.insert('a');
      });
    });

    assert.equal(getText(editor), 'onea');
    assert.equal(getHistory(editor).undos.length, 0);
  });

  it('does not save selection-only command commits to history', () => {
    const editor = historyTestEditor();
    const seenCommands: string[] = [];

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'set_selection',
      (context, next) => {
        seenCommands.push(context.command.type);
        return next();
      }
    );

    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });
    unsubscribe();

    assert.deepEqual(seenCommands, ['set_selection']);
    assert.equal(getHistory(editor).undos.length, 0);
    assert.deepEqual(Editor.getLastCommit(editor)?.classes, ['selection']);
  });

  it('does not save movement command commits to history', () => {
    const editor = historyTestEditor();
    const seenCommands: string[] = [];

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'move_selection',
      (context, next) => {
        seenCommands.push(context.command.type);
        return next();
      }
    );

    write(editor, (tx) => {
      tx.selection.move();
    });
    unsubscribe();

    assert.deepEqual(seenCommands, ['move_selection']);
    assert.equal(getHistory(editor).undos.length, 0);
    assert.deepEqual(Editor.getLastCommit(editor)?.classes, ['selection']);
  });

  it('does not save collapsed mark command commits to history', () => {
    const editor = historyTestEditor();
    const seenCommands: string[] = [];

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'add_mark',
      (context, next) => {
        seenCommands.push(context.command.type);
        return next();
      }
    );

    Editor.addMark(editor, 'bold', true);
    unsubscribe();

    assert.deepEqual(seenCommands, ['add_mark']);
    assert.equal(getHistory(editor).undos.length, 0);
    assert.deepEqual(Editor.getLastCommit(editor)?.classes, ['mark']);
  });

  it('tx.history.undo moves the current undo batch onto the redo stack', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
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
    assert.deepEqual(
      getHistory(editor).redos[0]?.operations.map(
        (operation) => operation.type
      ),
      ['insert_text']
    );
  });

  it('captures committed batches before subscriber reentry mutates the editor again', () => {
    const editor = historyTestEditor();
    let reentered = false;

    replace(editor, [paragraph('one')]);

    const unsubscribe = Editor.subscribe(editor, () => {
      if (reentered) return;
      reentered = true;

      const snapshot = Editor.getSnapshot(editor);
      const offset = ((snapshot.children[0] as any)?.children?.[0]?.text
        .length ?? 0) as number;

      editor.update((tx) => {
        tx.operations.replay([
          {
            type: 'insert_text',
            path: [0, 0],
            offset,
            text: '!',
          },
        ]);
      });
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          type: 'insert_text',
          path: [0, 0],
          offset: 3,
          text: 'a',
        },
      ]);
    });
    unsubscribe();

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(getHistory(editor).undos[0]?.operations, [
      {
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: 'a',
      },
      {
        type: 'insert_text',
        path: [0, 0],
        offset: 4,
        text: '!',
      },
    ]);
  });

  it('exposes insertText transaction commit metadata to history', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const textRuntimeId = Editor.getRuntimeId(editor, [0, 0]);
    const selectionBefore = structuredClone(
      Editor.getSnapshot(editor).selection
    );
    const commits: NonNullable<ReturnType<typeof Editor.getLastCommit>>[] = [];
    const unsubscribe = Editor.subscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    write(editor, (tx) => {
      tx.text.insert('!');
    });
    unsubscribe();

    assert.equal(commits.length, 1);

    const commit = commits[0]!;
    assert.equal(Editor.getLastCommit(editor), commit);
    assert.deepEqual(commit.classes, ['text']);
    assert.equal(commit.previousVersion, 1);
    assert.equal(commit.version, 2);
    assert.equal(commit.textChanged, true);
    assert.equal(commit.structureChanged, false);
    assert.equal(commit.childrenChanged, true);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.operations, [
      {
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: '!',
      },
    ]);
    assert.deepEqual(commit.selectionBefore, selectionBefore);
    assert.deepEqual(
      commit.selectionAfter,
      Editor.getSnapshot(editor).selection
    );
    assert.deepEqual(commit.dirty.paths, [[], [0], [0, 0]]);
    assert.deepEqual(commit.dirty.runtimeIds, [textRuntimeId]);
    assert.deepEqual(commit.touchedRuntimeIds, [textRuntimeId]);
    assert.deepEqual(
      getHistory(editor).undos[0]?.operations,
      commit.operations
    );
    assert.deepEqual(
      getHistory(editor).undos[0]?.selectionBefore,
      selectionBefore
    );
  });
});
