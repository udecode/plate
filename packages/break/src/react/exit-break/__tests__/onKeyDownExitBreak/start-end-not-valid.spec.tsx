/** @jsx jsxt */

import {
  createPlateEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import * as isHotkey from '@udecode/plate-core';
import { jsxt } from '@udecode/plate-test-utils';

import { ExitBreakPlugin } from '../../ExitBreakPlugin';
import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

jsxt;

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
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);
  onKeyDownExitBreak({
    ...getEditorPlugin(
      createPlateEditor({ editor: input }),
      ExitBreakPlugin.configure({
        options: {
          rules: [
            {
              hotkey: 'enter',
              level: 0,
              query: { end: true, start: true },
            },
          ],
        },
      })
    ),
    editor: input,
    event,
  });
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 2, path: [0, 0] });
});
