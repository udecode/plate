/** @jsx jsx */

import { createPlugin } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core/server';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownSoftBreak } from '../../onKeyDownSoftBreak';

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
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);
  onKeyDownSoftBreak(
    input,
    createPlugin({
      options: { rules: [{ hotkey: 'shift+enter' }] },
    })
  )(event as any);
  expect(input.children).toEqual(output.children);
});
