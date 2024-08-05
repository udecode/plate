/** @jsx jsx */

import { createPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

import { withImageEmbed } from './withImageEmbed';

jsx;

describe('withImageEmbed', () => {
  const input = (
    <editor>
      <hp>test</hp>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hp>test</hp>
      <himg url="https://i.imgur.com/removed.png">
        <htext />
      </himg>
    </editor>
  ) as any;

  it('should insert image from the text', () => {
    const editor = withImageEmbed(withReact(input), createPlugin());

    const data = {
      getData: () => 'https://i.imgur.com/removed.png',
    };
    editor.insertData(data as any);

    expect(input.children).toEqual(output.children);
  });
});
