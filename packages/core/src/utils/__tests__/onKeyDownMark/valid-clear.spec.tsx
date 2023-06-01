/** @jsx jsx */

import {
  createBoldPlugin,
  MARK_BOLD,
} from '@udecode/plate-basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '@udecode/plate-basic-marks/src/createItalicPlugin';
import { jsx } from '@udecode/plate-test-utils';
import { onKeyDownToggleMark } from '@udecode/plate-utils/src/plate/onKeyDownToggleMark';
import * as isHotkey from 'is-hotkey';

import { ToggleMarkPlugin } from '@/core/src/types/plugin/ToggleMarkPlugin';
import { getPlugin } from '@/core/src/utils/getPlugin';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

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
