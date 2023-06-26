/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

import { onKeyDownExitBreak } from '@/packages/break/src/exit-break/onKeyDownExitBreak';

jsx;

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown') as any;

const output = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownExitBreak(
    input,
    mockPlugin({
      options: {
        rules: [{ hotkey: 'mod+enter', level: 0, before: true }],
      },
    })
  )(event);
  expect(input.children).toEqual(output.children);
});
