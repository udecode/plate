/** @jsx jsx */

import { onKeyDownExitBreak } from '@/packages/break/src/exit-break/onKeyDownExitBreak';
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
  onKeyDownExitBreak(input, mockPlugin())(event);
  expect(input.children).toEqual(output.children);
});
