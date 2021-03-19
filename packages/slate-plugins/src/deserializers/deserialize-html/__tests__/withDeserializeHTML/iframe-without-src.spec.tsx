/** @jsx jsx */

import { withInlineVoid } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { useMediaEmbedPlugin } from '../../../../elements/media-embed/useMediaEmbedPlugin';
import { withDeserializeHTML } from '../../useDeserializeHTMLPlugin';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

// noinspection CheckTagEmptyBody
const data = {
  getData: () => '<html><body><iframe>inserted</iframe></body></html>',
};

const output = (
  <editor>
    <hp>
      testinserted
      <cursor />
    </hp>
  </editor>
) as any;

describe('when inserting an iframe', () => {
  it('should do nothing', () => {
    const editor = withInlineVoid({})(
      withDeserializeHTML({ plugins: [useMediaEmbedPlugin()] })(
        withReact(input)
      )
    );

    editor.insertData(data as any);

    expect(input.children).toEqual(output.children);
  });
});
