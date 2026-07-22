import { BaseBasicBlocksPlugin } from '@platejs/basic-nodes';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseImagePlugin } from '@platejs/media';
import { BaseTogglePlugin } from '@platejs/toggle';
import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { ListKit } from '@/registry/components/editor/plugins/list-kit';

describe('ListKit current contract', () => {
  it('promotes `- ` into a list item and moves selection into the empty item', () => {
    const editor = createPlateEditor({
      nodeId: true,
      plugins: [
        BaseParagraphPlugin,
        BaseBasicBlocksPlugin,
        BaseCodeBlockPlugin,
        BaseTogglePlugin,
        BaseImagePlugin,
        ...ListKit,
      ],
      initialValue: [{ children: [{ text: '-' }], type: 'p' }],
    });

    editor.update.selection.set({
      kind: 'text',
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
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
