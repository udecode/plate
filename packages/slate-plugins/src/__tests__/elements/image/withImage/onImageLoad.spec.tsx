/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { IMAGE, onImageLoad } from 'elements';

const input = (
  <editor>
    <p>test</p>
  </editor>
) as any;

const reader = {
  result: 'test.png',
};

const output = (
  <editor>
    <p>test</p>
    <element type={IMAGE} url="test.png">
      <text />
    </element>
  </editor>
) as any;

it('should be', () => {
  onImageLoad(input, reader as any)();
  expect(input.children).toEqual(output.children);
});
