/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../slate-plugins/src/utils/createEditorPlugins';
import { createLinkPlugin } from '../../link/src/createLinkPlugin';
import { createParagraphPlugin } from '../../paragraph/src/createParagraphPlugin';
import { createListPlugin } from './createListPlugin';

jsx;

describe('normalizeList', () => {
  describe('when there is no p in li', () => {
    it('should insert a p', () => {
      const input = ((
        <editor>
          <hul>
            <hli>
              hell
              <cursor /> <ha>link</ha>
              <htext />
            </hli>
          </hul>
        </editor>
      ) as any) as Editor;

      const expected = ((
        <editor>
          <hul>
            <hli>
              <hp>
                hello <ha>link</ha>
                <htext />
              </hp>
            </hli>
          </hul>
        </editor>
      ) as any) as Editor;

      const editor = createEditorPlugins({
        editor: input,
        plugins: [
          createParagraphPlugin(),
          createListPlugin(),
          createLinkPlugin(),
        ],
      });

      editor.insertText('o');

      expect(editor.children).toEqual(expected.children);
    });
  });
});
