/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import * as isHotkey from 'is-hotkey';
import { onKeyDownExitBreak } from '../../index';

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownExitBreak({
    rules: [{ hotkey: 'mod+enter', level: 0, before: true }],
  })(event, input);
  expect(input.children).toEqual(output.children);
});
