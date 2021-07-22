/** @jsx jsx */

import { MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks';
import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { createBoldPlugin } from '../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';

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

const editor = createEditorPlugins({
  editor: input,
  plugins: [createBoldPlugin()],
  options: { bold: { hotkey: 'ctrl+b', clear: MARK_ITALIC } },
});

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);

  getToggleMarkOnKeyDown(MARK_BOLD)?.(editor)(event as any);
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
