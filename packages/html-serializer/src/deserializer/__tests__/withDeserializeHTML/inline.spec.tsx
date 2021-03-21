/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { useLinkPlugin } from '../../../../../slate-plugins/src/elements/link/useLinkPlugin';
import { useParagraphPlugin } from '../../../../../slate-plugins/src/elements/paragraph/useParagraphPlugin';
import { useDeserializeHTMLPlugin } from '../../useDeserializeHTMLPlugin';

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
  const plugins = [useParagraphPlugin(), useLinkPlugin()];
  plugins.push(useDeserializeHTMLPlugin({ plugins }));

  const editor = createEditorPlugins({
    editor: input,
    plugins,
  });

  editor.insertData(data as any);

  expect(editor.children).toEqual(output.children);
});
