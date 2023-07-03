/** @jsx jsx */

import { createAlignPlugin } from '@/packages/alignment/src/createAlignPlugin';
import { setAlign } from '@/packages/alignment/src/transforms/setAlign';
import { PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as PlateEditor;

const output = (
  <editor>
    <hp align="center">test</hp>
  </editor>
) as any as PlateEditor;

it('should align center', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createAlignPlugin()],
  });

  setAlign(editor, { value: 'center' });

  expect(editor.children).toEqual(output.children);
});
