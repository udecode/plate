/** @jsx jsx */

import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { jsx } from '../../../../__test-utils__/jsx';
import { withInlineVoid } from '../../../../common/plugins/inline-void/withInlineVoid';
import { withDeserializeHTML } from '../../../../deserializers/deserialize-html';
import { MediaEmbedPlugin } from '../../../../elements/media-embed';

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
