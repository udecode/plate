import { createBasePlateEditor, KEYS } from 'platejs';

import { setMediaNode } from './setMediaNode';

describe('setMediaNode', () => {
  it('updates the media node through editor.update', () => {
    const editor = createBasePlateEditor({
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.img,
          url: 'https://platejs.org/old.png',
        },
      ],
    } as any);

    setMediaNode(
      editor,
      {
        type: 'img',
        url: 'https://platejs.org/image.png',
        width: 320,
      },
      { at: [0] }
    );

    expect(editor.children[0]).toMatchObject({
      type: 'img',
      url: 'https://platejs.org/image.png',
      width: 320,
    });
  });
});
