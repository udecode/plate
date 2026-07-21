import { createBaseEditor } from '@platejs/core';

import { BaseImagePlugin } from './BaseImagePlugin';

describe('withImageEmbed', () => {
  it('insert image from the text', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'p' }],
    });

    const data = {
      getData: () => 'https://i.imgur.com/removed.png',
    };
    editor.api.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: 'p' },
      {
        children: [{ text: '' }],
        type: 'img',
        url: 'https://i.imgur.com/removed.png',
      },
    ]);
  });
});
