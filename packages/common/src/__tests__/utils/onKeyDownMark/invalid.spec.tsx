/** @jsx jsx */

import { MARK_BOLD } from '@udecode/slate-plugins-basic-marks';
import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { getBoldPlugin } from '../../../../../marks/basic-marks/src/bold/getBoldPlugin';
import { createEditorPlugins } from '../../../../../slate-plugins/src/utils/createEditorPlugins';

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

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>
      t<anchor />
      est
      <focus />
    </hp>
  </editor>
) as any;

const editor = createEditorPlugins({
  editor: input,
  plugins: [getBoldPlugin()],
  options: { bold: { hotkey: 'enter' } },
});

it('should be', () => {
  getToggleMarkOnKeyDown(MARK_BOLD)?.(editor)(event);
  expect(editor.children).toEqual(output.children);
  expect(editor.selection).toEqual(output.selection);
});
