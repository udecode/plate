import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import type {
  Descendant,
  Element,
  EditorUpdateTransaction,
  Range,
  Selection,
  Editor as EditorType,
} from '@platejs/plite';
import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  defineCommandType,
  defineEditorExtension,
  DocumentChange,
  SelectionApi,
} from '@platejs/plite';
import {
  deleteBackward as editorDeleteBackward,
  deleteFragment as editorDeleteFragment,
  getSnapshot as editorGetSnapshot,
  insertBreak as editorInsertBreak,
  moveNodes as editorMoveNodes,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import { type Batch, History, history } from '../src';

const PLITE_IMPORT_RE = /import \{ createEditor \} from "@platejs\/plite"/;
const PLITE_REACT_IMPORT_RE =
  /import \{ usePliteEditor \} from ["']@platejs\/plite-react["']/;
const HISTORY_SKIP_DOC_RE =
  /editor\.update\(\{ history: "skip" \}\)\.text\.insert\("draft"\)/;
const USE_PLITE_EDITOR_RE = /const editor = usePliteEditor\(\{/;
const CREATE_REACT_EDITOR_RE = /createReactEditor/;
const ROLLBACK_ERROR_RE = /rollback/;

const paragraph = (
  text: string,
  props: Record<string, unknown> = {}
): Descendant => ({
  type: 'paragraph',
  ...props,
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

const redo = (editor: EditorType) => {
  editor.update((tx) => {
    tx.history.redo();
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

const getVisibleState = (editor: EditorType) => {
  const snapshot = editorGetSnapshot(editor);

  return {
    children: snapshot.children,
    selection: snapshot.selection,
  };
};

const write = (
  editor: EditorType,
  fn: (tx: EditorUpdateTransaction) => void
) => {
  editor.update(fn);
};

const historyBatch = (): Batch => ({
  change: DocumentChange.between(
    { children: [paragraph('before')] },
    { children: [paragraph('after')] }
  ),
  effects: [],
  selectionAfter: null,
  selectionBefore: null,
});

const structuralDocumentChange = (
  change: DocumentChange,
  primary: DocumentChange['primary'] = change.primary
): DocumentChange =>
  Object.assign(Object.create(null) as object, {
    apply: DocumentChange.prototype.apply,
    compose: DocumentChange.prototype.compose,
    correct: DocumentChange.prototype.correct,
    createRoots: change.createRoots,
    deleteRoots: change.deleteRoots,
    empty: change.empty,
    invert: DocumentChange.prototype.invert,
    iterChangedRanges: DocumentChange.prototype.iterChangedRanges,
    mapPosition: DocumentChange.prototype.mapPosition,
    primary,
    primaryClassification: change.primaryClassification,
    rootClassifications: change.rootClassifications,
    roots: change.roots,
    toJSON: DocumentChange.prototype.toJSON,
  }) as DocumentChange;

describe('plite-history contract', () => {
  it('documents React-owned history setup through usePliteEditor', () => {
    const docs = readFileSync(
      new URL(
        '../../../content/docs/plite/libraries/plite-history/history-extension-setup.mdx',
        import.meta.url
      ),
      'utf8'
    );

    assert.match(docs, PLITE_IMPORT_RE);
    assert.match(docs, PLITE_REACT_IMPORT_RE);
    assert.match(docs, HISTORY_SKIP_DOC_RE);
    assert.match(docs, USE_PLITE_EDITOR_RE);
    assert.doesNotMatch(docs, CREATE_REACT_EDITOR_RE);
  });

  it('keeps History.isHistory true before edits and across edit, undo, and redo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Initial text')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 12 },
      focus: { path: [0, 0], offset: 12 },
    });

    assert.equal(History.isHistory(getHistory(editor)), true);

    write(editor, (tx) => {
      tx.text.insert(' additional text');
    });
    assert.equal(History.isHistory(getHistory(editor)), true);

    undo(editor);
    assert.equal(History.isHistory(getHistory(editor)), true);

    redo(editor);
    assert.equal(History.isHistory(getHistory(editor)), true);
  });

  it('accepts empty structural history and change values', () => {
    const batch = historyBatch();
    const emptyChange = DocumentChange.between(
      { children: [paragraph('same')] },
      { children: [paragraph('same')] }
    );

    assert.equal(
      History.isHistory({
        redos: [],
        revision: 0,
        schema: null,
        undos: [],
      }),
      true
    );
    assert.equal(
      History.isHistory({
        redos: [],
        revision: 1,
        schema: null,
        undos: [{ ...batch, change: emptyChange }],
      }),
      true
    );
  });

  it('validates every undo and redo batch', () => {
    const valid = historyBatch();
    const invalid = { ...valid, change: {} };

    for (const stack of ['redos', 'undos'] as const) {
      assert.equal(
        History.isHistory({
          redos: stack === 'redos' ? [valid, invalid] : [],
          revision: 0,
          schema: null,
          undos: stack === 'undos' ? [valid, invalid] : [],
        }),
        false
      );
    }
  });

  it('accepts a prototype-free structurally equivalent document change', () => {
    const batch = historyBatch();
    const change = structuralDocumentChange(batch.change);

    assert.equal(change instanceof DocumentChange, false);
    assert.equal(
      History.isHistory({
        redos: [],
        revision: 1,
        schema: null,
        undos: [{ ...batch, change }],
      }),
      true
    );
  });

  it('rejects an invalid nested change set', () => {
    const batch = historyBatch();
    const changeSet = batch.change.primary!;
    const invalidChangeSet = Object.assign(Object.create(null) as object, {
      apply: changeSet.apply,
      compose: changeSet.compose,
      data: changeSet.data,
      empty: changeSet.empty,
      invert: changeSet.invert,
      iterChangedRanges: changeSet.iterChangedRanges,
      length: changeSet.length,
      mapPos: changeSet.mapPos,
      movedNode: changeSet.movedNode,
      newLength: changeSet.newLength,
      sections: changeSet.sections,
      toJSON: () => [{ length: -1 }],
    }) as unknown as typeof changeSet;
    const change = structuralDocumentChange(batch.change, invalidChangeSet);

    assert.equal(
      History.isHistory({
        redos: [],
        revision: 1,
        schema: null,
        undos: [{ ...batch, change }],
      }),
      false
    );
  });

  it('keeps empty undo and redo stacks as no-op commands', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Initial text')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 12 },
      focus: { path: [0, 0], offset: 12 },
    });

    const before = getVisibleState(editor);

    undo(editor);
    redo(editor);

    assert.deepEqual(getVisibleState(editor), before);
    assert.deepEqual(getHistory(editor).undos, []);
    assert.deepEqual(getHistory(editor).redos, []);
  });

  it('undoes a plain insertText commit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('text');
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes a deferred native text burst to the original insertion offset', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], null);

    editor.update({ tags: 'native-text-input' }, (tx) => {
      for (let offset = 1; offset <= 10; offset++) {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset },
          focus: { path: [0, 0], offset },
        });
      }

      tx.text.insert('XXXXXXXXXX', {
        at: { path: [0, 0], offset: 1 },
      });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 10 },
        focus: { path: [0, 0], offset: 10 },
      });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });
  });

  it('undoes a stale native text burst selection to the inserted offset', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    editor.update({ tags: 'native-text-input' }, (tx) => {
      tx.text.insert('XXXXXXXXXX', {
        at: { path: [0, 0], offset: 1 },
      });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    redo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('CXXXXXXXXXXondico uredo ante arca umbra.')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      },
    });
  });

  it('preserves text selection metadata across native burst undo and redo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
      kind: 'text',
    });
    write(editor, (tx) => {
      tx.selection.set({
        affinity: 'backward',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
        kind: 'text',
        marks: { italic: true },
      });
    });

    editor.update({ tags: 'native-text-input' }, (tx) => {
      tx.text.insert('XXXXXXXXXX', {
        at: { path: [0, 0], offset: 1 },
      });
      tx.selection.set({
        affinity: 'forward',
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
        kind: 'text',
        marks: { bold: true },
      });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        affinity: 'backward' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
        kind: 'text' as const,
        marks: { italic: true },
      },
    });

    redo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('CXXXXXXXXXXondico uredo ante arca umbra.')],
      selection: {
        affinity: 'forward' as const,
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
        kind: 'text' as const,
        marks: { bold: true },
      },
    });
  });

  it('restores pre-insert selection for non-native long text inserts before the caret', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    write(editor, (tx) => {
      tx.text.insert('XXXXXXXXXX', {
        at: { path: [0, 0], offset: 1 },
      });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
    });
  });

  it('restores transaction-start selection when selection changes before the first document change', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], {
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
      tx.text.insert('XYZ', {
        at: { path: [0, 0], offset: 1 },
      });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
  });

  it('does not merge adjacent text history batches across roots', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('x')],
        roots: { header: [paragraph('')] },
      },
    });

    write(editor, (tx) => {
      tx.text.insert('a', {
        at: { offset: 0, path: [0, 0], root: 'header' },
      });
    });
    write(editor, (tx) => {
      tx.text.insert('b', {
        at: { offset: 1, path: [0, 0] },
      });
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);
    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('x')], roots: { header: [paragraph('a')] } }
    );

    undo(editor);
    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('x')], roots: { header: [paragraph('')] } }
    );
  });

  it('does not merge view-local text history batches across roots', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('m')],
        roots: { footer: [paragraph('f')], header: [paragraph('h')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const footerEditor = createEditorView(runtime, { root: 'footer' });

    write(headerEditor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.text.insert('1');
    });
    write(mainEditor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.text.insert('1');
    });
    write(footerEditor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.text.insert('1');
    });
    write(headerEditor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      tx.text.insert('2');
    });
    write(mainEditor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      tx.text.insert('2');
    });

    assert.equal(getHistory(runtime).undos.length, 5);

    undo(headerEditor);
    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('m1')],
        roots: { footer: [paragraph('f1')], header: [paragraph('h12')] },
      }
    );
  });

  it('does not let explicit merge policy merge text batches across roots', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('m')],
        roots: { footer: [paragraph('f')], header: [paragraph('h')] },
      },
    });

    editor.update((tx) => {
      tx.text.insert('1', {
        at: { offset: 1, path: [0, 0], root: 'footer' },
      });
    });
    editor.update({ history: 'merge' }, (tx) => {
      tx.text.insert('2', {
        at: { offset: 1, path: [0, 0], root: 'header' },
      });
    });

    assert.equal(getHistory(editor).undos.length, 2);
  });

  it('lets explicit merge policy merge same-root non-text batches', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('alpha')], null);
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.nodes.insert(paragraph('beta'), { at: [1] });
    });
    editor.update({ history: 'merge' }, (tx) => {
      tx.nodes.insert(paragraph('gamma'), { at: [2] });
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('alpha'),
      paragraph('beta'),
      paragraph('gamma'),
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not let native merge policy merge same-node caret jumps', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('abcd')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    editor.update({ tags: 'native-text-input' }, (tx) => {
      tx.text.insert('X', {
        at: { offset: 1, path: [0, 0] },
      });
    });
    editor.update({ history: 'merge', tags: 'native-text-input' }, (tx) => {
      tx.text.insert('Y', {
        at: { offset: 4, path: [0, 0] },
      });
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('aXbcd')]);
  });

  it('does not restore a primary selection into a sibling root undo batch', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const mainEditor = createEditorView(runtime);
    const headerEditor = createEditorView(runtime, { root: 'header' });

    write(mainEditor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });

    write(headerEditor, (tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
    });

    undo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection()),
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );
  });

  it('undoes and redoes an island insert with its explicit child root', () => {
    const childRoot = 'island:body';
    const island = {
      type: 'editable-void',
      childRoots: { body: childRoot },
      children: [{ text: '' }],
    } as Descendant;
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('body')] },
    });

    write(editor, (tx) => {
      tx.roots.create(childRoot, [paragraph('child')]);
      tx.nodes.insert(island, { at: [1] });
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body'), island],
        roots: { [childRoot]: [paragraph('child')] },
      }
    );

    undo(editor);

    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('body')] }
    );

    redo(editor);

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body'), island],
        roots: { [childRoot]: [paragraph('child')] },
      }
    );
  });

  it('undoes a full-document selected text replacement as one structural batch', () => {
    const editor = historyTestEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 'two'.length },
    };

    replace(editor, [paragraph('one'), paragraph('two')], selection);
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('Z', { at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('Z')]);
    assert.equal(getHistory(editor).undos.length, 1);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes a full-document fragment deletion as one structural batch', () => {
    const editor = historyTestEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [2, 0], offset: 'three'.length },
    };

    replace(
      editor,
      [paragraph('one'), paragraph('two'), paragraph('three')],
      selection
    );
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.fragment.delete({ direction: 'backward' });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('')]);
    assert.equal(getHistory(editor).undos.length, 1);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('keeps replace_children undo batches when a remote insert shifts the parent path', () => {
    const editor = historyTestEditor();
    const oldChild = paragraph('old');
    const newChild = paragraph('new');

    replace(
      editor,
      [
        paragraph('intro'),
        {
          type: 'quote',
          children: [oldChild, paragraph('tail')],
        } as Descendant,
      ],
      {
        kind: 'text',
        anchor: { path: [1, 0, 0], offset: 3 },
        focus: { path: [1, 0, 0], offset: 3 },
      }
    );

    write(editor, (tx) => {
      tx.nodes.replaceChildren([newChild], {
        at: [1],
        count: 1,
        index: 0,
        newSelection: {
          kind: 'text',
          anchor: { path: [1, 0, 0], offset: 3 },
          focus: { path: [1, 0, 0], offset: 3 },
        },
      });
    });

    editor.update(
      {
        tags: ['collaboration', 'remote-insert', 'history-skip'],
      },
      (tx) => {
        tx.nodes.insert(paragraph('remote'), { at: [0] });
      }
    );

    assert.equal(getHistory(editor).undos.length, 1);
    undo(editor);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('remote'),
      paragraph('intro'),
      {
        type: 'quote',
        children: [oldChild, paragraph('tail')],
      },
    ]);
  });

  it('rebases rootless replacement selections through non-main root edits', () => {
    const oldChild = paragraph('old');
    const newChild = paragraph('new');
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [oldChild, paragraph('tail')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    write(headerEditor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    write(headerEditor, (tx) => {
      tx.nodes.replaceChildren([newChild], {
        at: [],
        count: 1,
        index: 0,
        newSelection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 3 },
          focus: { path: [0, 0], offset: 3 },
        },
      });
    });

    headerEditor.update({ history: 'skip' }, (tx) => {
      tx.nodes.insert(paragraph('remote'), { at: [0] });
    });

    undo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('remote'), oldChild, paragraph('tail')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection()),
      {
        kind: 'text',
        anchor: { path: [1, 0], offset: 3, root: 'header' },
        focus: { path: [1, 0], offset: 3, root: 'header' },
      }
    );
  });

  it('rebases saved undo batches across local history-skip document edits', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('abcdef')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    write(editor, (tx) => {
      tx.text.insert('X');
    });

    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('Y', { at: { path: [0, 0], offset: 0 } });
    });

    undo(editor);

    assert.equal(editorString(editor, [0]), 'Yabcdef');
  });

  it('drops saved undo batches deleted by local history-skip edits', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('ab')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    write(editor, (tx) => {
      tx.text.insert('X');
    });

    assert.equal(editorString(editor, [0]), 'aXb');
    assert.equal(getHistory(editor).undos.length, 1);

    editor.update({ history: 'skip' }, (tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 2 },
        },
      });
    });

    assert.equal(editorString(editor, [0]), 'b');
    assert.equal(getHistory(editor).undos.length, 0);

    undo(editor);

    assert.equal(editorString(editor, [0]), 'b');
    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(getHistory(editor).redos.length, 0);
  });

  it('rebases saved non-main split positions across history-skip text edits', () => {
    const quote = (children: Descendant[]): Element => ({
      children,
      type: 'quote',
    });
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('main')],
        roots: {
          header: [quote([paragraph('abc'), paragraph('def')])],
        },
      },
    });
    const editor = runtime.editor;
    const headerEditor = createEditorView(runtime, { root: 'header' });

    write(headerEditor, (tx) => {
      tx.nodes.split({ at: [0], position: 1 });
    });

    assert.equal(getHistory(editor).undos.length, 1);

    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('Y', {
        at: { offset: 0, path: [0, 0, 0], root: 'header' },
      });
    });

    undo(editor);
    assert.deepEqual(editor.read.value(), {
      children: [paragraph('main')],
      roots: {
        header: [quote([paragraph('Yabc'), paragraph('def')])],
      },
    });

    redo(editor);

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('main')],
      roots: {
        header: [quote([paragraph('Yabc')]), quote([paragraph('def')])],
      },
    });
  });

  it('routes tx undo and redo through history commands', () => {
    const editor = historyTestEditor();
    const commands: string[] = [];
    const redoCommand = defineCommandType<{
      root: string;
      type: 'history_redo';
    }>('history_redo');
    const undoCommand = defineCommandType<{
      root: string;
      type: 'history_undo';
    }>('history_undo');

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeUndo = editor.extend(
      defineEditorExtension({
        commands: [
          undoCommand.handle((context, next) => {
            commands.push(context.command.type);
            return next();
          }),
        ],
        name: 'test-history-undo-command',
      })
    );
    const unsubscribeRedo = editor.extend(
      defineEditorExtension({
        commands: [
          redoCommand.handle((context, next) => {
            commands.push(context.command.type);
            return next();
          }),
        ],
        name: 'test-history-redo-command',
      })
    );

    write(editor, (tx) => {
      tx.text.insert('!');
    });
    undo(editor);
    redo(editor);
    unsubscribeUndo();
    unsubscribeRedo();

    assert.deepEqual(commands, ['history_undo', 'history_redo']);
    assert.equal(editorString(editor, [0]), 'one!');
  });

  it('discards the redo branch without changing the document', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    write(editor, (tx) => {
      tx.text.insert('!');
    });
    undo(editor);

    assert.equal(
      editor.read((state) => state.history.redos().length),
      1
    );

    assert.throws(() => {
      editor.update((tx) => {
        tx.history.discardRedo();
        throw new Error('rollback');
      });
    }, ROLLBACK_ERROR_RE);
    assert.equal(
      editor.read((state) => state.history.redos().length),
      1
    );

    editor.update((tx) => {
      tx.history.discardRedo();
    });

    assert.equal(
      editor.read((state) => state.history.redos().length),
      0
    );
    assert.equal(editorString(editor, [0]), 'one');
  });

  it('merges contiguous insertText commits into one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('t');
    });
    write(editor, (tx) => {
      tx.text.insert('w');
    });
    write(editor, (tx) => {
      tx.text.insert('o');
    });

    assert.equal(getHistory(editor).undos.length, 1);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('merges typing after selected text replacement into one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('This is editable plain text')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'This is editable '.length },
      focus: { path: [0, 0], offset: 'This is editable plain '.length },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('s');
    });
    for (const text of ['i', 'm', 'p', 'l', 'e']) {
      write(editor, (tx) => {
        tx.text.insert(text);
      });
    }

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(editorString(editor, [0]), 'This is editable simpletext');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('merges typing after multi-leaf selected text replacement into one undo unit', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [
        {
          type: 'paragraph',
          children: [
            { text: 'This is editable ' },
            { bold: true, text: 'rich' },
            { text: ' text, much better' },
          ],
        } as Descendant,
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 'This is '.length },
        focus: { path: [0, 2], offset: ' text'.length },
      }
    );

    const before = getVisibleState(editor);

    for (const text of ['e', 'x', 'a', 'm', 'p', 'l', 'e']) {
      write(editor, (tx) => {
        tx.text.insert(text);
      });
    }

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(editorString(editor, [0]), 'This is example, much better');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not merge typing into an unrelated multi-range structural batch', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one'), paragraph('two')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    write(editor, (tx) => {
      tx.nodes.insert(paragraph('middle'), { at: [1] });
      tx.nodes.insert(paragraph('tail'), { at: [3] });
    });

    const ranges: Array<readonly [number, number, number, number]> = [];

    editor.read.lastCommit()?.changes.iterChangedRanges((_root, ...range) => {
      ranges.push(range);
    });
    assert.ok(ranges.length > 1);

    write(editor, (tx) => {
      tx.text.insert('!');
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('one'),
      paragraph('middle'),
      paragraph('two'),
      paragraph('tail'),
    ]);
  });

  it('uses update policy to push, merge, and skip history batches', () => {
    const pushEditor = historyTestEditor();

    replace(pushEditor, [paragraph('')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    pushEditor.update((tx) => {
      tx.text.insert('a');
    });
    pushEditor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('b');
    });

    assert.equal(getHistory(pushEditor).undos.length, 2);

    const mergeEditor = historyTestEditor();

    replace(mergeEditor, [paragraph('')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    mergeEditor.update((tx) => {
      tx.text.insert('a');
    });
    mergeEditor.update({ history: 'merge' }, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      tx.text.insert('b');
    });

    assert.equal(getHistory(mergeEditor).undos.length, 1);

    const skipEditor = historyTestEditor();

    replace(skipEditor, [paragraph('')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    skipEditor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('a');
    });

    assert.equal(getHistory(skipEditor).undos.length, 0);
  });

  it('lets transaction control skip history for the active update', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    editor.update((tx) => {
      tx.history.skip();
      tx.text.insert('a');
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('a')],
      }
    );
    assert.equal(getHistory(editor).undos.length, 0);
  });

  it('clears redo history when a new edit follows undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('a');
    });
    undo(editor);

    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(getHistory(editor).redos.length, 1);

    write(editor, (tx) => {
      tx.text.insert('b');
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(getHistory(editor).redos.length, 0);
    assert.equal(editorString(editor, [0]), 'oneb');

    redo(editor);

    assert.equal(editorString(editor, [0]), 'oneb');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes and redoes a selected block property change', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('AAA'), paragraph('BBB')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.nodes.set<Element>({ type: 'quote' }, { at: [0] });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'quote',
        children: [{ text: 'AAA' }],
      },
      paragraph('BBB'),
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);

    redo(editor);

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'quote',
        children: [{ text: 'AAA' }],
      },
      paragraph('BBB'),
    ]);
  });

  it('merges repeated block property changes into one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('AAA', { status: 'draft' })], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.nodes.set<Element>({ status: 'review' }, { at: [0] });
    });
    write(editor, (tx) => {
      tx.nodes.set<Element>({ status: 'published' }, { at: [0] });
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('AAA', { status: 'published' }),
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes and redoes custom text property changes', () => {
    const editor = historyTestEditor();

    replace(editor, [
      {
        type: 'paragraph',
        children: [{ text: 'Styled text', className: 'token' }],
      },
    ]);
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.nodes.set({ className: 'highlight' }, { at: [0, 0] });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'Styled text', className: 'highlight' }],
      },
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);

    redo(editor);

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'Styled text', className: 'highlight' }],
      },
    ]);
  });

  it('saves node property commits but ignores empty updates', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Initial text')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 12 },
      focus: { path: [0, 0], offset: 12 },
    });
    const before = getVisibleState(editor);

    editor.update(() => {});

    assert.equal(getHistory(editor).undos.length, 0);

    editor.update((tx) => {
      tx.nodes.set({ role: 'updated' }, { at: [0] });
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        role: 'updated',
        children: [{ text: 'Initial text' }],
      },
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not save no-op boundary deletes to history', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    write(editor, (tx) => {
      tx.text.deleteBackward();
    });
    write(editor, (tx) => {
      tx.text.deleteForward();
    });

    assert.equal(getHistory(editor).undos.length, 0);
    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('')]);
  });

  it('merges contiguous text commits when selection import shares a text commit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('')], null);
    const before = getVisibleState(editor);

    editor.update((tx) => {
      tx.text.insert('U', { at: { path: [0, 0], offset: 0 } });
    });
    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
      tx.text.insert('n', { at: { path: [0, 0], offset: 1 } });
    });

    assert.equal(getHistory(editor).undos.length, 1);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undo restores transaction-start selection when selection import shares a text commit', () => {
    const editor = historyTestEditor();
    const start = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const middle = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };

    replace(editor, [paragraph('abcdef')], start);

    editor.update((tx) => {
      tx.selection.set(middle);
      tx.text.insert('X', { at: { path: [0, 0], offset: 3 } });
    });

    assert.equal(editorString(editor, [0]), 'abcXdef');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcdef')],
      selection: start,
    });

    redo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcXdef')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });
  });

  it('redo preserves explicit selection after the document change', () => {
    const editor = historyTestEditor();
    const middle = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const trailing = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    replace(editor, [paragraph('abcdef')], middle);

    editor.update((tx) => {
      tx.text.insert('X', { at: { path: [0, 0], offset: 3 } });
      tx.selection.set(trailing);
    });

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcXdef')],
      selection: trailing,
    });

    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcdef')],
      selection: middle,
    });

    redo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcXdef')],
      selection: trailing,
    });
  });

  it('undoes a committed composition as one history unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('This is editable')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'This is '.length },
      focus: { path: [0, 0], offset: 'This is '.length },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('す');
    });
    editor.update({ history: 'merge', tags: 'composition' }, (tx) => {
      tx.text.insert('し');
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(editorString(editor, [0]), 'This is すしeditable');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not save canceled composition text to history', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('This is editable')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'This is '.length },
      focus: { path: [0, 0], offset: 'This is '.length },
    });
    const before = getVisibleState(editor);

    editor.update({ history: 'skip', tags: 'composition-cancel' }, (tx) => {
      tx.text.insert('す');
      tx.text.delete({ reverse: true });
    });

    assert.equal(getHistory(editor).undos.length, 0);
    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not replay partial selection range patches after selection is cleared', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    const before = getVisibleState(editor);

    editor.update((tx) => {
      tx.text.insert('A', { at: { path: [0, 0], offset: 0 } });
      tx.selection.setRange({
        focus: { path: [0, 0], offset: 0 },
      });
    });
    write(editor, (tx) => {
      tx.selection.clear();
    });

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not merge follow-up typing into a structural text batch', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Alpha')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    write(editor, (tx) => {
      editorInsertBreak(editor);
      tx.text.insert('Beta');
    });
    const afterStructuralBatch = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('!');
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), afterStructuralBatch);
  });

  it('reselects the restored text after deleteFragment and undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('abcdef')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    write(editor, () => {
      editorDeleteFragment(editor);
    });
    undo(editor);

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('abcdef')]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('restores the saved expanded selection after deleteFragment, blur, refocus, and undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Hello')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    write(editor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      });
    });
    write(editor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    write(editor, () => {
      editorDeleteFragment(editor);
    });
    write(editor, (tx) => {
      tx.selection.clear();
    });
    write(editor, (tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    undo(editor);

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('Hello')]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('restores the saved multi-block selection after insertBreak and undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one'), paragraph('two'), paragraph('three')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [2, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    write(editor, () => {
      editorInsertBreak(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('restores marks and selection after marked Enter undo', () => {
    const editor = historyTestEditor();

    const children: Descendant[] = [
      {
        type: 'paragraph',
        children: [{ text: 'hey ' }, { bold: true, text: 'you' }],
      },
    ];
    const selection: Selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    replace(editor, children, selection);

    const before = getVisibleState(editor);

    write(editor, () => {
      editorInsertBreak(editor);
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'hey ' }],
      },
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'you' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes a moveNodes commit back to the original tree and selection', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one'), paragraph('two'), paragraph('three')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    const before = getVisibleState(editor);

    write(editor, () => {
      editorMoveNodes(editor, { at: [0], to: [3] });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes reverse block joins cleanly', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Hello'), paragraph('world!')], {
      kind: 'text',
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    const before = getVisibleState(editor);

    write(editor, () => {
      editorDeleteBackward(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes reverse nested block joins cleanly', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [
        paragraph('Hello'),
        {
          type: 'paragraph',
          children: [paragraph('world!')],
        } as unknown as Descendant,
      ],
      {
        kind: 'text',
        anchor: { path: [1, 0, 0], offset: 0 },
        focus: { path: [1, 0, 0], offset: 0 },
      }
    );

    const before = getVisibleState(editor);

    write(editor, () => {
      editorDeleteBackward(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes reverse same-text deletes cleanly', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('word')], {
      kind: 'text',
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.delete({ reverse: true });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes same-text deletes without dropping custom props', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [paragraph('one', { a: true }), paragraph('two', { b: true })],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 2 },
      }
    );

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.delete();
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes insertBreak commits cleanly', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [
        {
          type: 'paragraph',
          children: [paragraph('one'), paragraph('two')],
        } as unknown as Descendant,
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0], offset: 2 },
      }
    );

    const before = getVisibleState(editor);

    write(editor, () => {
      editorInsertBreak(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });
});
