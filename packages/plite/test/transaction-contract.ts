import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Descendant,
  type Operation,
} from '../src';
import { runEditorTransaction as runInternalEditorTransaction } from '../src/core/public-state';

const runEditorTransaction = (
  editor: Parameters<typeof runInternalEditorTransaction>[0],
  fn: Parameters<typeof runInternalEditorTransaction>[1],
  options: Parameters<typeof runInternalEditorTransaction>[2] = {}
) =>
  runInternalEditorTransaction(editor, fn, {
    authority: 'explicit',
    ...options,
  });

const paragraph = (
  text: string,
  props: Record<string, unknown> = {}
): Descendant => ({
  type: 'paragraph',
  ...props,
  children: [{ text }],
});

type DeleteCommand = {
  direction: 'backward' | 'forward';
  type: 'delete';
  unit: 'character' | 'word' | 'line' | 'block';
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const getMarks = (editor: ReturnType<typeof createEditor>) =>
  editor.read((state) => state.marks.get());

const replaceChildren = (
  editor: ReturnType<typeof createEditor>,
  children: Descendant[]
) => {
  Editor.replace(editor, {
    children: clone(children),
    selection: null,
    marks: null,
  });
};

const selectEditor = (
  editor: ReturnType<typeof createEditor>,
  selection: NonNullable<ReturnType<typeof Editor.getSelection>>
) => {
  editor.update((tx) => {
    tx.selection.set(selection);
  });
};

const runManualTransaction = (
  editor: ReturnType<typeof createEditor>,
  operations: Operation[]
) => {
  editor.update((tx) => {
    tx.operations.replay(clone(operations));
  });
};

const getVisibleState = (editor: ReturnType<typeof createEditor>) => {
  const snapshot = Editor.getSnapshot(editor);

  return {
    children: snapshot.children,
    marks: snapshot.marks,
    selection: snapshot.selection,
    pathToId: snapshot.index.pathToId,
  };
};

describe('plite transaction contract', () => {
  it('applyBatch matches manual transaction for duplicate exact-path set_node writes', () => {
    const children = [paragraph('one'), paragraph('two'), paragraph('three')];
    const batchEditor = createEditor();
    const manualEditor = createEditor();
    const operations: Operation[] = [
      {
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: { id: 'blue' },
      },
      {
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: { id: 'final', role: 'final' },
      },
    ];

    replaceChildren(batchEditor, children);
    replaceChildren(manualEditor, children);

    batchEditor.update((tx) => {
      tx.operations.replay(clone(operations));
    });
    runManualTransaction(manualEditor, operations);

    assert.deepEqual(
      getVisibleState(batchEditor),
      getVisibleState(manualEditor)
    );
    assert.deepEqual(Editor.getSnapshot(batchEditor).children, [
      {
        type: 'paragraph',
        id: 'final',
        role: 'final',
        children: [{ text: 'one' }],
      },
      paragraph('two'),
      paragraph('three'),
    ]);
  });

  it('applyBatch matches manual transaction for mixed text, selection, and node ops', () => {
    const children = [paragraph('abcd')];
    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const batchEditor = createEditor();
    const manualEditor = createEditor();
    const operations: Operation[] = [
      {
        type: 'insert_text',
        path: [0, 0],
        offset: 1,
        text: 'X',
      },
      {
        type: 'set_selection',
        properties: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        newProperties: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
      },
      {
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: { id: 'p0' },
      },
    ];

    replaceChildren(batchEditor, children);
    replaceChildren(manualEditor, children);
    selectEditor(batchEditor, selection);
    selectEditor(manualEditor, selection);

    batchEditor.update((tx) => {
      tx.operations.replay(clone(operations));
    });
    runManualTransaction(manualEditor, operations);

    assert.deepEqual(
      getVisibleState(batchEditor),
      getVisibleState(manualEditor)
    );
    assert.deepEqual(Editor.getSnapshot(batchEditor).children, [
      {
        type: 'paragraph',
        id: 'p0',
        children: [{ text: 'aXbcd' }],
      },
    ]);
    assert.deepEqual(Editor.getSnapshot(batchEditor).selection, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('reads one document root without materializing the serializable value', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('main')]);
    editor.update((tx) => {
      tx.roots.create('header', [paragraph('header')]);
    });

    const root = editor.read((state) => state.value.root('header'));
    const value = editor.read((state) => state.value.get());

    assert.deepEqual(root, [paragraph('header')]);
    assert.deepEqual(
      editor.read((state) => state.value.root()),
      [paragraph('main')]
    );
    assert.deepEqual(value.children, [paragraph('main')]);
    assert.deepEqual(value.roots?.header, [paragraph('header')]);
    assert.notEqual(root, value.roots?.header);
  });

  it('applyBatch matches manual transaction for structural insert, move, and set batches', () => {
    const children = [paragraph('zero'), paragraph('one')];
    const batchEditor = createEditor();
    const manualEditor = createEditor();
    const operations: Operation[] = [
      {
        type: 'insert_node',
        path: [2],
        node: paragraph('two'),
      },
      {
        type: 'move_node',
        path: [2],
        newPath: [0],
      },
      {
        type: 'set_node',
        path: [1],
        properties: {},
        newProperties: { id: 'shifted' },
      },
    ];

    replaceChildren(batchEditor, children);
    replaceChildren(manualEditor, children);

    batchEditor.update((tx) => {
      tx.operations.replay(clone(operations));
    });
    runManualTransaction(manualEditor, operations);

    assert.deepEqual(
      getVisibleState(batchEditor),
      getVisibleState(manualEditor)
    );
    assert.deepEqual(Editor.getSnapshot(batchEditor).children, [
      paragraph('two'),
      {
        type: 'paragraph',
        id: 'shifted',
        children: [{ text: 'zero' }],
      },
      paragraph('one'),
    ]);
  });

  it('internal transaction keeps direct replacement draft-visible and publishes once on exit', () => {
    const editor = createEditor();
    const publishedStates: ReturnType<typeof getVisibleState>[] = [];

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    const unsubscribe = Editor.subscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;

    runEditorTransaction(editor, (transaction) => {
      Editor.replace(editor, {
        children: [paragraph('replacement')],
        selection: null,
        marks: null,
      });

      assert.equal(publishedStates.length, 0);
      assert.equal(Editor.string(editor, [0]), 'replacement');

      transaction.apply({
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: { id: 'p0' },
      });

      assert.equal(publishedStates.length, 0);
      assert.deepEqual(Editor.getChildren(editor), [
        {
          type: 'paragraph',
          id: 'p0',
          children: [{ text: 'replacement' }],
        },
      ]);
    });

    unsubscribe();

    assert.equal(publishedStates.length, 1);
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        id: 'p0',
        children: [{ text: 'replacement' }],
      },
    ]);
  });

  it('keeps runtime-id multi-node replacement atomic until commit and rollbackable', () => {
    const editor = createEditor();
    const publishedStates: ReturnType<typeof getVisibleState>[] = [];
    const normalizedPaths: string[] = [];

    replaceChildren(editor, [
      paragraph('before'),
      paragraph('target'),
      paragraph('after'),
    ]);

    const targetRuntimeId = Editor.getRuntimeId(editor, [1]);
    assert(targetRuntimeId);

    const unextend = editor.extend({
      name: 'atomic-replace-normalizer-spy',
      normalizers: {
        node({ entry, next }) {
          normalizedPaths.push(entry[1].join('.'));
          next();
        },
      },
    });
    const unsubscribe = Editor.subscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;
    normalizedPaths.length = 0;

    editor.update((transaction) => {
      const targetPath = Editor.getPathByRuntimeId(editor, targetRuntimeId);

      assert.deepEqual(targetPath, [1]);
      assert(targetPath);

      transaction.nodes.remove({ at: targetPath });

      assert.equal(publishedStates.length, 0);
      assert.deepEqual(normalizedPaths, []);
      assert.equal(Editor.getPathByRuntimeId(editor, targetRuntimeId), null);

      transaction.nodes.insert(
        [paragraph('replacement-a'), paragraph('replacement-b')],
        { at: targetPath }
      );

      assert.equal(Editor.string(editor, [1]), 'replacement-a');
      assert.equal(Editor.string(editor, [2]), 'replacement-b');
      assert.equal(publishedStates.length, 0);
      assert.deepEqual(normalizedPaths, []);
    });

    unsubscribe();
    unextend();

    const commit = Editor.getLastCommit(editor);

    assert.equal(publishedStates.length, 1);
    assert(normalizedPaths.length > 0);
    assert(commit);
    assert.deepEqual(commit.classes, ['structural']);
    assert.deepEqual(
      commit.operations.map((operation) => operation.type),
      ['remove_node', 'insert_node', 'insert_node']
    );
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('before'),
      paragraph('replacement-a'),
      paragraph('replacement-b'),
      paragraph('after'),
    ]);

    const rollbackEditor = createEditor();
    const rollbackPublishedStates: ReturnType<typeof getVisibleState>[] = [];

    replaceChildren(rollbackEditor, [
      paragraph('before'),
      paragraph('target'),
      paragraph('after'),
    ]);

    const rollbackTargetRuntimeId = Editor.getRuntimeId(rollbackEditor, [1]);
    assert(rollbackTargetRuntimeId);

    const rollbackBefore = getVisibleState(rollbackEditor);
    const unsubscribeRollback = Editor.subscribe(rollbackEditor, () => {
      rollbackPublishedStates.push(getVisibleState(rollbackEditor));
    });

    rollbackPublishedStates.length = 0;

    assert.throws(() => {
      rollbackEditor.update((transaction) => {
        const targetPath = Editor.getPathByRuntimeId(
          rollbackEditor,
          rollbackTargetRuntimeId
        );

        assert.deepEqual(targetPath, [1]);
        assert(targetPath);

        transaction.nodes.remove({ at: targetPath });
        transaction.nodes.insert(
          [paragraph('replacement-a'), paragraph('replacement-b')],
          { at: targetPath }
        );

        throw new Error('reject preview');
      });
    }, /reject preview/);

    unsubscribeRollback();

    assert.equal(rollbackPublishedStates.length, 0);
    assert.deepEqual(getVisibleState(rollbackEditor), rollbackBefore);
    assert.deepEqual(
      Editor.getPathByRuntimeId(rollbackEditor, rollbackTargetRuntimeId),
      [1]
    );
  });

  it('internal transaction exposes live draft state through the transaction argument', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    editor.update((tx) => {
      assert.deepEqual(tx.value.root(), [paragraph('one'), paragraph('two')]);
      assert.equal(tx.selection.get(), null);
      assert.deepEqual(tx.value.operations(), []);

      tx.operations.replay([
        {
          type: 'insert_text',
          path: [0, 0],
          offset: 3,
          text: '!',
        },
      ]);

      assert.equal(tx.value.root()[0]?.children[0]?.text, 'one!');
      assert.equal(tx.value.operations().length, 1);

      tx.selection.set({
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });

      assert.deepEqual(tx.selection.get(), {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    assert.equal(
      Editor.getSnapshot(editor).children[0].children[0].text,
      'one!'
    );
  });

  it('internal transaction exposes tx.apply as the transaction-owned write boundary', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    runEditorTransaction(editor, (transaction) => {
      transaction.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: '!',
      });

      assert.equal(transaction.children[0]?.children[0]?.text, 'one!');
      assert.equal(transaction.operations.length, 1);
    });

    assert.equal(
      Editor.getSnapshot(editor).children[0].children[0].text,
      'one!'
    );
  });

  it('publishes explicit last commit metadata without requiring snapshot subscribers', () => {
    const editor = createEditor();

    assert.equal(Editor.getLastCommit(editor), null);

    replaceChildren(editor, [paragraph('one')]);

    const replaceCommit = Editor.getLastCommit(editor);

    assert(replaceCommit);
    assert.deepEqual(replaceCommit.classes, ['replace']);
    assert.equal(replaceCommit.version, 1);
    assert.equal(replaceCommit.dirty.wholeDocument, true);
    assert.equal(replaceCommit.dirty.topLevelRange, null);

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });
    });

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.equal(commit.previousVersion, 1);
    assert.equal(commit.version, 2);
    assert.deepEqual(commit.classes, ['text']);
    assert.equal(commit.textChanged, true);
    assert.equal(commit.selectionChanged, false);
    assert.equal(commit.structureChanged, false);
    assert.equal(commit.snapshotChanged, true);
    assert.deepEqual(commit.dirty.paths, [[], [0], [0, 0]]);
    assert.deepEqual(commit.dirty.topLevelRange, [0, 0]);
    assert.deepEqual(commit.dirty.runtimeIds, commit.touchedRuntimeIds);
    assert.equal(commit.dirty.wholeDocument, false);
    assert.equal(commit.operations.length, 1);
    assert.equal(commit.operations[0]?.type, 'insert_text');
  });

  it('passes explicit commit metadata through subscribers', () => {
    const editor = createEditor();
    const commits: NonNullable<ReturnType<typeof Editor.getLastCommit>>[] = [];

    replaceChildren(editor, [paragraph('one')]);

    const unsubscribe = Editor.subscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });
    });

    unsubscribe();

    assert.equal(commits.length, 1);
    assert.deepEqual(commits[0]?.classes, ['text']);
    assert.equal(commits[0], Editor.getLastCommit(editor));
    assert.deepEqual(commits[0]?.dirty.topLevelRange, [0, 0]);
  });

  it('tx.apply routes through operations.apply and the core transaction writer', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    const seenOperations: Operation[] = [];
    const unextend = editor.extend({
      name: 'operation-spy',
      operations: {
        apply({ operation, next }) {
          seenOperations.push(operation);
          next(operation);
        },
      },
    });

    runEditorTransaction(editor, (transaction) => {
      transaction.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: '!',
      });
    });

    assert.equal(seenOperations.length, 1);
    assert.equal(
      Editor.getSnapshot(editor).children[0].children[0].text,
      'one!'
    );

    editor.update((tx) => {
      tx.operations.replay([
        {
          type: 'insert_text',
          path: [0, 0],
          offset: 4,
          text: '?',
        },
      ]);
    });

    unextend();

    assert.equal(seenOperations.length, 2);
    assert.equal(
      Editor.getSnapshot(editor).children[0].children[0].text,
      'one!?'
    );
  });

  it('transaction.apply reuses the transaction writer and publishes once', () => {
    const editor = createEditor();
    const publishedStates: ReturnType<typeof getVisibleState>[] = [];

    replaceChildren(editor, [paragraph('one')]);

    const unsubscribe = Editor.subscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;

    runEditorTransaction(editor, (transaction) => {
      transaction.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: '!',
      });

      assert.equal(publishedStates.length, 0);
      assert.equal(transaction.children[0]?.children[0]?.text, 'one!');
      assert.equal(transaction.operations.length, 1);
    });

    unsubscribe();

    assert.equal(publishedStates.length, 1);
    assert.equal(
      Editor.getSnapshot(editor).children[0].children[0].text,
      'one!'
    );
  });

  it('internal transaction exposes tx.setMarks as the transaction-owned marks boundary', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      marks: null,
    });

    runEditorTransaction(editor, (transaction) => {
      transaction.setMarks({ bold: true });

      assert.deepEqual(transaction.marks, { bold: true });
      assert.deepEqual(getMarks(editor), { bold: true });
    });

    assert.deepEqual(Editor.getSnapshot(editor).marks, { bold: true });
  });

  it('internal transaction exposes tx.setSelection as the transaction-owned selection boundary', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      marks: null,
    });

    runEditorTransaction(editor, (transaction) => {
      transaction.setSelection({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });

      assert.deepEqual(transaction.selection, {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('internal transaction rolls back staged changes when a later operation throws', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    const before = getVisibleState(editor);

    assert.throws(() => {
      runEditorTransaction(editor, (transaction) => {
        transaction.apply({
          type: 'set_node',
          path: [0],
          properties: {},
          newProperties: { id: 'temp' },
        });

        transaction.apply({
          type: 'set_node',
          path: [99],
          properties: {},
          newProperties: { boom: true },
        });
      });
    });

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('routes insertText through command middleware and preserves commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'insert_text',
      (context, next) => {
        seenCommands.push(context.command);
        return next({
          ...context.command,
          text: '!',
        });
      }
    );

    editor.update((tx) => {
      Editor.insertText(editor, '?');
    });
    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert.equal(seenCommands.length, 1);
    assert.deepEqual(seenCommands[0], {
      options: {},
      text: '?',
      type: 'insert_text',
    });
    assert.equal(Editor.string(editor, [0]), 'one!');
    assert(commit);
    assert.deepEqual(commit.command, {
      origin: 'command',
      type: 'insert_text',
    });
    assert.deepEqual(commit.classes, ['text']);
    assert.deepEqual(commit.operations, [
      {
        offset: 3,
        path: [0, 0],
        text: '!',
        type: 'insert_text',
      },
    ]);
    assert.deepEqual(commit.dirty.paths, [[], [0], [0, 0]]);
    assert.deepEqual(commit.dirty.runtimeIds, commit.touchedRuntimeIds);
    assert.deepEqual(commit.selectionBefore, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(
      commit.selectionAfter,
      Editor.getSnapshot(editor).selection
    );
  });

  it('preserves command metadata when a command runs inside an open update', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    editor.update((tx) => {
      Editor.insertText(editor, '!');
    });

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.command, {
      origin: 'command',
      type: 'insert_text',
    });
    assert.deepEqual(commit.classes, ['text']);
    assert.deepEqual(commit.operations, [
      {
        offset: 3,
        path: [0, 0],
        text: '!',
        type: 'insert_text',
      },
    ]);
  });

  it('routes insertBreak through command middleware and preserves structural commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'insert_break',
      (context, next) => {
        seenCommands.push(context.command);
        return next();
      }
    );

    editor.update((tx) => {
      Editor.insertBreak(editor);
    });
    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert.deepEqual(seenCommands, [{ type: 'insert_break' }]);
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('o'),
      paragraph('ne'),
    ]);
    assert(commit);
    assert.deepEqual(commit.command, {
      origin: 'command',
      type: 'insert_break',
    });
    assert.deepEqual(commit.classes, ['structural']);
    assert.deepEqual(
      commit.operations.map((operation) => operation.type),
      ['split_node', 'split_node']
    );
    assert.equal(commit.structureChanged, true);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.selectionBefore, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    assert.deepEqual(commit.selectionAfter, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  it('routes insertSoftBreak through command middleware and preserves structural commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'insert_soft_break',
      (context, next) => {
        seenCommands.push(context.command);
        return next();
      }
    );

    editor.update((tx) => {
      Editor.insertSoftBreak(editor);
    });
    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert.deepEqual(seenCommands, [{ type: 'insert_soft_break' }]);
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('o'),
      paragraph('ne'),
    ]);
    assert(commit);
    assert.deepEqual(commit.command, {
      origin: 'command',
      type: 'insert_soft_break',
    });
    assert.deepEqual(commit.classes, ['structural']);
    assert.deepEqual(
      commit.operations.map((operation) => operation.type),
      ['split_node', 'split_node']
    );
    assert.equal(commit.structureChanged, true);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.selectionBefore, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    assert.deepEqual(commit.selectionAfter, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  it('routes delete commands through command middleware and preserves history-shaped commits', () => {
    const backwardEditor = createEditor();
    const fragmentEditor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(backwardEditor, [paragraph('one')]);
    selectEditor(backwardEditor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeDelete = Editor.registerCommand(
      backwardEditor,
      'delete',
      (context, next) => {
        seenCommands.push(context.command);
        return next();
      }
    );

    backwardEditor.update(() => {
      Editor.deleteBackward(backwardEditor);
    });
    unsubscribeDelete();

    const backwardCommit = Editor.getLastCommit(backwardEditor);

    assert.deepEqual(seenCommands, [
      {
        direction: 'backward',
        unit: 'character',
        type: 'delete',
      },
    ]);
    assert.equal(Editor.string(backwardEditor, [0]), 'on');
    assert(backwardCommit);
    assert.deepEqual(backwardCommit.classes, ['text']);
    assert.deepEqual(backwardCommit.operations[0], {
      offset: 2,
      path: [0, 0],
      text: 'e',
      type: 'remove_text',
    });
    assert.deepEqual(
      backwardCommit.operations.map((operation) => operation.type),
      ['remove_text', 'set_selection']
    );

    replaceChildren(fragmentEditor, [paragraph('hello')]);
    selectEditor(fragmentEditor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    const unsubscribeFragment = Editor.registerCommand(
      fragmentEditor,
      'delete_fragment',
      (context, next) => {
        seenCommands.push(context.command);
        return next();
      }
    );

    fragmentEditor.update(() => {
      Editor.deleteFragment(fragmentEditor, { direction: 'backward' });
    });
    unsubscribeFragment();

    const fragmentCommit = Editor.getLastCommit(fragmentEditor);

    assert.deepEqual(seenCommands[1], {
      direction: 'backward',
      type: 'delete_fragment',
    });
    assert.equal(Editor.string(fragmentEditor, [0]), 'ho');
    assert(fragmentCommit);
    assert.deepEqual(fragmentCommit.classes, ['text']);
    assert.deepEqual(
      fragmentCommit.operations.map((operation) => operation.type),
      ['remove_text', 'set_selection']
    );
  });

  it('honors delete command direction overrides from middleware', () => {
    const deleteCommand = Editor.defineCommand<DeleteCommand>('delete');
    const backwardEditor = createEditor();
    const forwardEditor = createEditor();

    replaceChildren(backwardEditor, [paragraph('abc')]);
    selectEditor(backwardEditor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    const unsubscribeBackward = Editor.registerCommand(
      backwardEditor,
      deleteCommand,
      (context, next) => next({ ...context.command, direction: 'forward' })
    );

    backwardEditor.update(() => {
      Editor.deleteBackward(backwardEditor);
    });
    unsubscribeBackward();

    assert.equal(Editor.string(backwardEditor, [0]), 'ac');

    replaceChildren(forwardEditor, [paragraph('abc')]);
    selectEditor(forwardEditor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    const unsubscribeForward = Editor.registerCommand(
      forwardEditor,
      deleteCommand,
      (context, next) => next({ ...context.command, direction: 'backward' })
    );

    forwardEditor.update(() => {
      Editor.deleteForward(forwardEditor);
    });
    unsubscribeForward();

    assert.equal(Editor.string(forwardEditor, [0]), 'bc');
  });

  it('routes selection through command middleware and preserves selection-only commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);

    const unsubscribe = Editor.registerCommand(
      editor,
      'set_selection',
      (context, next) => {
        seenCommands.push(context.command);
        return next({
          ...context.command,
          newProperties: {
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          },
        });
      }
    );

    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert.deepEqual(seenCommands, [
      {
        newProperties: {
          anchor: { path: [0, 0], offset: 3 },
          focus: { path: [0, 0], offset: 3 },
        },
        properties: null,
        type: 'set_selection',
      },
    ]);
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
    assert(commit);
    assert.deepEqual(commit.command, {
      origin: 'command',
      type: 'set_selection',
    });
    assert.deepEqual(commit.classes, ['selection']);
    assert.equal(commit.childrenChanged, false);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.operations, [
      {
        newProperties: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
        properties: null,
        type: 'set_selection',
      },
    ]);
    assert.deepEqual(commit.dirty.paths, []);
    assert.deepEqual(commit.touchedRuntimeIds, []);
  });

  it('keeps rootless selection commands caller-shaped while committing the view root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const seenCommands: unknown[] = [];
    const selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    const unsubscribe = Editor.registerCommand(
      runtime.editor,
      'set_selection',
      (context, next) => {
        seenCommands.push(context.command);
        return next(context.command);
      }
    );

    headerEditor.update((tx) => {
      tx.selection.set(selection);
    });
    unsubscribe();

    const commit = Editor.getLastCommit(runtime.editor);

    assert.deepEqual(seenCommands, [
      {
        newProperties: selection,
        properties: null,
        type: 'set_selection',
      },
    ]);
    assert.deepEqual(commit?.operations, [
      {
        newProperties: selection,
        properties: null,
        root: 'header',
        type: 'set_selection',
      },
    ]);
  });

  it('routes movement through command middleware and preserves selection-only commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'move_selection',
      (context, next) => {
        seenCommands.push(context.command);
        return next({
          ...context.command,
          options: {
            distance: 2,
          },
        });
      }
    );

    editor.update((tx) => {
      tx.selection.move();
    });
    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert.deepEqual(seenCommands, [
      {
        options: {},
        type: 'move_selection',
      },
    ]);
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
    assert(commit);
    assert.deepEqual(commit.command, {
      origin: 'command',
      type: 'move_selection',
    });
    assert.deepEqual(commit.classes, ['selection']);
    assert.deepEqual(
      commit.operations.map((operation) => operation.type),
      ['set_selection']
    );
    assert.deepEqual(commit.dirty.paths, []);
    assert.deepEqual(commit.touchedRuntimeIds, []);
  });

  it('moves word selection across initial sibling text leaves', () => {
    const editor = createEditor();

    replaceChildren(editor, [
      {
        type: 'paragraph',
        children: [
          { bold: true, text: 'he' },
          { text: 'llo' },
          { text: ' world' },
        ],
      },
    ]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    editor.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 1], offset: 3 },
    });
  });

  it('moves word selection across formatted middle sibling text leaves', () => {
    const forward = createEditor();

    replaceChildren(forward, [
      {
        type: 'paragraph',
        children: [
          { text: 'foo ' },
          { bold: true, text: 'bar' },
          { text: ' baz' },
        ],
      },
    ]);
    selectEditor(forward, {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });

    forward.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(Editor.getSnapshot(forward).selection, {
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 1], offset: 3 },
    });

    const backward = createEditor();

    replaceChildren(backward, [
      {
        type: 'paragraph',
        children: [
          { text: 'foo ' },
          { bold: true, text: 'bar' },
          { text: ' baz' },
        ],
      },
    ]);
    selectEditor(backward, {
      anchor: { path: [0, 2], offset: 1 },
      focus: { path: [0, 2], offset: 1 },
    });

    backward.update((tx) => {
      tx.selection.move({ reverse: true, unit: 'word' });
    });

    assert.deepEqual(Editor.getSnapshot(backward).selection, {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    });
  });

  it('moves word selection through padded formatted leaves in both directions', () => {
    const editor = createEditor();

    replaceChildren(editor, [
      {
        type: 'paragraph',
        children: [
          { text: '  123 ' },
          { bold: true, text: 'ab' },
          { text: 'c 456  ' },
          { bold: true, text: 'de' },
          { text: 'f  ' },
        ],
      },
    ]);
    selectEditor(editor, {
      anchor: { path: [0, 4], offset: 3 },
      focus: { path: [0, 4], offset: 3 },
    });

    for (const point of [
      { path: [0, 3], offset: 0 },
      { path: [0, 2], offset: 2 },
      { path: [0, 1], offset: 0 },
      { path: [0, 0], offset: 2 },
      { path: [0, 0], offset: 0 },
    ]) {
      editor.update((tx) => {
        tx.selection.move({ reverse: true, unit: 'word' });
      });

      assert.deepEqual(Editor.getSnapshot(editor).selection, {
        anchor: point,
        focus: point,
      });
    }

    for (const point of [
      { path: [0, 0], offset: 5 },
      { path: [0, 2], offset: 1 },
      { path: [0, 2], offset: 5 },
      { path: [0, 4], offset: 1 },
      { path: [0, 4], offset: 3 },
    ]) {
      editor.update((tx) => {
        tx.selection.move({ unit: 'word' });
      });

      assert.deepEqual(Editor.getSnapshot(editor).selection, {
        anchor: point,
        focus: point,
      });
    }
  });

  it('routes mark commands through command middleware and preserves mark commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeAdd = Editor.registerCommand(
      editor,
      'add_mark',
      (context, next) => {
        seenCommands.push(context.command);
        return next({
          ...context.command,
          key: 'italic',
        });
      }
    );

    editor.update((tx) => {
      Editor.addMark(editor, 'bold', true);
    });
    unsubscribeAdd();

    const addCommit = Editor.getLastCommit(editor);

    assert.deepEqual(seenCommands[0], {
      key: 'bold',
      type: 'add_mark',
      value: true,
    });
    assert.deepEqual(getMarks(editor), { italic: true });
    assert(addCommit);
    assert.deepEqual(addCommit.classes, ['mark']);
    assert.deepEqual(addCommit.marksBefore, null);
    assert.deepEqual(addCommit.marksAfter, { italic: true });
    assert.deepEqual(addCommit.operations, []);

    const unsubscribeRemove = Editor.registerCommand(
      editor,
      'remove_mark',
      (context, next) => {
        seenCommands.push(context.command);
        return next({
          ...context.command,
          key: 'italic',
        });
      }
    );

    editor.update((tx) => {
      Editor.removeMark(editor, 'bold');
    });
    unsubscribeRemove();

    const removeCommit = Editor.getLastCommit(editor);

    assert.deepEqual(seenCommands[1], {
      key: 'bold',
      type: 'remove_mark',
    });
    assert.deepEqual(getMarks(editor), {});
    assert(removeCommit);
    assert.deepEqual(removeCommit.classes, ['mark']);
    assert.deepEqual(removeCommit.marksBefore, { italic: true });
    assert.deepEqual(removeCommit.marksAfter, {});
    assert.deepEqual(removeCommit.operations, []);
  });

  it('stores command handlers in the extension registry command slot', () => {
    const editor = createEditor();
    const registry = Editor.getExtensionRegistry(editor);
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'insert_text',
      (context, next) => {
        seenCommands.push(context.command);
        return next();
      }
    );

    assert.equal(Editor.getExtensionRegistry(editor), registry);
    assert.equal(registry.commands.get('insert_text')?.length, 1);

    editor.update((tx) => {
      Editor.insertText(editor, '!');
    });
    unsubscribe();

    assert.deepEqual(seenCommands, [
      {
        options: {},
        text: '!',
        type: 'insert_text',
      },
    ]);
    assert.equal(registry.commands.get('insert_text')?.length, 0);
  });

  it('registers typed internal command definitions with deterministic priority order', () => {
    type InsertTextCommand = {
      options: Record<string, never>;
      text: string;
      type: 'insert_text';
    };

    const editor = createEditor();
    const insertTextCommand =
      Editor.defineCommand<InsertTextCommand>('insert_text');
    const seenCommands: string[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeEarly = Editor.registerCommand(
      editor,
      insertTextCommand,
      (context, next) => {
        const text: string = context.command.text;

        seenCommands.push(`early:${text}`);
        return next();
      },
      { priority: 1 }
    );
    const unsubscribeLate = Editor.registerCommand(
      editor,
      insertTextCommand,
      (context, next) => {
        seenCommands.push(`late:${context.command.text}`);
        return next();
      },
      { priority: 1 }
    );
    const unsubscribeHigh = Editor.registerCommand(
      editor,
      insertTextCommand,
      (context, next) => {
        seenCommands.push(`high:${context.command.text}`);
        return next();
      },
      { priority: 2 }
    );

    editor.update(() => {
      Editor.insertText(editor, '!');
    });

    unsubscribeEarly();
    unsubscribeLate();
    unsubscribeHigh();

    assert.deepEqual(seenCommands, ['high:!', 'early:!', 'late:!']);
    assert.equal(
      Editor.getExtensionRegistry(editor).commands.get('insert_text')?.length,
      0
    );
  });

  it('lets boolean false decline a command without stopping propagation', () => {
    const editor = createEditor();
    const seenCommands: string[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeDecline = Editor.registerCommand(
      editor,
      'insert_text',
      (context) => {
        seenCommands.push(`decline:${context.command.text}`);
        return false;
      },
      { priority: 2 }
    );
    const unsubscribeOverride = Editor.registerCommand(
      editor,
      'insert_text',
      (context, next) => {
        seenCommands.push(`override:${context.command.text}`);
        return next({
          ...context.command,
          text: '?',
        });
      },
      { priority: 1 }
    );

    editor.update(() => {
      Editor.insertText(editor, '!');
    });

    unsubscribeDecline();
    unsubscribeOverride();

    assert.deepEqual(seenCommands, ['decline:!', 'override:!']);
    assert.equal(Editor.string(editor, [0]), 'one?');
  });

  it('exposes stable extension registry slots beyond commands', () => {
    const editor = createEditor();
    const registry = Editor.getExtensionRegistry(editor);
    const capability = { type: 'link' };
    const normalizer = () => {};
    const commitListener = () => {};

    const unregisterCapability = Editor.registerCapability(
      editor,
      'inline',
      capability
    );
    const unregisterNormalizer = Editor.registerNormalizer(
      editor,
      'paragraph-normalizer',
      normalizer
    );
    const unregisterCommitListener = Editor.registerCommitListener(
      editor,
      commitListener
    );

    assert.equal(Editor.getExtensionRegistry(editor), registry);
    assert.deepEqual(registry.capabilities.get('inline'), [capability]);
    assert.equal(registry.normalizers.get('paragraph-normalizer'), normalizer);
    assert.equal(registry.commitListeners.has(commitListener), true);

    unregisterCapability();
    unregisterNormalizer();
    unregisterCommitListener();

    assert.equal(registry.capabilities.has('inline'), false);
    assert.equal(registry.normalizers.has('paragraph-normalizer'), false);
    assert.equal(registry.commitListeners.has(commitListener), false);
  });

  it('cleans extension registration output and aborts its lifecycle signal', () => {
    const editor = createEditor();
    let cleanupCalls = 0;
    let signal: AbortSignal | null = null;
    const commits: NonNullable<ReturnType<typeof Editor.getLastCommit>>[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unextend = editor.extend({
      name: 'lifecycle-extension',
      setup: (context) => {
        signal = context.signal;

        return {
          cleanup: () => {
            cleanupCalls += 1;
          },
          onCommit({ commit }) {
            commits.push(commit);
          },
        };
      },
    });

    assert.equal(signal?.aborted, false);
    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });
    });

    assert.equal(commits.length, 1);

    unextend();
    editor.update((tx) => {
      tx.text.insert('?', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.equal(cleanupCalls, 1);
    assert.equal(signal?.aborted, true);
    assert.equal(commits.length, 1);
  });

  it('exposes extension state and transaction groups with cleanup', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    const unextend = editor.extend({
      name: 'group-extension',
      state: {
        mirror: (state) =>
          Object.freeze({
            text: () => state.text.string([0]),
          }),
      },
      tx: {
        mirror: (tx) =>
          Object.freeze({
            append: (text: string) =>
              tx.text.insert(text, { at: { path: [0, 0], offset: 3 } }),
          }),
      },
    });

    assert.equal(
      editor.read((state) => state.text.string([0])),
      'one'
    );

    editor.update((tx) => {
      (
        tx as typeof tx & { mirror: { append: (text: string) => void } }
      ).mirror.append('!');
    });

    assert.equal(
      editor.read((state) => state.text.string([0])),
      'one!'
    );

    const registry = Editor.getExtensionRegistry(editor);
    assert.equal(registry.stateGroups.has('mirror'), true);
    assert.equal(registry.txGroups.has('mirror'), true);

    unextend();

    assert.equal(registry.stateGroups.has('mirror'), false);
    assert.equal(registry.txGroups.has('mirror'), false);
  });

  it('routes insertFragment through command middleware and preserves commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribe = Editor.registerCommand(
      editor,
      'insert_fragment',
      (context, next) => {
        seenCommands.push(context.command);
        return next({
          ...context.command,
          fragment: [{ text: '!' }],
        });
      }
    );

    editor.update((tx) => {
      tx.fragment.insert([{ text: '?' }]);
    });
    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert.deepEqual(seenCommands, [
      {
        fragment: [{ text: '?' }],
        options: {},
        type: 'insert_fragment',
      },
    ]);
    assert.equal(Editor.string(editor, [0]), 'one!');
    assert(commit);
    assert.deepEqual(commit.classes, ['structural']);
    assert.deepEqual(
      commit.operations.map((operation) => operation.type),
      ['insert_node', 'set_selection', 'merge_node']
    );
    assert.equal(commit.structureChanged, true);
    assert.equal(commit.selectionChanged, true);
  });

  it('delivers command-backed commits to extension commit listeners and preserves subscribe behavior', () => {
    const editor = createEditor();
    const extensionCommits: NonNullable<
      ReturnType<typeof Editor.getLastCommit>
    >[] = [];
    const subscribedCommits: NonNullable<
      ReturnType<typeof Editor.getLastCommit>
    >[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeCommitListener = Editor.registerCommitListener(
      editor,
      (commit) => {
        extensionCommits.push(commit);
      }
    );
    const unsubscribeSubscriber = Editor.subscribe(
      editor,
      (_snapshot, commit) => {
        if (commit) {
          subscribedCommits.push(commit);
        }
      }
    );

    editor.update((tx) => {
      Editor.insertText(editor, '!');
    });
    unsubscribeCommitListener();
    unsubscribeSubscriber();
    editor.update((tx) => {
      Editor.insertText(editor, '?');
    });

    assert.equal(extensionCommits.length, 1);
    assert.equal(subscribedCommits.length, 1);
    assert.equal(extensionCommits[0], subscribedCommits[0]);
    assert.deepEqual(extensionCommits[0]?.command, {
      origin: 'command',
      type: 'insert_text',
    });
    assert.equal(Editor.string(editor, [0]), 'one!?');
  });
});
