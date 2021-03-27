/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { getMediaEmbedPlugin } from '../../../../../../elements/media-embed/src/getMediaEmbedPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { getDeserializeHTMLPlugin } from '../../getDeserializeHTMLPlugin';

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
  getData: () => '<html><body><iframe>inserted</iframe></body></html>',
};

const output = (
  <editor>
    <hp>
      testinserted
      <cursor />
    </hp>
  </editor>
) as any;

describe('when inserting an iframe', () => {
  it('should do nothing', () => {
    const plugins = [getMediaEmbedPlugin()];
    plugins.push(getDeserializeHTMLPlugin({ plugins }));

    const editor = createEditorPlugins({
      editor: input,
      plugins,
    });

    editor.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});
