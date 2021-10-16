/** @jsx jsx */

import { SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';
import { createAlignPlugin } from '../../createAlignPlugin';
import { setAlign } from '../../transforms/setAlign';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as SPEditor;

const output = ((
  <editor>
    <hp align="center">test</hp>
  </editor>
) as any) as Editor;

it('should align center', () => {
  const editor = createEditorPlugins({
    editor: input,
    plugins: [createAlignPlugin()],
  });

  setAlign(editor, { align: 'center' });

  expect(editor.children).toEqual(output.children);
});
