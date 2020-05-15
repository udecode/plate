/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeserializeHtml } from 'deserializers/deserialize-html';
import { HeadingPlugin } from 'elements/heading';
import { Editor } from 'slate';
import { withReact } from 'slate-react';

const input = ((
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any) as Editor;

// noinspection CheckTagEmptyBody
const data = {
  getData: () => '<html><body><iframe>inserted</iframe></body></html>',
};

const output = (
  <editor>
    <p>
      testinserted
      <cursor />
    </p>
  </editor>
) as any;

it('should do nothing', () => {
  const editor = withDeserializeHtml([HeadingPlugin()])(withReact(input));

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
