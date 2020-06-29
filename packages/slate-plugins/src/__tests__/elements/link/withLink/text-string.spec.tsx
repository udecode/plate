/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../../__test-utils__/jsx';
import { withLink } from '../../../../elements';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const text = 'test';

const output = (
  <editor>
    <hp>testtest</hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(withReact(input));

  editor.insertText(text);

  expect(input.children).toEqual(output.children);
});
