import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import { createEditor, type Descendant } from '../src';

const paragraphWithEmptySuffixLeaves = (): Descendant => ({
  type: 'paragraph',
  children: [
    { text: 'This is editable ' },
    { bold: true, text: 'rich' },
    { text: ' text, ' },
    { italic: true, text: 'much' },
    { text: ' ' },
    { code: true, text: '' },
    { text: '' },
  ],
});

const paragraphWithPunctuationSuffixLeaf = (): Descendant => ({
  type: 'paragraph',
  children: [
    { text: 'This is editable ' },
    { code: true, text: '<textarea>' },
    { text: '!' },
  ],
});

describe('selection rebase contract', () => {
  it('rebases selection out of a removable empty marked leaf during destructive cleanup', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraphWithEmptySuffixLeaves()],
      selection: {
        anchor: { path: [0, 5], offset: 0 },
        focus: { path: [0, 5], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.delete({ reverse: true, unit: 'character' });
    });

    assert.equal(editorString(editor, [0]), 'This is editable rich text, much');
    assert.deepEqual(editorGetSelection(editor), {
      anchor: { path: [0, 3], offset: 4 },
      focus: { path: [0, 3], offset: 4 },
    });
  });

  it('rebases forward delete of a suffix leaf to the previous surviving point in the same block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        paragraphWithPunctuationSuffixLeaf(),
        {
          type: 'paragraph',
          children: [{ text: 'next paragraph' }],
        },
      ],
      selection: {
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.delete({ unit: 'character' });
    });

    assert.equal(editorString(editor, [0]), 'This is editable <textarea>');
    assert.deepEqual(editorGetSelection(editor), {
      anchor: { path: [0, 1], offset: '<textarea>'.length },
      focus: { path: [0, 1], offset: '<textarea>'.length },
    });
  });

  it('rebases selection to the previous inline when the selected leaf is removed', () => {
    const editor = createEditor();
    editor.extend({
      elements: [{ inline: true, type: 'link' }],
      name: 'selection-rebase-inline-link',
    });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            {
              type: 'link',
              children: [{ text: 'link' }],
            },
            { text: '' },
          ],
        } as Descendant,
      ],
      selection: {
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: [0, 2] });
    });

    assert.deepEqual(editorGetSelection(editor), {
      anchor: { path: [0, 1, 0], offset: 'link'.length },
      focus: { path: [0, 1, 0], offset: 'link'.length },
    });
  });

  it('rebases selection to the next top-level block when the selected block is removed', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'removed' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'survives' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(editorGetChildren(editor), [
      {
        type: 'paragraph',
        children: [{ text: 'survives' }],
      },
    ]);
    assert.deepEqual(editorGetSelection(editor), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('clears selection when the selected only top-level block is removed', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'removed' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(editorGetChildren(editor), []);
    assert.equal(editorGetSelection(editor), null);
  });
});
