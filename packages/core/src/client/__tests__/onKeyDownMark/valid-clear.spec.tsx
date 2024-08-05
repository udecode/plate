/** @jsx jsx */

import { BoldPlugin, MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks';
import * as isHotkey from '@udecode/plate-core/server';
import { jsx } from '@udecode/plate-test-utils';
import { onKeyDownToggleMark } from '@udecode/plate-utils';

import { type ToggleMarkPluginOptions, getPlugin } from '../../../shared';
import { createPlateEditor } from '../../utils';

jsx;

jest.mock('@udecode/plate-core/server', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@udecode/plate-core/server'),
  };
});

const input = (
  <editor>
    <hp>
      t<htext italic>est</htext>
    </hp>
    <selection>
      <anchor offset={0} path={[0, 1]} />
      <focus offset={3} path={[0, 1]} />
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
      <anchor offset={0} path={[0, 1]} />
      <focus offset={3} path={[0, 1]} />
    </selection>
  </editor>
) as any;

const editor = createPlateEditor({
  editor: input,
  plugins: [
    BoldPlugin.configure({
      clear: MARK_ITALIC,
      hotkey: 'ctrl+b',
    }),
  ],
});

it('should be', () => {
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);

  onKeyDownToggleMark({
    editor,
    event: event as any,
    plugin: getPlugin<ToggleMarkPluginOptions>(editor, MARK_BOLD),
  });
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
