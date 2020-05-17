/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withLink } from 'elements';
import { withReact } from 'slate-react';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const text = 'http://localhost:3000';

const output = (
  <editor>
    <hp>
      test
      <element type="a" url="http://localhost:3000">
        http://localhost:3000
      </element>
      <htext />
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(withReact(input));

  editor.insertText(text);

  expect(input.children).toEqual(output.children);
});
