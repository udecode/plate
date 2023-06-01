/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createAlignPlugin } from '@/nodes/alignment/src/createAlignPlugin';
import { setAlign } from '@/nodes/alignment/src/transforms/setAlign';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

jsx;

const input = (
  <editor>
    <hp align="center">
      test
      <cursor />
    </hp>
  </editor>
) as any as PlateEditor;

const output = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as PlateEditor;

it('should remove align prop', () => {
  const editor = createPlateUIEditor({
    editor: input,
    plugins: [createAlignPlugin()],
  });

  setAlign(editor, { value: 'left' });

  expect(editor.children).toEqual(output.children);
});
