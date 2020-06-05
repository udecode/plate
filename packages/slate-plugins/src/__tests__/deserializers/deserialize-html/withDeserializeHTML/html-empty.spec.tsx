/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeserializeHTML } from 'deserializers/deserialize-html';
import { BoldPlugin } from 'marks/bold';
import { Editor } from 'slate';
import { withReact } from 'slate-react';

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
  getData: () => '<html></html>',
};

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should do nothing', () => {
  const editor = withDeserializeHTML({ plugins: [BoldPlugin()] })(
    withReact(input)
  );

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
