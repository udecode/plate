import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
  getSnapshot as editorGetSnapshot,
  isEditor as editorIsEditor,
  replace as editorReplace,
  string as editorString,
  subscribe as editorSubscribe,
} from '@platejs/plite/internal';

import { createEditor, type Descendant, type Operation } from '../src';
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

const clone = <T>(value: T): T => structuredClone(value);

const replaceChildren = (
  editor: ReturnType<typeof createEditor>,
  children: Descendant[]
) => {
  editorReplace(editor, {
    children: clone(children),
    selection: null,
    marks: null,
  });
};

const runManualTransaction = (
  editor: ReturnType<typeof createEditor>,
  operations: Operation[]
) => {
  runEditorTransaction(editor, (tx) => {
    for (const operation of clone(operations)) {
      tx.apply(operation);
    }
  });
};

const setSelection = (
  editor: ReturnType<typeof createEditor>,
  selection: NonNullable<ReturnType<typeof editorGetSelection>>
) => {
  editor.update((tx) => {
    tx.selection.set(selection);
  });
};

const getVisibleState = (editor: ReturnType<typeof createEditor>) => {
  const snapshot = editorGetSnapshot(editor);

  return {
    children: snapshot.children,
    marks: snapshot.marks,
    selection: snapshot.selection,
    pathToId: snapshot.index.pathToId,
  };
};

describe('plite public accessor + transaction boundary', () => {
  it('read and replace are the public snapshot state path', () => {
    const editor = createEditor();
    const value = [paragraph('one')];

    editorReplace(editor, { children: value, selection: null, marks: null });
    const currentValue = editor.read((state) => state.value.get());

    assert.deepEqual(currentValue, { children: value });
    assert.equal(editorIsEditor(editor, { deep: true }), true);
    assert.deepEqual(editorGetChildren(editor), value);
    assert.equal('children' in editor, false);
    assert.equal('getChildren' in editor, false);
  });

  it('does not expose setChildren as an overrideable public state method', () => {
    const editor = createEditor();
    const value = [paragraph('set')];

    assert.equal('setChildren' in editor, false);

    editorReplace(editor, { children: value, selection: null, marks: null });
    assert.deepEqual(editorGetChildren(editor), value);
  });

  it('internal transaction keeps direct replacement draft-visible and publishes once on exit', () => {
    const editor = createEditor();
    const publishedStates: ReturnType<typeof getVisibleState>[] = [];

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    const unsubscribe = editorSubscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;

    runEditorTransaction(editor, (transaction) => {
      editorReplace(editor, {
        children: [paragraph('replacement')],
        selection: null,
        marks: null,
      });

      assert.equal(publishedStates.length, 0);
      assert.equal(editorString(editor, [0]), 'replacement');

      transaction.apply({
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: { id: 'p0' },
      });

      assert.equal(publishedStates.length, 0);
      assert.deepEqual(editorGetChildren(editor), [
        {
          type: 'paragraph',
          id: 'p0',
          children: [{ text: 'replacement' }],
        },
      ]);
    });

    unsubscribe();

    assert.equal(publishedStates.length, 1);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        id: 'p0',
        children: [{ text: 'replacement' }],
      },
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
    setSelection(batchEditor, selection);
    setSelection(manualEditor, selection);

    batchEditor.update((tx) => {
      tx.operations.replay(clone(operations));
    });
    runManualTransaction(manualEditor, operations);

    assert.deepEqual(
      getVisibleState(batchEditor),
      getVisibleState(manualEditor)
    );
    assert.deepEqual(editorGetSnapshot(batchEditor).children, [
      {
        type: 'paragraph',
        id: 'p0',
        children: [{ text: 'aXbcd' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(batchEditor).selection, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

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
    assert.deepEqual(editorGetSnapshot(batchEditor).children, [
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
    assert.deepEqual(editorGetSnapshot(batchEditor).children, [
      paragraph('two'),
      {
        type: 'paragraph',
        id: 'shifted',
        children: [{ text: 'zero' }],
      },
      paragraph('one'),
    ]);
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
          newProperties: { id: 'blue' },
        });

        transaction.apply({
          type: 'set_node',
          path: [0],
          properties: {},
          newProperties: { children: [] },
        });
      });
    }, /set_node does not update child content/);

    assert.deepEqual(getVisibleState(editor), before);
  });
});
