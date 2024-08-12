/** @jsx jsx */

import { type AnyPlatePlugin, createPlugin } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

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
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);
  onKeyDownExitBreak({
    editor: input,
    event,
    plugin: createPlugin({
      options: {
        rules: [{ before: true, hotkey: 'mod+enter', level: 0 }],
      },
    }) as AnyPlatePlugin,
  });
  expect(input.children).toEqual(output.children);
});
