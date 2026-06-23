import { createBasePlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { duplicateBlockSelectionNodes } from './duplicateBlockSelectionNodes';

describe('duplicateBlockSelectionNodes', () => {
  it('duplicates selected blocks through the editor update transaction', () => {
    const editor = createBasePlateEditor({
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

    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['block1']));

    const update = editor.update;
    const updateSpy = mock((callback: (tx: unknown) => unknown) =>
      update(callback)
    );

    editor.update = updateSpy;

    duplicateBlockSelectionNodes(editor);

    expect(updateSpy).toHaveBeenCalled();
    expect(editor.children).toEqual([
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
