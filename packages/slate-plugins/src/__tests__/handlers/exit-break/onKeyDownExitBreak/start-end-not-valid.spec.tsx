/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import * as isHotkey from 'is-hotkey';
import { onKeyDownExitBreak } from '../../../../handlers/exit-break';

const input = (
  <editor>
    <hp>
      te
      <cursor />
      st
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownExitBreak({
    rules: [{ hotkey: 'enter', level: 0, query: { start: true, end: true } }],
  })(event, input);
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 2, path: [0, 0] });
});
