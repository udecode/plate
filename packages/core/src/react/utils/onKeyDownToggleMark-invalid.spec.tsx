/** @jsx jsx */

import { BoldPlugin } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';

import { getPluginContext } from '../../lib';
import { createPlateEditor } from '../editor';
import { onKeyDownToggleMark } from './onKeyDownToggleMark';

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
      options: {
        hotkey: 'enter',
      },
    }),
  ],
});

it('should be', () => {
  onKeyDownToggleMark({
    ...getPluginContext(editor, editor.getPlugin(BoldPlugin)),
    event,
  });
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
