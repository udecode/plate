import { createPlateEditor } from '@platejs/core/react';

import { selectBlocksBySelectionOrId } from './selectBlocksBySelectionOrId';

describe('selectBlocksBySelectionOrId', () => {
  it('returns early when the editor has no selection', () => {
    const editor = createPlateEditor();
    const focus = spyOn(editor.api.dom, 'focus').mockImplementation(() => {});

    selectBlocksBySelectionOrId(editor, 'block-1');

    expect(editor.read.selection()).toBeNull();
    expect(focus).not.toHaveBeenCalled();
  });

  it('selects all selected blocks when the target is in the selection', () => {
    const editor = createPlateEditor({
      value: [
        { children: [{ text: 'one' }], id: 'block-1', type: 'p' },
        { children: [{ text: 'two' }], id: 'block-2', type: 'p' },
      ],
    });
    spyOn(editor.api.dom, 'focus').mockImplementation(() => {});
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [1, 0] },
    });

    selectBlocksBySelectionOrId(editor, 'block-2');

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
  });

  it('selects the target block when it is outside the selection', () => {
    const editor = createPlateEditor({
      value: [
        { children: [{ text: 'one' }], id: 'block-1', type: 'p' },
        { children: [{ text: 'two' }], id: 'block-2', type: 'p' },
      ],
    });
    spyOn(editor.api.dom, 'focus').mockImplementation(() => {});
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    selectBlocksBySelectionOrId(editor, 'block-2');

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
  });
});
