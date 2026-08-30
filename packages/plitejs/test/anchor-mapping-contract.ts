import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant, type Element } from 'plitejs';

import {
  replace as editorReplace,
  string as editorString,
} from '../src/internal';
import { createRangeAnchor } from './support/anchor';
import { extendTestSchema } from './support/schema';

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

const createSplitChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
];

const createMergeChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createMoveChildren = (): Element[] => [
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
  kind: 'text',
  anchor,
  focus,
});

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('plite anchor mapping contract', () => {
  it('round-trips an anchor on an unchanged snapshot', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const range = createRange(
      { path: [0, 0], offset: 1 },
      { path: [0, 0], offset: 4 }
    );
    const anchor = createRangeAnchor(editor, range);

    assert.deepEqual(anchor.resolve(), range);
    assert.deepEqual(anchor.release(), range);
  });

  it('creates anchors from a selection read', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const selection = editor.read.selection();

    assert.ok(selection);
    const anchor = createRangeAnchor(editor, selection);

    editor.update((tx) => {
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    assert.deepEqual(anchor.release(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('maps through text inserted before the anchor range without mounted DOM', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createSplitChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );
    editor.update((tx) => {
      tx.text.insert('>', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.equal(editorString(editor, anchor.resolve()!), 'lph');
  });

  it('defaults anchor boundary behavior inward for annotation-style anchors', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createSplitChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    assert.equal(editorString(editor, anchor.resolve()!), 'lph');
  });

  it('survives splitNodes block splitting across a anchored text span', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createSplitChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.nodes.split({
        at: { path: [0, 0], offset: 2 },
      });
    });

    const resolved = anchor.resolve();

    assert.ok(resolved);
    assert.equal(editorString(editor, resolved), 'lph');
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
  });

  it('survives merging the anchored block container', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createMergeChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(
      editor,
      createRange({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });

    const resolved = anchor.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 8 },
    });
    assert.equal(editorString(editor, resolved), 'et');
  });

  it('survives moving the containing block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createMoveChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(
      editor,
      createRange({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    const resolved = anchor.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(editorString(editor, resolved), 'et');
  });

  it('survives fragment insertion that preserves the anchored text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createSplitChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(
      editor,
      createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
    );

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      tx.fragment.replace([
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

    const resolved = anchor.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [1, 0], offset: 8 },
      focus: { path: [1, 0], offset: 11 },
    });
    assert.equal(editorString(editor, resolved), 'lph');
  });

  it('preserves an explicit anchor root through root replacement', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('head')] },
      },
    });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 2, root: 'header' },
      focus: { path: [0, 0], offset: 2, root: 'header' },
    });

    editor.update((tx) => {
      tx.roots.replace('header', [paragraph('head!')]);
    });
    editor.update((tx) => {
      tx.text.insert('X', {
        at: { path: [0, 0], offset: 0, root: 'header' },
      });
    });

    assert.deepEqual(anchor.release(), {
      anchor: { path: [0, 0], offset: 3, root: 'header' },
      focus: { path: [0, 0], offset: 3, root: 'header' },
    });
    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('Xhead!')] },
      }
    );
  });

  it('rebases across normalization-driven spacer insertion', () => {
    const editor = createEditor();
    extendTestSchema(editor, { inline: { inline: true } });

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [{ text: 'gamma' }],
        },
      ],
      selection: null,
    });

    const anchor = createRangeAnchor(
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

    const resolved = anchor.resolve();

    assert.ok(resolved);
    assert.deepEqual(resolved, {
      anchor: { path: [0, 2], offset: 1 },
      focus: { path: [0, 2], offset: 4 },
    });
    assert.equal(editorString(editor, resolved), 'amm');
  });

  it('fails closed when the anchored content is fully deleted', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const anchor = createRangeAnchor(
      editor,
      createRange({ path: [1, 0], offset: 1 }, { path: [1, 0], offset: 3 })
    );

    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.equal(anchor.resolve(), null);
  });
});
