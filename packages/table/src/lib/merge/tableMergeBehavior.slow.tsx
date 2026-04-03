/** @jsx jsxt */

import { type SlateEditor, KEYS, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { deleteColumnWhenExpanded } from './deleteColumnWhenExpanded';
import { deleteRowWhenExpanded } from './deleteRowWhenExpanded';
import { mergeTableCells } from './mergeTableCells';
import { splitTableCell } from './splitTableCell';

jsxt;

const createTableEditor = (
  input: SlateEditor,
  { disableMerge = false }: { disableMerge?: boolean } = {}
) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge }),
    selection: input.selection,
    value: input.children,
  });

const getTableEntry = (editor: SlateEditor) =>
  editor.api.above({ match: { type: editor.getType(KEYS.table) } })!;

describe('table merge behavior', () => {
  describe('mergeTableCells', () => {
    it('merges a 2x2 selection into one spanning cell and keeps cell content order', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  11
                </hp>
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
                <hp>
                  22
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      mergeTableCells(editor);

      const table = editor.children[0] as any;
      const mergedCell = table.children[0].children[0];

      expect(table.children[0].children).toHaveLength(1);
      expect(mergedCell).toMatchObject({
        colSpan: 2,
        rowSpan: 2,
        type: 'td',
      });
      expect(
        mergedCell.children.map((child: any) => child.children[0].text)
      ).toEqual(['11', '12', '21', '22']);
      expect(editor.selection).toEqual({
        anchor: { offset: 2, path: [0, 0, 0, 3, 0] },
        focus: { offset: 2, path: [0, 0, 0, 3, 0] },
      });
    });
  });

  describe('splitTableCell', () => {
    it('splits a merged cell into 1x1 cells, creates missing rows, and keeps content in the first cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd colSpan={2} rowSpan={2}>
                <hp>
                  merged
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd colSpan={1} rowSpan={1}>
                <hp>
                  merged
                  <cursor />
                </hp>
              </htd>
              <htd colSpan={1} rowSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd colSpan={1} rowSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd colSpan={1} rowSpan={1}>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      splitTableCell(editor);

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('inserts split cells into existing rows before later siblings', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd colSpan={2} rowSpan={2}>
                <hp>
                  merged
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>13</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>23</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      splitTableCell(editor);

      const table = editor.children[0] as any;

      expect(table.children[0].children).toHaveLength(3);
      expect(table.children[0].children[2].children[0].children[0].text).toBe(
        '13'
      );
      expect(table.children[1].children).toHaveLength(3);
      expect(table.children[1].children[2].children[0].children[0].text).toBe(
        '23'
      );
    });
  });

  describe('deleteRowWhenExpanded', () => {
    it('deletes a fully selected row and collapses the selection to the next row', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  11
                </hp>
              </htd>
              <htd>
                <hp>
                  12
                  <focus />
                </hp>
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
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                  21
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      deleteRowWhenExpanded(editor, getTableEntry(editor) as any);

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('keeps the table unchanged when the selection does not span the full row width', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  11
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  21
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      deleteRowWhenExpanded(editor, getTableEntry(editor) as any);

      expect(editor.children).toMatchObject(input.children);
      expect(editor.selection).toEqual(input.selection);
    });
  });

  describe('deleteColumnWhenExpanded', () => {
    it('deletes a fully selected column and keeps the remaining column selected', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>
                  <anchor />
                  12
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>
                  22
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  11
                  <anchor />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  21
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      deleteColumnWhenExpanded(editor, getTableEntry(editor) as any);

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('keeps the table unchanged when the selection does not span every row', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  11
                </hp>
              </htd>
              <htd>
                <hp>
                  12
                  <focus />
                </hp>
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
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      deleteColumnWhenExpanded(editor, getTableEntry(editor) as any);

      expect(editor.children).toMatchObject(input.children);
      expect(editor.selection).toEqual(input.selection);
    });
  });
});
