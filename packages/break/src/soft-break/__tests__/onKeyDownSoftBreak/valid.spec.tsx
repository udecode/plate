/** @jsx jsx */

import { onKeyDownSoftBreak } from '@/packages/break/src/soft-break/onKeyDownSoftBreak';
import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown') as any;

const output = (
  <editor>
    <hp>
      test{'\n'}
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownSoftBreak(
    input,
    mockPlugin({
      options: { rules: [{ hotkey: 'shift+enter' }] },
    })
  )(event as any);
  expect(input.children).toEqual(output.children);
});
