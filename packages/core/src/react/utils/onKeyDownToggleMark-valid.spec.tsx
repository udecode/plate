/** @jsx jsx */

import { BoldPlugin } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

import type { ToggleMarkPluginOptions } from '../../lib/types';

import { getPlugin } from '../../lib/plugin/getPlugin';
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
      t<htext bold>est</htext>
    </hp>
    <selection>
      <anchor offset={0} path={[0, 1]} />
      <focus offset={3} path={[0, 1]} />
    </selection>
  </editor>
) as any;

const editor = createPlateEditor({
  editor: input,
  plugins: [
    BoldPlugin.configure({
      hotkey: 'ctrl+b',
    }),
  ],
});

it('should be', () => {
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);

  onKeyDownToggleMark({
    editor,
    event,
    plugin: getPlugin<ToggleMarkPluginOptions>(editor, BoldPlugin.key),
  });
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
