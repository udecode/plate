/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createImagePlugin } from '../../createImagePlugin';

jsx;

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

it('should insert image from the file(s)', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createImagePlugin()],
  });

  const data = {
    getData: () => 'test',
    files: [new File(['test'], 'not-an-image')],
  };
  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
