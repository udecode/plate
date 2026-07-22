import { createBaseEditor } from '@platejs/core';

import { BaseImagePlugin } from '../../image/BaseImagePlugin';
import { setMediaNode } from './setMediaNode';

describe('setMediaNode', () => {
  it('sets media props through the update boundary', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'img',
          url: 'https://platejs.org/old.png',
        },
      ],
    });

    setMediaNode(
      editor,
      {
        type: 'img',
        url: 'https://platejs.org/image.png',
        width: 320,
      },
      { at: [0] }
    );

    expect(editor.read.children()[0]).toMatchObject({
      type: 'img',
      url: 'https://platejs.org/image.png',
      width: 320,
    });
  });
});
