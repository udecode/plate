/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { IMAGE, withImage } from 'elements';
import { withReact } from 'slate-react';

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>test</hp>
    <element type={IMAGE} url="https://i.imgur.com/removed.png">
      <htext />
    </element>
  </editor>
) as any;

it('should insert image from the text', () => {
  const editor = withImage()(withReact(input));

  const data = {
    getData: () => 'https://i.imgur.com/removed.png',
  };
  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
