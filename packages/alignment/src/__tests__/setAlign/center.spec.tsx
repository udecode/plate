/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createAlignPlugin } from '../../shared/createAlignPlugin';
import { setAlign } from '../../shared/transforms/index';

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
