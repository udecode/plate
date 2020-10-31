/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { MARK_BOLD } from '../../../../marks/bold/defaults';
import { getOnHotkeyToggleMark } from '../../../utils/getOnHotkeyToggleMark';

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
  getOnHotkeyToggleMark({ type: MARK_BOLD, hotkey: 'enter' })?.(event, input);
  expect(input.children).toEqual(output.children);
  expect(input.selection).toEqual(output.selection);
});
