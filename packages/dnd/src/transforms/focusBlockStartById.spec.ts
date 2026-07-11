import { createBaseEditor } from '@platejs/core';

import { focusBlockStartById } from './focusBlockStartById';

describe('focusBlockStartById', () => {
  it('does nothing when the block cannot be found', () => {
    const editor = createBaseEditor();
    const focus = spyOn(editor.api.dom, 'focus').mockImplementation(() => {});

    focusBlockStartById(editor, 'missing');

    expect(editor.read.selection()).toBeNull();
    expect(focus).not.toHaveBeenCalled();
  });

  it('selects the block start and focuses the editor', () => {
    const editor = createBaseEditor({
      value: [{ children: [{ text: 'block' }], id: 'a', type: 'p' }],
    });
    spyOn(editor.api.dom, 'focus').mockImplementation(() => {});

    focusBlockStartById(editor, 'a');

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
