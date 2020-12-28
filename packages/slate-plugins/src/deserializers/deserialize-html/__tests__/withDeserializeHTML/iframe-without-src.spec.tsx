/** @jsx jsx */

import { withInlineVoid } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { MediaEmbedPlugin } from '../../../../elements/media-embed/index';
import { withDeserializeHTML } from '../../index';

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

it('should do nothing', () => {
  const editor = withInlineVoid({})(
    withDeserializeHTML({ plugins: [MediaEmbedPlugin()] })(withReact(input))
  );

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
