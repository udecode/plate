/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { withInlineVoid } from '../../plugins/withInlineVoid/withInlineVoid';
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
