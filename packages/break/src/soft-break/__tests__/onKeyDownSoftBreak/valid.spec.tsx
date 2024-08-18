/** @jsx jsx */

import {
  type AnyPlatePlugin,
  createSlatePlugin,
  getPluginContext,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import * as isHotkey from '@udecode/plate-core';
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
    ...getPluginContext(
      createPlateEditor({ editor: input }),
      createSlatePlugin({
        options: { rules: [{ hotkey: 'shift+enter' }] },
      }) as AnyPlatePlugin
    ),
    event: event as any,
  });
  expect(input.children).toEqual(output.children);
});
