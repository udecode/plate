import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';

import { createEditor, type Descendant } from '../src';
import { setEditorTargetRuntime } from '../src/internal';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const setupEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [paragraph('one'), paragraph('two')],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  return editor;
};

describe('editor methods', () => {
  it('applies marks through the transaction-resolved implicit target', () => {
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
      tx.marks.add('bold', true);
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      {
        type: 'paragraph',
        children: [{ text: 'two', bold: true }],
      },
    ]);
  });

  it('removes marks through the transaction-resolved implicit target', () => {
    const editor = createEditor();
    let calls = 0;

    Editor.replace(editor, {
      children: [
        paragraph('one'),
        {
          type: 'paragraph',
          children: [{ text: 'two', bold: true }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
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
      tx.marks.remove('bold');
    });

    assert.equal(calls, 1);
    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('two'),
    ]);
  });

  it('toggles marks from the transaction-resolved implicit target', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one', bold: true }],
        },
        paragraph('two'),
      ],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };
      },
    });

    editor.update((tx) => {
      tx.marks.toggle('bold', true);
    });

    assert.deepEqual(Editor.getChildren(editor), [
      {
        type: 'paragraph',
        children: [{ text: 'one', bold: true }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two', bold: true }],
      },
    ]);
  });
});
