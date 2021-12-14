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

it('should run default insertData', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>image.png</fragment>);

  const editor = createPlateEditor({
    editor: input,
    plugins: [createImagePlugin()],
  });

  const data = {
    getData: () => 'test',
  };
  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
