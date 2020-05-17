/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { toggleCode } from 'elements';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hcode>
      <hp>
        test
        <cursor />
      </hp>
    </hcode>
  </editor>
) as any;

it('should be', () => {
  toggleCode(input);

  expect(input.children).toEqual(output.children);
});
