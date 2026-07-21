import { createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { duplicateBlockSelectionNodes } from './duplicateBlockSelectionNodes';

describe('duplicateBlockSelectionNodes', () => {
  it('duplicates selected blocks through the editor update transaction', () => {
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
    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .getOption('selectedIds');

    editor.update((tx, context) => {
      duplicateBlockSelectionNodes(editor, tx, context);
    });

    expect(editor.read.children()).toEqual([
      {
        id: 'block1',
        children: [{ text: 'One' }],
        type: 'p',
      },
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
    ]);
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).not.toBe(selectedIds);
  });

  it('does not schedule plugin state after a rolled-back duplicate', async () => {
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
      .setOption('selectedIds', new Set(['block1']));
    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .getOption('selectedIds');

    expect(() =>
      editor.update((tx, context) => {
        duplicateBlockSelectionNodes(editor, tx, context);
        throw new Error('rollback');
      })
    ).toThrow('rollback');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(editor.read.children()).toHaveLength(1);
    expect(editor.plugin(BlockSelectionPlugin).getOption('selectedIds')).toBe(
      selectedIds
    );
  });
});
