/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '../../../../../ui/plate/src/utils/createPlateUIEditor';
import { createAlignPlugin } from '../../createAlignPlugin';
import { setAlign } from '../../transforms/setAlign';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = ((
  <editor>
    <hp align="center">test</hp>
  </editor>
) as any) as PlateEditor;

it('should align center', () => {
  const editor = createPlateUIEditor({
    editor: input,
    plugins: [createAlignPlugin()],
  });

  setAlign(editor, { value: 'center' });

  expect(editor.children).toEqual(output.children);
});
