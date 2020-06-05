/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { onKeyDownSoftBreak } from 'handlers/soft-break';

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
  onKeyDownSoftBreak()(event, input);
  expect(input.children).toEqual(output.children);
});
