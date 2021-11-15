/** @jsx jsx */
import { PlateEditor, PlatePlugin } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../../../../elements/link/src/createLinkPlugin';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
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

// noinspection CheckTagEmptyBody
const data = {
  getData: () => `<html><body><a href="http://test.com">link</a></body></html>`,
};

const output = (
  <editor>
    <hp>
      test
      <ha url="http://test.com">link</ha>
      <cursor />
    </hp>
  </editor>
) as any;

it('should do nothing', () => {
  const plugins: PlatePlugin[] = [
    createParagraphPlugin(),
    createLinkPlugin(),
    createDeserializeHtmlPlugin(),
  ];

  const editor = createPlateUIEditor({
    editor: input,
    plugins,
  });

  editor.insertData(data as any);

  expect(editor.children).toEqual(output.children);
});
