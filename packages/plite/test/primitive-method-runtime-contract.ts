import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';
import { createEditor, type Descendant, NodeApi } from '../src';
import { setEditorTargetRuntime } from '../src/internal';
import { extendTestSchema } from './support/schema';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const quote = (text: string): Descendant => ({
  type: 'quote',
  children: [paragraph(text)],
});

const setupEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [paragraph('one'), paragraph('two')],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

const setupCollapsedEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [paragraph('one'), paragraph('two')],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  return editor;
};

const setupWrappedEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [quote('one'), quote('two')],
    selection: {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 3 },
    },
  });

  return editor;
};

const setupThreeBlockEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [paragraph('one'), paragraph('two'), paragraph('three')],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

const setupSplitTextEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'one' }, { text: 'two' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  return editor;
};

describe('primitive method runtime contract', () => {
  it('wrapNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'quote', children: [] } as never);
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      quote('two'),
    ]);
  });

  it('removeNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.remove();
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [paragraph('one')]);
  });

  it('splitNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupCollapsedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.split();
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('t'),
      paragraph('wo'),
    ]);
  });

  it('insertText uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupCollapsedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      tx.text.insert('X');
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('tXwo'),
    ]);
    assert.deepEqual(Editor.getSelection(editor), {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    });
  });

  it('insertText appends at the document end when selection is null and at is omitted', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: null,
      marks: null,
    });

    Editor.insertText(editor, '!');

    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('two!'),
    ]);
    assert.deepEqual(Editor.getSelection(editor), {
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    });
  });

  it('insertText keeps null selection when an explicit full-document range is used on a deselected editor', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: null,
      marks: null,
    });

    Editor.insertText(editor, 'replacement', {
      at: Editor.range(editor, []),
    });

    assert.deepEqual(Editor.getChildren(editor), [paragraph('replacement')]);
    assert.equal(Editor.getSelection(editor), null);
  });

  it('insertText in an empty block remains an operation commit, not a replacement', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('')],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('U');
    });

    const commit = Editor.getLastCommit(editor);

    assert.equal(Editor.string(editor, []), 'U');
    assert.deepEqual(commit?.classes, ['text']);
    assert.deepEqual(commit?.operations, [
      {
        offset: 0,
        path: [0, 0],
        text: 'U',
        type: 'insert_text',
      },
    ]);
  });

  it('insertText with active marks advances selection so follow-up text stays marked', () => {
    const editor = setupCollapsedEditor();
    let calls = 0;

    editor.update((tx) => {
      tx.marks.add('bold', true);
    });

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      tx.text.insert('M');
    });

    setEditorTargetRuntime(editor, null);

    editor.update((tx) => {
      tx.text.insert('ARK');
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      {
        type: 'paragraph',
        children: [{ text: 't' }, { bold: true, text: 'MARK' }, { text: 'wo' }],
      },
    ]);
    assert.deepEqual(Editor.getSelection(editor), {
      anchor: { path: [1, 1], offset: 4 },
      focus: { path: [1, 1], offset: 4 },
    });
  });

  it('insertText inherits consistent marks from a replaced selected range', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'hello ' },
            { bold: true, text: 'bold' },
            { text: ' text' },
          ],
        },
      ],
      marks: null,
      selection: {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 4 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('strong');
    });

    assert.deepEqual(Editor.getChildren(editor), [
      {
        type: 'paragraph',
        children: [
          { text: 'hello ' },
          { bold: true, text: 'strong' },
          { text: ' text' },
        ],
      },
    ]);
    assert.deepEqual(Editor.getSelection(editor), {
      anchor: { path: [0, 1], offset: 6 },
      focus: { path: [0, 1], offset: 6 },
    });
  });

  it('insertText with active marks ignores the transaction-resolved read-only target', () => {
    const editor = createEditor();
    let calls = 0;

    extendTestSchema(editor, { type: 'read-only', readOnly: true });

    Editor.replace(editor, {
      children: [
        paragraph('one'),
        {
          type: 'read-only',
          children: [{ text: 'two' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      marks: { bold: true },
    });

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      tx.text.insert('X');
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      {
        type: 'read-only',
        children: [{ text: 'two' }],
      },
    ]);
  });

  it('setNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.set({ type: 'heading-one' } as never);
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      { type: 'heading-one', children: [{ text: 'two' }] },
    ]);
  });

  it('unsetNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = createEditor();
    let calls = 0;

    Editor.replace(editor, {
      children: [
        paragraph('one'),
        { type: 'paragraph', align: 'center', children: [{ text: 'two' }] },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.unset('align' as never);
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('two'),
    ]);
  });

  it('delete uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.text.delete();
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph(''),
    ]);
  });

  it('insertFragment uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupCollapsedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      tx.fragment.insert([{ text: 'X' }]);
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('tXwo'),
    ]);
  });

  it('unwrapNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupWrappedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0, 0], offset: 0 },
          focus: { path: [1, 0, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.unwrap({
        match: (node) => NodeApi.isElement(node) && node.type === 'quote',
      });
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      quote('one'),
      paragraph('two'),
    ]);
  });

  it('liftNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupWrappedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0, 0], offset: 0 },
          focus: { path: [1, 0, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.lift({
        match: (node) => NodeApi.isElement(node) && node.type === 'paragraph',
      });
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      quote('one'),
      paragraph('two'),
    ]);
  });

  it('moveNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupThreeBlockEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.move({ to: [0] });
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('two'),
      paragraph('one'),
      paragraph('three'),
    ]);
  });

  it('mergeNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupSplitTextEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [0, 1], offset: 0 },
          focus: { path: [0, 1], offset: 0 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.merge({ match: (node) => NodeApi.isText(node) });
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      {
        type: 'paragraph',
        children: [{ text: 'onetwo' }],
      },
    ]);
  });

  it('insertNodes uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupCollapsedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.insert({ text: 'X' });
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      {
        type: 'paragraph',
        children: [{ text: 't' }, { text: 'X' }, { text: 'wo' }],
      },
    ]);
  });

  it('insertBreak uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupCollapsedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      Editor.insertBreak(editor);
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('t'),
      paragraph('wo'),
    ]);
  });

  it('deleteBackward uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      Editor.deleteBackward(editor, 'character');
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('wo'),
    ]);
  });

  it('deleteForward uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        };
      },
    });

    editor.update((tx) => {
      Editor.deleteForward(editor, 'character');
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('to'),
    ]);
  });

  it('deleteFragment uses the transaction target when at is omitted inside editor.update', () => {
    const editor = setupCollapsedEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      Editor.deleteFragment(editor);
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph(''),
    ]);
  });
});
