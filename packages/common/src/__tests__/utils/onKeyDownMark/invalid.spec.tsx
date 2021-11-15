/** @jsx jsx */

import { MARK_BOLD } from '@udecode/plate-basic-marks';
import { onKeyDownToggleMark } from '@udecode/plate-common';
import { getPlugin } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createBoldPlugin } from '../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';

jsx;

const input = (
  <editor>
    <hp>
      t<anchor />
      est
      <focus />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown') as any;

const output = (
  <editor>
    <hp>
      t<anchor />
      est
      <focus />
    </hp>
  </editor>
) as any;

const editor = createPlateUIEditor({
  editor: input,
  plugins: [
    createBoldPlugin({
      options: {
        hotkey: 'enter',
      },
    }),
  ],
});

it('should be', () => {
  onKeyDownToggleMark(editor, getPlugin(editor, MARK_BOLD))(event as any);
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
