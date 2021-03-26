/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { getBoldPlugin } from '../../../../../../marks/basic-marks/src/bold/getBoldPlugin';
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
  getData: () => '<html></html>',
};

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

describe('when inserting empty html', () => {
  it('should do nothing', () => {
    const plugins = [getBoldPlugin()];
    plugins.push(getDeserializeHTMLPlugin({ plugins }));
    const editor = createEditorPlugins({
      editor: input,
      plugins,
    });

    editor.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});
