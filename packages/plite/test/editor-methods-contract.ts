import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getChildren as editorGetChildren,
  getOperations as editorGetOperations,
  replace as editorReplace,
} from '@platejs/plite/internal';

import { createEditor, type Element } from '@platejs/plite';
import { setEditorTargetRuntime } from '@platejs/plite/internal';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const setupEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
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
    assert.deepEqual(editorGetChildren(editor), [
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

    editorReplace(editor, {
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
    assert.deepEqual(editorGetChildren(editor), [
      paragraph('one'),
      paragraph('two'),
    ]);
  });

  it('toggles marks from the transaction-resolved implicit target', () => {
    const editor = createEditor();

    editorReplace(editor, {
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

    assert.deepEqual(editorGetChildren(editor), [
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

  it('replaces ancestor children as one logical replace_children operation', () => {
    const editor = createEditor();
    const selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };

    editorReplace(editor, {
      children: [
        {
          type: 'quote',
          children: [paragraph('one'), paragraph('two'), paragraph('three')],
        },
      ],
      selection,
    });

    editor.update.nodes.replaceChildren([paragraph('replacement')], {
      at: [0],
      count: 1,
      index: 1,
    });

    assert.deepEqual(editorGetChildren(editor), [
      {
        type: 'quote',
        children: [
          paragraph('one'),
          paragraph('replacement'),
          paragraph('three'),
        ],
      },
    ]);
    assert.deepEqual(editorGetOperations(editor).at(-1), {
      children: [paragraph('two')],
      index: 1,
      newChildren: [paragraph('replacement')],
      newSelection: selection,
      path: [0],
      root: 'main',
      selection,
      type: 'replace_children',
    });
  });

  it('remaps replaceChildren selection when a selected node is reused', () => {
    const editor = createEditor();
    const selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    editorReplace(editor, {
      children: [{ type: 'quote', children: [{ text: 'Quote' }] }],
      selection,
    });

    const quote = editorGetChildren(editor)[0] as Element;
    const text = quote.children[0];

    editor.update.nodes.replaceChildren(
      [{ type: 'paragraph', children: [text] }],
      {
        at: [0],
      }
    );

    const newSelection = {
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [0, 0, 0], offset: 2 },
    };

    assert.deepEqual(editorGetChildren(editor), [
      {
        type: 'quote',
        children: [{ type: 'paragraph', children: [text] }],
      },
    ]);
    assert.deepEqual(editorGetOperations(editor).at(-1), {
      children: [text],
      index: 0,
      newChildren: [{ type: 'paragraph', children: [text] }],
      newSelection,
      path: [0],
      root: 'main',
      selection,
      type: 'replace_children',
    });
  });

  it('clears replaceChildren selection when replaced content is not reused', () => {
    const editor = createEditor();
    const selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    editorReplace(editor, {
      children: [{ type: 'quote', children: [{ text: 'Quote' }] }],
      selection,
    });

    editor.update.nodes.replaceChildren([paragraph('replacement')], {
      at: [0],
    });

    assert.deepEqual(editorGetOperations(editor).at(-1), {
      children: [{ text: 'Quote' }],
      index: 0,
      newChildren: [paragraph('replacement')],
      newSelection: null,
      path: [0],
      root: 'main',
      selection,
      type: 'replace_children',
    });
  });
});
