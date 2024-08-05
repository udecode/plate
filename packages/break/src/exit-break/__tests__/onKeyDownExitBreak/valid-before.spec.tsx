/** @jsx jsx */

import { createPlugin } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core/server';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

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
    <hdefault>
      <htext />
      <cursor />
    </hdefault>
    <hp>test</hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);
  onKeyDownExitBreak(
    input,
    createPlugin({
      options: {
        rules: [{ before: true, hotkey: 'mod+enter', level: 0 }],
      },
    })
  )(event);
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 0, path: [0, 0] });
});
