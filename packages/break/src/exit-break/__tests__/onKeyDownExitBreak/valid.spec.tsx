/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { getExitBreakOnKeyDown } from '../../getExitBreakOnKeyDown';

jsx;

const input = (
  <editor>
    <hp>
      te
      <cursor />
      st
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown') as any;

const output = (
  <editor>
    <hp>test</hp>
    <hdefault>
      <htext />
      <cursor />
    </hdefault>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  getExitBreakOnKeyDown({
    rules: [{ hotkey: 'mod+enter', level: 0, before: false }],
  })(input)(event);
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 0, path: [1, 0] });
});
