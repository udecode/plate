/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_IMAGE, onImageLoad } from '../../../index';

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const reader = {
  result: 'test.png',
};

const output = (
  <editor>
    <hp>test</hp>
    <element type={ELEMENT_IMAGE} url="test.png">
      <htext />
    </element>
  </editor>
) as any;

it('should be', () => {
  onImageLoad(input, reader as any)();
  expect(input.children).toEqual(output.children);
});
