/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { createDeserializeHtmlPlugin } from '../../createDeserializeHtmlPlugin';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const data = {
  getData: (format: string) => (format === 'text/html' ? '' : 'inserted'),
};

const output = (
  <editor>
    <hp>
      testinserted
      <cursor />
    </hp>
  </editor>
) as any;

it('should do nothing', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>inserted</fragment>);

  const editor = createPlateUIEditor({
    editor: input,
    plugins: [createDeserializeHtmlPlugin()],
  });

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
