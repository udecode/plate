/** @jsx jsx */

import { getPluginContext } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { ImagePlugin } from './ImagePlugin';
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
    const editor = withImageEmbed(
      getPluginContext(createPlateEditor({ editor: input }), ImagePlugin.key)
    );

    const data = {
      getData: () => 'https://i.imgur.com/removed.png',
    };
    editor.insertData(data as any);

    expect(input.children).toEqual(output.children);
  });
});
