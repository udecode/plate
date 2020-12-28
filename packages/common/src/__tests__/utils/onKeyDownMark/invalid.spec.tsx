/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { MARK_BOLD } from '../../../../../slate-plugins/src/marks/bold/defaults';
import { getOnHotkeyToggleMark } from '../../../transforms/getOnHotkeyToggleMark';

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
