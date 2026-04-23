import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { ListKit } from '@/registry/components/editor/plugins/list-kit';

describe('ListKit current contract', () => {
  it('promotes `- ` into a list item and moves selection into the empty item', () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, ...ListKit],
      value: [{ children: [{ text: '-' }], type: 'p' }],
    } as any);

    editor.tf.select({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    editor.tf.insertText(' ');

    expect(editor.children).toEqual([
      {
        children: [{ text: '' }],
        id: editor.children[0].id,
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
