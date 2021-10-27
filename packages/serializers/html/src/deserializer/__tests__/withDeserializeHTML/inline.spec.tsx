/** @jsx jsx */
import { PlatePlugin, SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';
import { createLinkPlugin } from '../../../../../../elements/link/src/createLinkPlugin';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { createDeserializeHTMLPlugin } from '../../createDeserializeHTMLPlugin';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

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
  const plugins: PlatePlugin<ReactEditor & SPEditor>[] = [
    createParagraphPlugin(),
    createLinkPlugin(),
  ];
  plugins.push(createDeserializeHTMLPlugin({ plugins }));

  const editor = createEditorPlugins({
    editor: input,
    plugins,
  });

  editor.insertData(data as any);

  expect(editor.children).toEqual(output.children);
});
