/** @jsx jsx */

import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { jsx } from '../../__test-utils__/jsx';
import { withInlineVoid } from '../../common/plugins/inline-void/withInlineVoid';
import { ELEMENT_LINK } from '../link/defaults';
import { withList } from './index';

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

      const editor = withList()(
        withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(withReact(input))
      );

      editor.insertText('o');

      expect(editor.children).toEqual(expected.children);
    });
  });
});
