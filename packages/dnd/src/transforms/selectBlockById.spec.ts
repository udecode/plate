import { createBaseEditor } from '@platejs/core';

import { selectBlockById } from './selectBlockById';

describe('selectBlockById', () => {
  it('does nothing when the block cannot be found', () => {
    const editor = createBaseEditor();
    const focus = spyOn(editor.api.dom, 'focus').mockImplementation(() => {});

    selectBlockById(editor, 'missing');

    expect(editor.read.selection()).toBeNull();
    expect(focus).not.toHaveBeenCalled();
  });

  it('selects the block range and focuses the editor', () => {
    const editor = createBaseEditor({
      value: [{ children: [{ text: 'block' }], id: 'a', type: 'p' }],
    });
    spyOn(editor.api.dom, 'focus').mockImplementation(() => {});

    selectBlockById(editor, 'a');

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
  });
});
