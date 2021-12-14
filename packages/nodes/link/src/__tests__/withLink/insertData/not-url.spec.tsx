/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../createLinkPlugin';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const data: any = { getData: () => 'test' };

const output = (
  <editor>
    <hp>testtest</hp>
  </editor>
) as any;

it('should run default insertText', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>test</fragment>);

  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  editor.insertData(data);

  expect(input.children).toEqual(output.children);
});
