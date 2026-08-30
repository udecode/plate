import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Element } from 'plitejs';

import {
  getChildren as editorGetChildren,
  getLastCommit as editorGetLastCommit,
  replace as editorReplace,
  setEditorTargetRuntime,
} from '../src/internal';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const setupEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two')],
    selection: {
      kind: 'text' as const,
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
          kind: 'text' as const,
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
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          kind: 'text' as const,
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
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        return {
          kind: 'text' as const,
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

  it('classifies a same-shape child replacement by its canonical text delta', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
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
    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.equal(commit.changes.empty, false);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(commit.changed.has('text'), true);
  });

  it('replaces one node with many as one canonical change', () => {
    const editor = setupEditor();

    editor.update.nodes.replace(
      [paragraph('replacement-a'), paragraph('replacement-b')],
      { at: [1], select: true }
    );

    const selection = {
      kind: 'text' as const,

      anchor: { path: [2, 0], offset: 13 },
      focus: { path: [2, 0], offset: 13 },
    };

    assert.deepEqual(editorGetChildren(editor), [
      paragraph('one'),
      paragraph('replacement-a'),
      paragraph('replacement-b'),
    ]);
    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.equal(commit.changes.empty, false);
    assert.equal(commit.changed.has('root-order'), true);
    assert.deepEqual(commit.selectionAfter, selection);
  });

  it('replaces a live node target and ignores a detached target', () => {
    const editor = setupEditor();
    const target = editorGetChildren(editor)[1];

    editor.update((tx) => {
      tx.nodes.replace(paragraph('replacement'), { at: target });
    });

    assert.deepEqual(editorGetChildren(editor), [
      paragraph('one'),
      paragraph('replacement'),
    ]);

    editor.update.nodes.replace(paragraph('wrong'), {
      at: paragraph('detached'),
    });

    assert.deepEqual(editorGetChildren(editor), [
      paragraph('one'),
      paragraph('replacement'),
    ]);
  });

  it('replaces one node with zero nodes', () => {
    const editor = setupEditor();

    editor.update.nodes.replace([], { at: [1] });

    assert.deepEqual(editorGetChildren(editor), [paragraph('one')]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('rejects replacing the editor root', () => {
    const editor = setupEditor();

    assert.throws(
      () => editor.update.nodes.replace(paragraph('wrong'), { at: [] }),
      /Cannot replace the editor root/
    );
  });

  it('remaps replaceChildren selection when a selected node is reused', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    editorReplace(editor, {
      children: [{ type: 'quote', children: [{ text: 'Quote' }] }],
      selection,
    });

    const quote = editorGetChildren(editor)[0];
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
    assert.deepEqual(editor.read.selection(), newSelection);
  });

  it('clears replaceChildren selection when replaced content is not reused', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
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

    assert.equal(editor.read.selection(), null);
  });
});
