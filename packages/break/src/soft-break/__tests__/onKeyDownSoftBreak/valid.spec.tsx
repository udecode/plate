/** @jsx jsx */

import { type AnyPlatePlugin, createPlugin } from '@udecode/plate-common';
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
  onKeyDownSoftBreak({
    editor: input,
    event: event as any,
    plugin: createPlugin({
      options: { rules: [{ hotkey: 'shift+enter' }] },
    }) as AnyPlatePlugin,
  });
  expect(input.children).toEqual(output.children);
});
