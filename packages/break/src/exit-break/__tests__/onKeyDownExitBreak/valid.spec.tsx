/** @jsx jsx */

import {
  type AnyPlatePlugin,
  createPlugin,
  getPluginContext,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import * as isHotkey from '@udecode/plate-core';
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
    <hp>test</hp>
    <hdefault>
      <htext />
      <cursor />
    </hdefault>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);
  onKeyDownExitBreak({
    ...getPluginContext(
      createPlateEditor({ editor: input }),
      createPlugin({
        options: {
          rules: [{ before: false, hotkey: 'mod+enter', level: 0 }],
        },
      }) as AnyPlatePlugin
    ),
    event,
  });
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 0, path: [1, 0] });
});
