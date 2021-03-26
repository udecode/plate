/** @jsx jsx */
jsx;
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { getLinkPlugin } from '../../../../../../elements/link/src/getLinkPlugin';
import { getParagraphPlugin } from '../../../../../../elements/paragraph/src/getParagraphPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { getDeserializeHTMLPlugin } from '../../getDeserializeHTMLPlugin';

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
  const plugins = [getParagraphPlugin(), getLinkPlugin()];
  plugins.push(getDeserializeHTMLPlugin({ plugins }));

  const editor = createEditorPlugins({
    editor: input,
    plugins,
  });

  editor.insertData(data as any);

  expect(editor.children).toEqual(output.children);
});
