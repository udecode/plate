/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import {
  createBoldPlugin,
  MARK_BOLD,
} from '../../../../../../marks/basic-marks/src/createBoldPlugin';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
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
      t<htext bold>est</htext>
    </hp>
    <selection>
      <anchor path={[0, 1]} offset={0} />
      <focus path={[0, 1]} offset={3} />
    </selection>
  </editor>
) as any;

const editor = createPlateUIEditor({
  editor: input,
  plugins: [
    createBoldPlugin({
      options: { hotkey: 'ctrl+b' },
    }),
  ],
});

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);

  onKeyDownToggleMark(
    editor,
    getPlugin<ToggleMarkPlugin>(editor, MARK_BOLD)
  )(event as any);
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
