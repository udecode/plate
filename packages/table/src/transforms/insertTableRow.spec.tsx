/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createTablePlugin } from '../createTablePlugin';
import { insertTableRow } from './insertTableRow';

jsx;

describe('insertTableRow', () => {
  describe('when inserting a table row', () => {
    it('should insert a tr with empty cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  21
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
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
                <hp>11</hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>21</hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={2} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={2} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

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

    it('should insert a tr with empty cells and update cells below', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>21</hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
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
                <hp>11</hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={2} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>21</hp>
              </htd>
              <htd rowIndex={2} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

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

  describe('when inserting a table row at specific path', () => {
    it('should insert a tr with empty cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  21
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
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
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={2} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>21</hp>
              </htd>
              <htd rowIndex={2} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [
          createTablePlugin({
            options: { newCellChildren: [{ text: '' }] },
          }),
        ],
      });

      insertTableRow(editor, { at: [0, 0] });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should insert a tr with empty cells when there is cell with rowSpan > 1', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={2} colSpan={1}>
                <hp>21</hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={2} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>
                  32
                  <cursor />
                </hp>
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
                  11
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={3} colSpan={1}>
                <hp>21</hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>22</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={2} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={3} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>32</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [
          createTablePlugin({
            options: { newCellChildren: [{ text: '' }] },
          }),
        ],
      });

      const lastRowPath = [0, 2];
      insertTableRow(editor, { at: lastRowPath });

      expect(editor.children).toEqual(output.children);
    });
  });
});
