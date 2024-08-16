/** @jsx jsx */

import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

import { getPluginContext } from '../../lib';
import { createPlateEditor } from '../editor';
import { onKeyDownToggleMark } from './onKeyDownToggleMark';

jsx;

jest.mock('@udecode/plate-core', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@udecode/plate-core'),
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
      options: {
        clear: ItalicPlugin.key,
        hotkey: 'ctrl+b',
      },
    }),
  ],
});

it('should be', () => {
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);

  onKeyDownToggleMark({
    ...getPluginContext(editor, BoldPlugin.key),
    event,
  });
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
