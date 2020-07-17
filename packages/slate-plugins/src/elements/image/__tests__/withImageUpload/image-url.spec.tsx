/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_IMAGE, withImageUpload } from '../../../index';

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>test</hp>
    <element type={ELEMENT_IMAGE} url="https://i.imgur.com/removed.png">
      <htext />
    </element>
  </editor>
) as any;

it('should insert image from the text', () => {
  const editor = withImageUpload()(withReact(input));

  const data = {
    getData: () => 'https://i.imgur.com/removed.png',
  };
  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
