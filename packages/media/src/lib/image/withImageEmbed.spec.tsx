/** @jsx jsxt */

import { createEditor } from '@udecode/plate';
import { createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

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
      getData: () => {
        return 'https://i.imgur.com/removed.png';
      },
    };
    editor.tf.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});
