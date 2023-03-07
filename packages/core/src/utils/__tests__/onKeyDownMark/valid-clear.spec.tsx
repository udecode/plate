/** @jsx jsx */

import {
  createBoldPlugin,
  MARK_BOLD,
} from '@udecode/plate-basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '@udecode/plate-basic-marks/src/createItalicPlugin';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '@udecode/plate-ui/src/utils/createPlateUIEditor';
import * as isHotkey from 'is-hotkey';
import { onKeyDownToggleMark } from '../../../../../plate-utils/src/plate/onKeyDownToggleMark';
import { ToggleMarkPlugin } from '../../../types/plugin/ToggleMarkPlugin';
import { getPlugin } from '../../getPlugin';

jsx;

const input = (
  <editor>
    <hp>
      t<htext italic>est</htext>
    </hp>
    <selection>
      <anchor path={[0, 1]} offset={0} />
      <focus path={[0, 1]} offset={3} />
    </selection>
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
      options: { hotkey: 'ctrl+b', clear: MARK_ITALIC },
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
