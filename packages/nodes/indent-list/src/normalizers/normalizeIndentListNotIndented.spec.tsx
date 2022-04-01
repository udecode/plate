/** @jsx jsx */

import { createPlateEditor, TEditor } from '@udecode/plate-core';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';
import { createIndentListPlugin } from '../createIndentListPlugin';

jsx;

describe('normalizeIndentList', () => {
  describe('when listStyleType without indent', () => {
    it('should remove listStyleType and listStart props', async () => {
      const input = ((
        <editor>
          <hp listStyleType="disc" listStart={1}>
            1
          </hp>
        </editor>
      ) as any) as TEditor;

      const output = ((
        <editor>
          <hp>1</hp>
        </editor>
      ) as any) as TEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createIndentListPlugin(), createIndentPlugin()],
        normalizeInitialValue: true,
      });

      expect(editor.children).toEqual(output.children);
    });
  });
});
