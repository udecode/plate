/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { onKeyDownMark } from 'mark';
import { MARK_BOLD } from 'marks/bold';

const input = (
  <editor>
    <hp>
      t<anchor />
      est
      <focus />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>
      t<anchor />
      est
      <focus />
    </hp>
  </editor>
) as any;

it('should be', () => {
  onKeyDownMark(MARK_BOLD, 'enter')(event, input);
  expect(input.children).toEqual(output.children);
  expect(input.selection).toEqual(output.selection);
});
