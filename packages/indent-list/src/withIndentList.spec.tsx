/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';

import { createIndentListPlugin } from './createIndentListPlugin';

jsx;

describe('normalizeIndentList', () => {
  describe('when listStyleType without indent', () => {
    it('should remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStyleType="decimal" listStart={2}>
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal" listStart={3}>
            1
          </hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStyleType="decimal" listStart={2}>
            1
          </hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createIndentListPlugin(), createIndentPlugin()],
        normalizeInitialValue: true,
      });

      editor.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
    });
  });
});
