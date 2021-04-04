/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import * as isHotkey from 'is-hotkey';
import { getExitBreakOnKeyDown } from '../../getExitBreakOnKeyDown';

jsx;

const input = (
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hdefault>
      <htext />
      <cursor />
    </hdefault>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  getExitBreakOnKeyDown({
    rules: [
      {
        hotkey: 'enter',
        level: 0,
        query: { start: true, end: true },
      },
    ],
  })(input)(event);
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 0, path: [1, 0] });
});
