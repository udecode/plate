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
    }) as any;

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    duplicateBlockSelectionNodes(editor);

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
  });
});
