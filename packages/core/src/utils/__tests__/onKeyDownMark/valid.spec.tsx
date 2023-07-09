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
import * as isHotkey from 'is-hotkey';

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

const editor = createPlateEditor({
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
