/** @jsx jsx */

import { ToggleMarkPlugin } from '@/packages/core/src/types/plugin/ToggleMarkPlugin';
import { getPlugin } from '@/packages/core/src/utils/getPlugin';
import {
  MARK_BOLD,
  createBoldPlugin,
} from '@udecode/plate-basic-marks/src/createBoldPlugin';
import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { onKeyDownToggleMark } from '@udecode/plate-utils/src/plate/onKeyDownToggleMark';

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

const editor = createPlateEditor({
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
  onKeyDownToggleMark(
    editor,
    getPlugin<ToggleMarkPlugin>(editor, MARK_BOLD)
  )(event as any);
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
