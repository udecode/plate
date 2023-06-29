/** @jsx jsx */

import { onKeyDownSoftBreak } from '@/packages/break/src/soft-break/onKeyDownSoftBreak';
import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown') as any;

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  onKeyDownSoftBreak(input, mockPlugin())(event);
  expect(input.children).toEqual(output.children);
});
