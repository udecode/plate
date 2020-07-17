/** @jsx jsx */

import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { jsx } from '../../../../__test-utils__/jsx';
import { HeadingPlugin } from '../../../../elements/heading/index';
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
  getData: () => '<html><body><h1>inserted</h1></body></html>',
};

const output = (
  <editor>
    <hh1>
      testinserted
      <cursor />
    </hh1>
  </editor>
) as any;

it('should do nothing', () => {
  const editor = withDeserializeHTML({ plugins: [HeadingPlugin()] })(
    withReact(input)
  );

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
