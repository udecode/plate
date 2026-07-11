import { createPlateEditor } from '@platejs/core/react';

import { removeBlocksAndFocus } from './removeBlocksAndFocus';

describe('removeBlocksAndFocus', () => {
  it('removes the block range and focuses the editor', () => {
    const editor = createPlateEditor();
    editor.update.nodes.insert(
      [
        { children: [{ text: 'a' }], id: 'a', type: 'p' },
        { children: [{ text: 'b' }], id: 'b', type: 'p' },
      ],
      { at: [0] }
    );
    spyOn(editor.api.dom, 'focus').mockImplementation(() => {});

    removeBlocksAndFocus(editor, { at: [] });

    expect(editor.read.children().some((node) => node.id)).toBe(false);
  });
});
