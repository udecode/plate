import { createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectBlockSelectionNodes } from './selectBlockSelectionNodes';

describe('selectBlockSelectionNodes', () => {
  it('sets the editor selection through the editor update transaction', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
        {
          id: 'block2',
          children: [{ text: 'Two' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update((tx) => {
      selectBlockSelectionNodes(editor, tx);
    });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set());
  });

  it('sets a range across all selected blocks', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
        {
          id: 'block2',
          children: [{ text: 'Two' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1', 'block2']));

    editor.update((tx) => {
      selectBlockSelectionNodes(editor, tx);
    });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set());
  });

  it('clears stale selected block ids even when no range is found', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['missing']));

    editor.update((tx) => {
      selectBlockSelectionNodes(editor, tx);
    });

    expect(editor.read.selection()).toBeNull();
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set());
  });
});
