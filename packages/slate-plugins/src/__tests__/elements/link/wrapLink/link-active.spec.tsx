/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withLink, wrapLink } from 'elements';
import { withReact } from 'slate-react';

const input = (
  <editor>
    <hp>
      test
      <element type="a" url="http://localhost:3000">
        <anchor />
        http://localhost:3000
        <focus />
      </element>
      <htext />
    </hp>
  </editor>
) as any;

const url = 'http://localhost:5000';

const output = (
  <editor>
    <hp>
      test
      <element type="a" url="http://localhost:5000">
        http://localhost:3000
      </element>
      <htext />
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(withReact(input));

  wrapLink(editor, url);

  expect(input.children).toEqual(output.children);
});
