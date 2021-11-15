/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      test
      <ha url="http://google.com">
        http://
        <cursor />
        google.com
      </ha>
      <htext />
    </hp>
  </editor>
) as any;

const data: any = { getData: () => 'docs' };

const output = (
  <editor>
    <hp>
      test
      <element type="a" url="http://google.com">
        http://docsgoogle.com
      </element>
      <htext />
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  editor.insertData(data);

  expect(input.children).toEqual(output.children);
});
