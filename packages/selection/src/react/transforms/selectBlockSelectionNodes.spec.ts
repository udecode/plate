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
    }) as any;

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    selectBlockSelectionNodes(editor);

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set());
  });
});
