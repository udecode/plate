import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Descendant,
} from '../src';

const createChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createNestedChildren = (): Descendant[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ],
  },
];

describe('slate range ref contract', () => {
  it('publishes range ref updates at transaction commit', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });

      assert.deepEqual(ref.current, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('defaults rangeRef affinity inward', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('rebases range ref paths when top-level blocks move', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });

    editor.update((tx) => {
      tx.nodes.move({
        at: [0],
        to: [2],
      });
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('rebases range refs inside the moved top-level block when moveNodes targets a later slot', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.nodes.move({
        at: [0],
        to: [2],
      });
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 4 },
    });
  });

  it('rebases nested range ref paths when nested blocks move', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 1, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 3 },
    });

    editor.update((tx) => {
      tx.nodes.move({
        at: [0, 0],
        to: [0, 2],
      });
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0], offset: 3 },
    });
  });

  it('rebases range refs across split_node text branches', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'Hello World' }],
        },
      ],
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 7 },
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          type: 'split_node',
          path: [0, 0],
          position: 4,
          properties: {},
        },
      ]);
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 1], offset: 3 },
    });
  });

  it('rebases range refs through merge_node into the surviving text branch', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: '1' },
            { bold: true, text: '2' },
            { italic: true, text: '3' },
          ],
        },
      ],
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 2], offset: 1 },
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          type: 'merge_node',
          path: [0, 1],
          position: 1,
          properties: { bold: true },
        },
      ]);
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    });
  });

  it('keeps public range refs alive when an invalidating transaction rolls back', () => {
    const editor = createEditor();
    const children = createChildren();

    Editor.replace(editor, {
      children,
      selection: null,
      marks: null,
    });

    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    assert.throws(() => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        throw new Error('rollback');
      });
    }, /rollback/);

    assert.deepEqual(Editor.getChildren(editor), children);
    assert.equal(Editor.rangeRefs(editor).size, 1);
    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('keeps rootless non-main range refs public while rebasing in their view root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: createChildren(),
        roots: { header: createChildren() },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let ref: ReturnType<typeof Editor.rangeRef>;

    headerEditor.update((tx) => {
      ref = Editor.rangeRef(runtime.editor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      });
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    assert.deepEqual(ref!.current, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.deepEqual(ref!.unref(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('keeps explicit non-main range ref roots visible after rebasing', () => {
    const editor = createEditor({
      initialValue: {
        children: createChildren(),
        roots: { header: createChildren() },
      },
    });
    const ref = Editor.rangeRef(editor, {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 4, root: 'header' },
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          offset: 0,
          path: [0, 0],
          root: 'header',
          text: '>',
          type: 'insert_text',
        },
      ]);
    });

    assert.deepEqual(ref.current, {
      anchor: { path: [0, 0], offset: 2, root: 'header' },
      focus: { path: [0, 0], offset: 5, root: 'header' },
    });
  });

  it('removes range refs only when a matching-root operation deletes them', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: createChildren(),
        roots: { header: createChildren() },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    let ref: ReturnType<typeof Editor.rangeRef>;

    headerEditor.update(() => {
      ref = Editor.rangeRef(runtime.editor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      });
    });
    mainEditor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(ref!.current, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    headerEditor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.equal(ref!.current, null);
  });
});
