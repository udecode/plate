/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

jsx;

const input = (
  <editor>
    <hp>
      <cursor />
      test
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
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownExitBreak(
    input,
    mockPlugin({
      options: {
        rules: [
          { hotkey: 'enter', level: 0, query: { start: true, end: true } },
        ],
      },
    })
  )(event);
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 0, path: [1, 0] });
});
