/** @jsx jsx */

import { type PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';

import { createIndentListPlugin } from '../IndentListPlugin';

jsx;

describe('normalizeIndentList', () => {
  describe('when listStyleType without indent', () => {
    it('should remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp listStart={1} listStyleType="disc">
            1
          </hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hp>1</hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        normalizeInitialValue: true,
        plugins: [createIndentListPlugin(), createIndentPlugin()],
      });

      expect(editor.children).toEqual(output.children);
    });
  });
});
