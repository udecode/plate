import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';
import { createEditor, type Descendant } from '../src';
import { extendTestSchema } from './support/schema';

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

const createSplitChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
];

const createMergeChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createMoveChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createRange = (
  anchor: { path: number[]; offset: number },
  focus: { path: number[]; offset: number }
) => ({
  anchor,
  focus,
});

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('slate bookmark contract', () => {
  it('round-trips a bookmark on an unchanged snapshot and hides its backing range ref', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
      marks: null,
    });

    const range = createRange(
      { path: [0, 0], offset: 1 },
      { path: [0, 0], offset: 4 }
    );
    const bookmark = Editor.bookmark(editor, range);

    assert.equal(Editor.rangeRefs(editor).size, 0);
    assert.deepEqual(bookmark.resolve(), range);
    assert.deepEqual(bookmark.unref(), range);
  });

  it('exposes bookmarks through the public read state range group', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createChildren(),
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      },
      marks: null,
    });

    const bookmark = editor.read((state) => {
      const selection = state.selection.get();

      assert.ok(selection);

      return state.ranges.bookmark(selection, { affinity: 'inward' });
    });

    editor.update((tx) => {
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    assert.deepEqual(bookmark.unref(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('maps through text inserted before the anchor range without mounted DOM', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createSplitChildren(),
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    assert.deepEqual(bookmark.resolve(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.equal(Editor.string(editor, bookmark.resolve()!), 'lph');
  });

  it('defaults bookmark boundary behavior inward for annotation-style anchors', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createSplitChildren(),
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(bookmark.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    assert.equal(Editor.string(editor, bookmark.resolve()!), 'lph');
  });

  it('survives splitNodes block splitting across a bookmarked text span', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createSplitChildren(),
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.nodes.split({
        at: { path: [0, 0], offset: 2 },
      });
    });

    const resolved = bookmark.resolve();

    assert.ok(resolved);
    assert.equal(Editor.string(editor, resolved), 'lph');
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
  });

  it('survives merge_node of the bookmarked block container', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createMergeChildren(),
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    editor.update((tx) => {
      tx.operations.replay([
        {
          type: 'merge_node',
          path: [1],
          position: 1,
          properties: { type: 'paragraph' },
        },
      ]);
    });

    const resolved = bookmark.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 3 },
    });
    assert.equal(Editor.string(editor, resolved), 'et');
  });

  it('survives move_node of the containing block', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createMoveChildren(),
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    const resolved = bookmark.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(Editor.string(editor, resolved), 'et');
  });

  it('survives replace_children when fragment insertion preserves the bookmarked text', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createSplitChildren(),
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      tx.fragment.insert([
        {
          type: 'paragraph',
          children: [{ text: 'intro-a' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'intro-b' }],
        },
      ]);
    });

    const resolved = bookmark.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [1, 0], offset: 8 },
      focus: { path: [1, 0], offset: 11 },
    });
    assert.equal(Editor.string(editor, resolved), 'lph');
  });

  it('preserves an explicit bookmark root through replace_children', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('head')] },
      },
    });
    const bookmark = Editor.bookmark(editor, {
      anchor: { path: [0, 0], offset: 2, root: 'header' },
      focus: { path: [0, 0], offset: 2, root: 'header' },
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          children: [paragraph('head')],
          index: 0,
          newChildren: [paragraph('head!')],
          newSelection: null,
          path: [],
          root: 'header',
          selection: null,
          type: 'replace_children',
        },
      ]);
    });
    editor.update((tx) => {
      tx.text.insert('X', {
        at: { path: [0, 0], offset: 0, root: 'header' },
      });
    });

    assert.deepEqual(bookmark.unref(), {
      anchor: { path: [0, 0], offset: 3, root: 'header' },
      focus: { path: [0, 0], offset: 3, root: 'header' },
    });
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('Xhead!')] },
      }
    );
  });

  it('rebases across normalization-driven spacer insertion', () => {
    const editor = createEditor();
    extendTestSchema(editor, { type: 'inline', inline: true });

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          children: [{ text: 'gamma' }],
        },
      ],
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.nodes.insert(
        {
          type: 'inline',
          children: [{ text: 'beta' }],
        } as Descendant,
        { at: [0, 0] }
      );
    });

    const resolved = bookmark.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 2], offset: 1 },
      focus: { path: [0, 2], offset: 4 },
    });
    assert.equal(Editor.string(editor, resolved), 'amm');
  });

  it('fails closed when the bookmarked content is fully deleted', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
      marks: null,
    });

    const bookmark = Editor.bookmark(
      editor,
      createRange({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.equal(bookmark.resolve(), null);
  });
});
