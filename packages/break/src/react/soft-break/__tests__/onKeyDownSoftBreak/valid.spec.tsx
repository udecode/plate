/** @jsx jsxt */

import {
  createPlateEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import * as isHotkey from '@udecode/plate-core';
import { jsxt } from '@udecode/plate-test-utils';

import { SoftBreakPlugin } from '../../SoftBreakPlugin';
import { onKeyDownSoftBreak } from '../../onKeyDownSoftBreak';

jsxt;

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
    ...getEditorPlugin(
      createPlateEditor({ editor: input }),
      SoftBreakPlugin.configure({
        options: { rules: [{ hotkey: 'shift+enter' }] },
      })
    ),
    event: event as any,
  });
  expect(input.children).toEqual(output.children);
});
