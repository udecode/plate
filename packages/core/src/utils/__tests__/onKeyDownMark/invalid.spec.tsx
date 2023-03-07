/** @jsx jsx */

import {
  createBoldPlugin,
  MARK_BOLD,
} from '@udecode/plate-basic-marks/src/createBoldPlugin';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '@udecode/plate-ui/src/utils/createPlateUIEditor';
import { onKeyDownToggleMark } from '../../../../../plate-utils/src/plate/onKeyDownToggleMark';
import { ToggleMarkPlugin } from '../../../types/plugin/ToggleMarkPlugin';
import { getPlugin } from '../../getPlugin';

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
  onKeyDownToggleMark(
    editor,
    getPlugin<ToggleMarkPlugin>(editor, MARK_BOLD)
  )(event as any);
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
