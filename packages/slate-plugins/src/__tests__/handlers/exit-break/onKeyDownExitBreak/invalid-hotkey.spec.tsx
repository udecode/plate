/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { onKeyDownExitBreak } from '../../../../handlers/exit-break';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  onKeyDownExitBreak()(event, input);
  expect(input.children).toEqual(output.children);
});
