/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createTablePlugin } from '../createTablePlugin';
import { insertTableRow } from './insertTableRow';

jsx;

describe('insertTableRow', () => {
  describe('when inserting a table row', () => {
    it('should insert a tr with empty cells', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  21
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [
          createTablePlugin({
            options: { newCellChildren: [{ text: '' }] },
          }),
        ],
      });

      insertTableRow(editor);

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
