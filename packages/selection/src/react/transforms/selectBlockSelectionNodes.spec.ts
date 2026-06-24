import { createBasePlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectBlockSelectionNodes } from './selectBlockSelectionNodes';

describe('selectBlockSelectionNodes', () => {
  it('sets the editor selection through the editor update transaction', () => {
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

    selectBlockSelectionNodes(editor);

    expect(updateSpy).toHaveBeenCalled();
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(editor.getOption(BlockSelectionPlugin, 'selectedIds')).toEqual(
      new Set()
    );
  });
});
