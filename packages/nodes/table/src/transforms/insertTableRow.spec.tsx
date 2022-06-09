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
              <htd>11</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>
                21
                <cursor />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>22</htd>
            </htr>
            <htr>
              <htd>
                <cursor />
              </htd>
              <htd>
                <htext />
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
