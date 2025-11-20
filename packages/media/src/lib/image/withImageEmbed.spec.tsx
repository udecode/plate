/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor } from 'platejs';
import { createSlateEditor } from 'platejs';

import { BaseImagePlugin } from './BaseImagePlugin';

jsxt;

describe('withImageEmbed', () => {
  const input = createEditor(
    (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any
  );

  const output = (
    <editor>
      <hp>test</hp>
      <himg url="https://i.imgur.com/removed.png">
        <htext />
      </himg>
    </editor>
  ) as any;

  it('should insert image from the text', () => {
    const editor = createSlateEditor({
      editor: input,
      plugins: [BaseImagePlugin],
    });

    const data = {
      getData: () => 'https://i.imgur.com/removed.png',
    };
    editor.tf.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});
