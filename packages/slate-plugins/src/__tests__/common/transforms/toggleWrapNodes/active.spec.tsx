/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { toggleWrapNodes } from 'common/transforms/toggleWrapNodes';
import { CODE_BLOCK } from 'elements';

const input = (
  <editor>
    <hcode>
      <hp>
        test
        <cursor />
      </hp>
    </hcode>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleWrapNodes(input, CODE_BLOCK);

  expect(input.children).toEqual(output.children);
});
