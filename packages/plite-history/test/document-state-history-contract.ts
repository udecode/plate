import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Descendant,
  defineStateField,
  type Range,
  type Editor as PliteEditor,
} from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';

import { history } from '../src';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const undo = (editor: PliteEditor) => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

const redo = (editor: PliteEditor) => {
  editor.update((tx) => {
    tx.history.redo();
  });
};

describe('document state history contract', () => {
  it('undoes and redoes state-only field commits as history batches', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: true,
    });
    const editor = createEditor({
      extensions: [history(), documentTitle],
      initialValue: {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q2 Plan' },
      },
    });
    const readTitle = () =>
      editor.read((state) => state.getField(documentTitle));

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });

    assert.equal(readTitle(), 'Q3 Plan');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]),
      {
        operations: [],
        selectionBefore: null,
        statePatches: [
          {
            key: documentTitle.key,
            previousValue: 'Q2 Plan',
            value: 'Q3 Plan',
          },
        ],
      }
    );

    undo(editor);

    const undoCommit = Editor.getLastCommit(editor);
    assert.equal(readTitle(), 'Q2 Plan');
    assert.deepEqual(undoCommit?.operations, []);
    assert.deepEqual(undoCommit?.statePatches, [
      {
        key: documentTitle.key,
        previousValue: 'Q3 Plan',
        value: 'Q2 Plan',
      },
    ]);
    assert.equal(undoCommit?.tags.includes('historic'), true);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );
    assert.equal(
      editor.read((state) => state.history.redos().length),
      1
    );

    redo(editor);

    const redoCommit = Editor.getLastCommit(editor);
    assert.equal(readTitle(), 'Q3 Plan');
    assert.deepEqual(redoCommit?.operations, []);
    assert.deepEqual(redoCommit?.statePatches, [
      {
        key: documentTitle.key,
        previousValue: 'Q2 Plan',
        value: 'Q3 Plan',
      },
    ]);
    assert.equal(redoCommit?.tags.includes('historic'), true);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.equal(
      editor.read((state) => state.history.redos().length),
      0
    );
  });

  it('does not save history-skip state field commits', () => {
    const localPanel = defineStateField({
      key: 'local.panel',
      history: 'skip',
      initial: () => 'closed',
      persist: false,
    });
    const editor = createEditor({
      extensions: [history(), localPanel],
      initialValue: [paragraph('body')],
    });
    const readPanel = () => editor.read((state) => state.getField(localPanel));

    editor.update((tx) => {
      tx.setField(localPanel, 'open');
    });

    assert.equal(readPanel(), 'open');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    undo(editor);

    assert.equal(readPanel(), 'open');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );
    assert.equal(
      editor.read((state) => state.history.redos().length),
      0
    );
  });

  it('keeps controlled preview state out of history until accepted', () => {
    const previewReplacement = defineStateField<string | null>({
      key: 'local.preview.replacement',
      history: 'skip',
      initial: () => null,
      persist: false,
    });
    const editor = createEditor({
      extensions: [history(), previewReplacement],
      initialValue: [paragraph('Original body')],
    });
    const readPreview = () =>
      editor.read((state) => state.getField(previewReplacement));
    const readText = () => Editor.string(editor, [0]);

    editor.update((tx) => {
      tx.setField(previewReplacement, 'Draft body');
    });

    assert.equal(readPreview(), 'Draft body');
    assert.equal(readText(), 'Original body');
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('Original body')] }
    );
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    editor.update((tx) => {
      tx.setField(previewReplacement, null);
    });

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Original body');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    editor.update((tx) => {
      tx.setField(previewReplacement, 'Accepted body');
    });
    editor.update(
      (tx) => {
        tx.setField(previewReplacement, null);
        tx.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 'Original body'.length },
          },
        });
        tx.text.insert('Accepted body');
      },
      { metadata: { history: { mode: 'push' } }, tag: 'preview-accept' }
    );

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Accepted body');
    assert.deepEqual(
      editor.read((state) =>
        state.history.undos()[0]?.operations.map((operation) => operation.type)
      ),
      ['remove_text', 'set_selection', 'insert_text']
    );
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.statePatches),
      []
    );

    undo(editor);

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Original body');

    redo(editor);

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Accepted body');
  });

  it('removes absent state field keys when undoing a field introduction', () => {
    const optionalSubtitle = defineStateField<string | undefined>({
      key: 'document.subtitle',
      history: 'push',
      persist: true,
    });
    const editor = createEditor({
      extensions: [history(), optionalSubtitle],
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.setField(optionalSubtitle, 'Draft subtitle');
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        state: { [optionalSubtitle.key]: 'Draft subtitle' },
      }
    );

    undo(editor);

    assert.equal(
      editor.read((state) => state.getField(optionalSubtitle)),
      undefined
    );
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('body')] }
    );

    redo(editor);

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        state: { [optionalSubtitle.key]: 'Draft subtitle' },
      }
    );
  });

  it('does not save a state patch when a transaction restores an absent field', () => {
    const optionalSubtitle = defineStateField<string | undefined>({
      key: 'document.subtitle',
      history: 'push',
      persist: true,
    });
    const editor = createEditor({
      extensions: [history(), optionalSubtitle],
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.setField(optionalSubtitle, 'Draft subtitle');
      tx.setField(optionalSubtitle, undefined);
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('body')] }
    );
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    undo(editor);

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('body')] }
    );
  });

  it('stores and replays compact state field patches in history', () => {
    type LargeCounter = {
      body: string;
      count: number;
    };

    const largeCounter = defineStateField<LargeCounter>({
      key: 'document.large-counter',
      applyPatch: (value, patch) => ({
        ...value,
        count: value.count + (patch as number),
      }),
      collab: 'shared',
      diff: (previous, value) => value.count - previous.count,
      history: 'push',
      initial: () => ({ body: 'x'.repeat(40_000), count: 0 }),
      invertPatch: (patch) => -(patch as number),
      persist: true,
    });
    const editor = createEditor({
      extensions: [history(), largeCounter],
      initialValue: [paragraph('body')],
    });
    const readCounter = () =>
      editor.read((state) => state.getField(largeCounter));

    editor.update((tx) => {
      tx.setField(largeCounter, (value) => ({
        ...value,
        count: value.count + 3,
      }));
    });

    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.statePatches),
      [
        {
          inversePatch: -3,
          key: largeCounter.key,
          patch: 3,
        },
      ]
    );
    assert.equal(
      JSON.stringify(
        editor.read((state) => state.history.undos()[0]?.statePatches)
      ).includes('xxxxx'),
      false
    );

    undo(editor);

    assert.deepEqual(readCounter(), {
      body: 'x'.repeat(40_000),
      count: 0,
    });

    redo(editor);

    assert.deepEqual(readCounter(), {
      body: 'x'.repeat(40_000),
      count: 3,
    });
  });

  it('keeps state-only history replay from restoring editor selection', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: true,
    });
    const editor = createEditor({
      extensions: [history(), documentTitle],
      initialValue: {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q2 Plan' },
      },
    });
    const selectionBeforeTitleChange = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    } satisfies Range;
    const currentSelection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    } satisfies Range;

    editor.update((tx) => {
      tx.selection.set(selectionBeforeTitleChange);
    });
    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });
    editor.update((tx) => {
      tx.selection.set(currentSelection);
    });

    undo(editor);

    const undoCommit = Editor.getLastCommit(editor);
    assert.deepEqual(
      editor.read((state) => state.selection.get()),
      currentSelection
    );
    assert.deepEqual(undoCommit?.operations, []);
    assert.deepEqual(undoCommit?.metadata.selection, {
      dom: 'preserve',
      focus: false,
      scroll: false,
    });
  });

  it('undoes and redoes root-scoped edits while rebasing rootless refs', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let ref: ReturnType<typeof Editor.rangeRef>;

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      ref = Editor.rangeRef(runtime.editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      tx.text.insert('!');
    });

    assert.deepEqual(ref!.current, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });

    undo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 6, root: 'header' },
        focus: { path: [0, 0], offset: 6, root: 'header' },
      }
    );
    assert.deepEqual(ref!.current, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });

    redo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(ref!.current, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
  });

  it('redoes non-main structural selection operations in the active root', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.nodes.insert(paragraph('new'), { at: [1], select: true });
    });

    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      {
        anchor: { path: [1, 0], offset: 3, root: 'header' },
        focus: { path: [1, 0], offset: 3, root: 'header' },
      }
    );

    undo(headerEditor);
    redo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header'), paragraph('new')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      {
        anchor: { path: [1, 0], offset: 3, root: 'header' },
        focus: { path: [1, 0], offset: 3, root: 'header' },
      }
    );
  });
});
