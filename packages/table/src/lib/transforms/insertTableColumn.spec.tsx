/** @jsx jsxt */

import type { Element } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

jsxt;

type MakeTableWithColsOptions = {
  rowCols: string[][];
  colSizes?: number[];
  cursorPath?: [number, number];
};

const makeTableWithCols = ({
  colSizes,
  cursorPath,
  rowCols,
}: MakeTableWithColsOptions) =>
  (
    <editor>
      <htable colSizes={colSizes}>
        {rowCols.map((row, rowIndex) => (
          <htr>
            {row.map((col, colIndex) => (
              <htd>
                <hp>
                  {col === '' ? <htext /> : col}
                  {cursorPath &&
                    cursorPath[0] === rowIndex &&
                    cursorPath[1] === colIndex && <cursor />}
                </hp>
              </htd>
            ))}
          </htr>
        ))}
      </htable>
    </editor>
  ) as TestEditor;

describe('insertTableColumn', () => {
  describe('without initialTableWidth', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts at the last column (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = makeTableWithCols({
        cursorPath: [1, 1],
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
      });

      const output = makeTableWithCols({
        cursorPath: [1, 2],
        rowCols: [
          ['11', '12', ''],
          ['21', '22', ''],
        ],
      });

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.insert.tableColumn({ select: true });

      expect(editor.read.children()).toMatchObject(output.children!);
      expect(editor.read.selection()).toEqual(output.selection!);
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts using atCell (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = makeTableWithCols({
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
      });

      const output = makeTableWithCols({
        cursorPath: [1, 1],
        rowCols: [
          ['11', '', '12'],
          ['21', '', '22'],
        ],
      });

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.insert.tableColumn({ fromCell: [0, 1, 0], select: true });

      expect(editor.read.children()).toMatchObject(output.children!);
      expect(editor.read.selection()).toEqual(output.selection!);
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts using at (disableMerge: $disableMerge)', ({ disableMerge }) => {
      const input = makeTableWithCols({
        cursorPath: [1, 0],
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
      });

      const output = makeTableWithCols({
        cursorPath: [1, 0],
        rowCols: [
          ['', '11', '12'],
          ['', '21', '22'],
        ],
      });

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.insert.tableColumn({ at: [0, 0, 0], select: true });

      expect(editor.read.children()).toMatchObject(output.children!);
      expect(editor.read.selection()).toEqual(output.selection!);
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts a column before the current column (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = makeTableWithCols({
        cursorPath: [1, 1],
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
      });

      const output = makeTableWithCols({
        cursorPath: [1, 1],
        rowCols: [
          ['11', '', '12'],
          ['21', '', '22'],
        ],
      });

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.insert.tableColumn({ before: true, select: true });

      expect(editor.read.children()).toMatchObject(output.children!);
      expect(editor.read.selection()).toEqual(output.selection!);
    });
  });

  describe('with initialTableWidth', () => {
    describe('when inserting at last column with width less than initialTableWidth', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('adds the last column width to colSizes (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = makeTableWithCols({
          colSizes: [20, 30],
          cursorPath: [1, 1],
          rowCols: [
            ['11', '12'],
            ['21', '22'],
          ],
        });

        const output = makeTableWithCols({
          colSizes: [20, 30, 30],
          cursorPath: [1, 2],
          rowCols: [
            ['11', '12', ''],
            ['21', '22', ''],
          ],
        });

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 100,
            minColumnWidth: 10,
          }),
          selection: input.selection,
          value: input.children,
        });

        editor.update.insert.tableColumn();

        expect(editor.read.children()).toMatchObject(output.children!);
      });
    });

    describe('when inserting at first column', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('adds the second column width to colSizes (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = makeTableWithCols({
          colSizes: [20, 30],
          cursorPath: [0, 0],
          rowCols: [
            ['11', '12'],
            ['21', '22'],
          ],
        });

        const output = makeTableWithCols({
          colSizes: [20, 30, 30],
          cursorPath: [1, 1],
          rowCols: [
            ['11', '', '12'],
            ['21', '', '22'],
          ],
        });

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 100,
            minColumnWidth: 10,
          }),
          selection: input.selection,
          value: input.children,
        });

        editor.update.insert.tableColumn();

        expect(editor.read.children()).toMatchObject(output.children!);
      });

      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('adds the first column width to colSizes using at (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = makeTableWithCols({
          colSizes: [20, 30],
          cursorPath: [0, 0],
          rowCols: [
            ['11', '12'],
            ['21', '22'],
          ],
        });

        const output = makeTableWithCols({
          colSizes: [20, 20, 30],
          cursorPath: [1, 0],
          rowCols: [
            ['', '11', '12'],
            ['', '21', '22'],
          ],
        });

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 100,
            minColumnWidth: 10,
          }),
          selection: input.selection,
          value: input.children,
        });

        editor.update.insert.tableColumn({ at: [0, 0, 0] });

        expect(editor.read.children()).toMatchObject(output.children!);
      });
    });

    describe('when new total width is greater than initialTableWidth', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('shrinks all columns by the same factor (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = makeTableWithCols({
          colSizes: [20, 30, 40],
          cursorPath: [0, 0],
          rowCols: [
            ['11', '12', '13'],
            ['21', '22', '23'],
          ],
        });

        const output = makeTableWithCols({
          colSizes: [20, 30, 30, 40].map((w) => Math.floor((w * 100) / 120)),
          cursorPath: [1, 1],
          rowCols: [
            ['11', '', '12', '13'],
            ['21', '', '22', '23'],
          ],
        });

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 100,
            minColumnWidth: 10,
          }),
          selection: input.selection,
          value: input.children,
        });

        editor.update.insert.tableColumn();

        expect(editor.read.children()).toMatchObject(output.children!);
      });

      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('does not shrink columns below minColumnsWidth (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = makeTableWithCols({
          colSizes: Array.from<number>({ length: 10 }).fill(10),
          cursorPath: [0, 0],
          rowCols: [
            Array.from<string>({ length: 10 }).fill(''),
            Array.from<string>({ length: 10 }).fill(''),
          ],
        });

        const output = makeTableWithCols({
          colSizes: Array.from<number>({ length: 11 }).fill(10),
          cursorPath: [1, 1],
          rowCols: [
            Array.from<string>({ length: 11 }).fill(''),
            Array.from<string>({ length: 11 }).fill(''),
          ],
        });

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 100,
            minColumnWidth: 10,
          }),
          selection: input.selection,
          value: input.children,
        });

        editor.update.insert.tableColumn();

        expect(editor.read.children()).toMatchObject(output.children!);
      });
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts a column before and adjusts column sizes (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = makeTableWithCols({
        colSizes: [20, 30],
        cursorPath: [1, 1],
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
      });

      const output = makeTableWithCols({
        colSizes: [20, 30, 30],
        cursorPath: [1, 1],
        rowCols: [
          ['11', '', '12'],
          ['21', '', '22'],
        ],
      });

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({
          disableMerge,
          initialTableWidth: 100,
          minColumnWidth: 10,
        }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.insert.tableColumn({ before: true });

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('when inserting after adding a row', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('keeps the correct number of cells (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
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
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      // Insert row first
      editor.update.insert.tableRow();

      // Then insert column
      editor.update.insert.tableColumn();

      // Count cells in each row
      const table = editor.read.children()[0] as Element;
      const rows = table.children as Element[];

      // Should have 3 rows with 3 cells each
      expect(rows).toHaveLength(3);
      expect(rows[0].children).toHaveLength(3);
      expect(rows[1].children).toHaveLength(3);
      expect(rows[2].children).toHaveLength(3);
    });
  });
});
