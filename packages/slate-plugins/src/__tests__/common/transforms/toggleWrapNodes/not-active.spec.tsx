/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { toggleWrapNodes } from 'common/transforms/toggleWrapNodes';
import { CODE_BLOCK } from 'elements/code-block';

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
  toggleWrapNodes(input, CODE_BLOCK);

  expect(input.children).toEqual(output.children);
});
