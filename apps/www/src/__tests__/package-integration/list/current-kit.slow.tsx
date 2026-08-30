import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseCodeBlockPlugin,
  BaseParagraphPlugin,
  ElementIdPlugin,
} from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseImagePlugin } from 'platejs/media';
import { createEditor } from 'platejs/react';

import { ListKit } from '@/registry/components/editor/list';

describe('ListKit current contract', () => {
  it('promotes `- ` into a list item and moves selection into the empty item', () => {
    const editor = createEditor({
      plugins: [
        ElementIdPlugin,
        BaseParagraphPlugin,
        BaseBlockquotePlugin,
        BaseHeadingPlugin,

        BaseHorizontalRulePlugin,
        BaseCodeBlockPlugin,
        BaseDetailsPlugin,
        BaseImagePlugin,
        ...ListKit,
      ],
      initialValue: [{ children: [{ text: '-' }], type: 'paragraph' }],
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
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
    expect(editor.read.children()[0]).toHaveProperty('id');
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
