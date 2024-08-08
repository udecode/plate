/** @jsx jsx */

import { BoldPlugin, MARK_BOLD } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import { onKeyDownToggleMark } from '@udecode/plate-utils';

import { type ToggleMarkPluginOptions, getPlugin } from '../../../shared';
import { createPlateEditor } from '../../utils';

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
    BoldPlugin.configure({
      hotkey: 'enter',
    }),
  ],
});

it('should be', () => {
  onKeyDownToggleMark({
    editor,
    event,
    plugin: getPlugin<ToggleMarkPluginOptions>(editor, MARK_BOLD),
  });
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
