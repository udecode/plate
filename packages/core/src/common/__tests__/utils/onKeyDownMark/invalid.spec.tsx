/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import {
  createBoldPlugin,
  MARK_BOLD,
} from '../../../../../../nodes/basic-marks/src/createBoldPlugin';
import { createPlateUIEditor } from '../../../../../../ui/plate/src/utils/createPlateUIEditor';
import { getPlugin } from '../../../../utils/getPlugin';
import { ToggleMarkPlugin } from '../../../types/plugins/ToggleMarkPlugin';
import { onKeyDownToggleMark } from '../../../utils/onKeyDown/onKeyDownToggleMark';

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
