/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';

import { createIndentListPlugin } from '@/packages/nodes/indent-list/src/createIndentListPlugin';

jsx;

describe('normalizeIndentList', () => {
  describe('when listStyleType without indent', () => {
    it('should remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp listStyleType="disc" listStart={1}>
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
        plugins: [createIndentListPlugin(), createIndentPlugin()],
        normalizeInitialValue: true,
      });

      expect(editor.children).toEqual(output.children);
    });
  });
});
