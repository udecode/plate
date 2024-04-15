/** @jsx jsx */

import {
  createBoldPlugin,
  MARK_BOLD,
  MARK_ITALIC,
} from '@udecode/plate-basic-marks';
import {
  createPlateEditor,
  getPlugin,
  onKeyDownToggleMark,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'packages/core/index';

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

const editor = createPlateEditor({
  editor: input,
  plugins: [
    createBoldPlugin({
      options: { hotkey: 'ctrl+b', clear: MARK_ITALIC },
    }),
  ],
});

it('should be', () => {
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);

  onKeyDownToggleMark(
    editor,
    getPlugin<ToggleMarkPlugin>(editor, MARK_BOLD)
  )(event as any);
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
