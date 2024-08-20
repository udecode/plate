/** @jsx jsx */

import { getPluginContext } from '@udecode/plate-common/react';
import { createPlateEditor } from '@udecode/plate-common/react';
import * as isHotkey from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';

import { ExitBreakPlugin } from '../../ExitBreakPlugin';
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
    ...getPluginContext(
      createPlateEditor({ editor: input }),
      ExitBreakPlugin.configure({
        options: {
          rules: [{ before: true, hotkey: 'mod+enter', level: 0 }],
        },
      })
    ),
    event,
  });
  expect(input.children).toEqual(output.children);
});
