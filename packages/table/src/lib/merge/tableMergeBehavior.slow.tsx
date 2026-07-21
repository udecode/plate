/** @jsx jsxt */

import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import { NodeApi } from '@platejs/plite';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

jsxt;

const createTableEditor = (
  input: TestEditor,
  { disableMerge = false }: { disableMerge?: boolean } = {}
) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge }),
    selection: input.selection,
    value: input.children,
  });

const getTable = (editor: ReturnType<typeof createTableEditor>) => {
  const entry = editor.read.nodes.get<TTableElement>([0]);
  assert(entry);

  return entry[0];
};

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
      ) as TestEditor;

      const editor = createTableEditor(input);

      editor.update.table.merge();

      const table = getTable(editor);
      const firstRow = table.children[0] as TTableRowElement;
      const mergedCell = firstRow.children[0] as TTableCellElement;

      expect(firstRow.children).toHaveLength(1);
      expect(mergedCell).toMatchObject({
        colSpan: 2,
        rowSpan: 2,
        type: 'td',
      });
      expect(mergedCell.children.map((child) => NodeApi.string(child))).toEqual(
        ['11', '12', '21', '22']
      );
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 2, path: [0, 0, 0, 3, 0] },
        focus: { offset: 2, path: [0, 0, 0, 3, 0] },
        kind: 'text',
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
      ) as TestEditor;

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
      ) as TestEditor;

      const editor = createTableEditor(input);

      editor.update.table.split();

      expect(editor.read.children()).toMatchObject(output.children!);
      expect(editor.read.selection()).toEqual(output.selection!);
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
      ) as TestEditor;

      const editor = createTableEditor(input);

      editor.update.table.split();

      const table = getTable(editor);
      const rows = table.children as TTableRowElement[];

      expect(rows[0].children).toHaveLength(3);
      expect(NodeApi.string(rows[0].children[2])).toBe('13');
      expect(rows[1].children).toHaveLength(3);
      expect(NodeApi.string(rows[1].children[2])).toBe('23');
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
      ) as TestEditor;

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
      ) as TestEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      editor.update.remove.tableRow();

      expect(editor.read.children()).toMatchObject(output.children!);
      expect(editor.read.selection()).toEqual(output.selection!);
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
      ) as TestEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      editor.update.remove.tableRow();

      expect(editor.read.children()).toMatchObject(input.children);
      expect(editor.read.selection()).toEqual(input.selection!);
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
      ) as TestEditor;

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
      ) as TestEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      editor.update.remove.tableColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
      expect(editor.read.selection()).toEqual(output.selection!);
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
      ) as TestEditor;

      const editor = createTableEditor(input, { disableMerge: true });

      editor.update.remove.tableColumn();

      expect(editor.read.children()).toMatchObject(input.children);
      expect(editor.read.selection()).toEqual(input.selection!);
    });
  });
});
