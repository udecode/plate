/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createTablePlugin } from './createTablePlugin';

jsx;

describe('withInsertTextTable', () => {
  // https://github.com/udecode/editor-protocol/issues/65
  describe('cell child is a text', () => {
    it('should wrap the children into a p', async () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  <anchor />a
                </hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  c<focus />
                </hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>e</hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      editor.deleteFragment();
      editor.insertText('e');
      expect(editor.children).toEqual(output.children);
    });
  });
});
