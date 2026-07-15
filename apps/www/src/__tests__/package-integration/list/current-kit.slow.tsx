import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { ListKit } from '@/registry/components/editor/plugins/list-kit';

describe('ListKit current contract', () => {
  it('promotes `- ` into a list item and moves selection into the empty item', () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, ...ListKit],
      value: [{ children: [{ text: '-' }], type: 'p' }],
    });

    editor.update.selection.set({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
    expect(editor.read.children()[0]).toHaveProperty('id');
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
