/** @jsx jsx */

import { BoldPlugin, MARK_BOLD } from '@udecode/plate-basic-marks';
import { createPlateEditor } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core/server';
import { jsx } from '@udecode/plate-test-utils';
import { onKeyDownToggleMark } from '@udecode/plate-utils';

import type { ToggleMarkPluginOptions } from '../../../shared/types';

import { getPlugin } from '../../../shared/utils/getPlugin';

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
    plugin: getPlugin<ToggleMarkPluginOptions>(editor, MARK_BOLD),
  });
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
