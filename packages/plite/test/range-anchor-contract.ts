import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  type Anchor,
  type Element,
  type Range,
} from '@platejs/plite';
import {
  getChildren as editorGetChildren,
  replace as editorReplace,
} from '@platejs/plite/internal';

import { createRangeAnchor } from './support/anchor';

const createChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createNestedChildren = (): Element[] => [
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

describe('plite range anchor contract', () => {
  it('publishes range anchor updates at transaction commit', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });

      assert.deepEqual(anchor.resolve(), {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('uses inward range association', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('rebases range anchor paths when top-level blocks move', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });

    editor.update((tx) => {
      tx.nodes.move({
        at: [0],
        to: [2],
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('rebases range anchors inside the moved top-level block when moveNodes targets a later slot', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    editor.update((tx) => {
      tx.nodes.move({
        at: [0],
        to: [2],
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 4 },
    });
  });

  it('rebases nested range anchor paths when nested blocks move', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 1, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 3 },
    });

    editor.update((tx) => {
      tx.nodes.move({
        at: [0, 0],
        to: [0, 2],
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0], offset: 3 },
    });
  });

  it('keeps public range anchors alive when an invalidating transaction discards its draft', () => {
    const editor = createEditor();
    const children = createChildren();

    editorReplace(editor, {
      children,
      selection: null,
    });

    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    assert.throws(() => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        throw new Error('discard');
      });
    }, /discard/);

    assert.deepEqual(editorGetChildren(editor), children);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('keeps rootless non-main range anchors public while rebasing in their view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: createChildren(),
        roots: { header: createChildren() },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let anchor: Anchor<Range> | undefined;

    headerEditor.update((tx) => {
      anchor = createRangeAnchor(headerEditor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      });
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    assert.deepEqual(anchor!.resolve(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.deepEqual(anchor!.release(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('keeps explicit non-main range anchor roots visible after rebasing', () => {
    const editor = createEditor({
      initialValue: {
        children: createChildren(),
        roots: { header: createChildren() },
      },
    });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 4, root: 'header' },
    });

    editor.update((tx) => {
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0, root: 'header' },
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 2, root: 'header' },
      focus: { path: [0, 0], offset: 5, root: 'header' },
    });
  });

  it('removes range anchors only when a matching-root change deletes them', () => {
    const runtime = createEditor({
      initialValue: {
        children: createChildren(),
        roots: { header: createChildren() },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    let anchor: Anchor<Range> | undefined;

    headerEditor.update((_tx) => {
      anchor = createRangeAnchor(headerEditor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      });
    });
    mainEditor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(anchor!.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    headerEditor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.equal(anchor!.resolve(), null);
  });
});
