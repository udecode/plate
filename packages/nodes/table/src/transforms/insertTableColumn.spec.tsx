/* eslint-disable react/jsx-key */
/** @jsx jsx */

import { createPlateEditor, TEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { insertTableColumn } from './insertTableColumn';

import { createTablePlugin } from '@/nodes/table/src/createTablePlugin';

jsx;

type MakeTableWithColsOptions = {
  rowCols: string[][];
  cursorPath?: [number, number];
  colSizes?: number[];
};

const makeTableWithCols = ({
  rowCols,
  cursorPath,
  colSizes,
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
  ) as unknown as TEditor;

describe('insertTableColumn', () => {
  describe('without initialTableWidth', () => {
    const editorOptions = {
      plugins: [
        createTablePlugin({
          options: { newCellChildren: [{ text: '' }] },
        }),
      ],
    };

    it('should insert at last column', () => {
      const input = makeTableWithCols({
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
        cursorPath: [1, 1],
      });

      const output = makeTableWithCols({
        rowCols: [
          ['11', '12', ''],
          ['21', '22', ''],
        ],
        cursorPath: [1, 2],
      });

      const editor = createPlateEditor({
        editor: input,
        ...editorOptions,
      });

      insertTableColumn(editor);

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should insert using atCell', () => {
      const input = makeTableWithCols({
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
      });

      const output = makeTableWithCols({
        rowCols: [
          ['11', '', '12'],
          ['21', '', '22'],
        ],
        cursorPath: [1, 1],
      });

      const editor = createPlateEditor({
        editor: input,
        ...editorOptions,
      });

      insertTableColumn(editor, { fromCell: [0, 1, 0] });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should insert using at', () => {
      const input = makeTableWithCols({
        rowCols: [
          ['11', '12'],
          ['21', '22'],
        ],
        cursorPath: [1, 0],
      });

      const output = makeTableWithCols({
        rowCols: [
          ['', '11', '12'],
          ['', '21', '22'],
        ],
        cursorPath: [1, 0],
      });

      const editor = createPlateEditor({
        editor: input,
        ...editorOptions,
      });

      insertTableColumn(editor, { at: [0, 0, 0] });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('with initialTableWidth', () => {
    const editorOptions = {
      plugins: [
        createTablePlugin({
          options: {
            newCellChildren: [{ text: '' }],
            initialTableWidth: 100,
            minColumnWidth: 10,
          },
        }),
      ],
    };

    describe('when new total width is less than initialTableWidth', () => {
      describe('when inserting at last column', () => {
        it('should add the last column width to colSizes', () => {
          const input = makeTableWithCols({
            rowCols: [
              ['11', '12'],
              ['21', '22'],
            ],
            cursorPath: [1, 1],
            colSizes: [20, 30],
          });

          const output = makeTableWithCols({
            rowCols: [
              ['11', '12', ''],
              ['21', '22', ''],
            ],
            cursorPath: [1, 2],
            colSizes: [20, 30, 30],
          });

          const editor = createPlateEditor({
            editor: input,
            ...editorOptions,
          });

          insertTableColumn(editor);

          expect(editor.children).toEqual(output.children);
        });
      });

      describe('when inserting at first column', () => {
        it('should add the second column width to colSizes', () => {
          const input = makeTableWithCols({
            rowCols: [
              ['11', '12'],
              ['21', '22'],
            ],
            cursorPath: [0, 0],
            colSizes: [20, 30],
          });

          const output = makeTableWithCols({
            rowCols: [
              ['11', '', '12'],
              ['21', '', '22'],
            ],
            cursorPath: [1, 1],
            colSizes: [20, 30, 30],
          });

          const editor = createPlateEditor({
            editor: input,
            ...editorOptions,
          });

          insertTableColumn(editor);

          expect(editor.children).toEqual(output.children);
        });

        it('should add the first column width to colSizes using at', () => {
          const input = makeTableWithCols({
            rowCols: [
              ['11', '12'],
              ['21', '22'],
            ],
            cursorPath: [0, 0],
            colSizes: [20, 30],
          });

          const output = makeTableWithCols({
            rowCols: [
              ['', '11', '12'],
              ['', '21', '22'],
            ],
            cursorPath: [1, 0],
            colSizes: [20, 20, 30],
          });

          const editor = createPlateEditor({
            editor: input,
            ...editorOptions,
          });

          insertTableColumn(editor, {
            at: [0, 0, 0],
          });

          expect(editor.children).toEqual(output.children);
        });
      });
    });

    describe('when new total width is greater than initialTableWidth', () => {
      it('should shrink all columns by the same factor to fit initialTableWidth', () => {
        const input = makeTableWithCols({
          rowCols: [
            ['11', '12', '13'],
            ['21', '22', '23'],
          ],
          cursorPath: [0, 0],
          colSizes: [20, 30, 40],
        });

        const output = makeTableWithCols({
          rowCols: [
            ['11', '', '12', '13'],
            ['21', '', '22', '23'],
          ],
          cursorPath: [1, 1],
          colSizes: [20, 30, 30, 40].map((w) => Math.floor((w * 100) / 120)),
        });

        const editor = createPlateEditor({
          editor: input,
          ...editorOptions,
        });

        insertTableColumn(editor);

        expect(editor.children).toEqual(output.children);
      });

      it('should not shrink columns below minColumnsWidth', () => {
        const input = makeTableWithCols({
          rowCols: [Array(10).fill(''), Array(10).fill('')],
          cursorPath: [0, 0],
          colSizes: Array(10).fill(10), // total width is 100
        });

        const output = makeTableWithCols({
          rowCols: [Array(11).fill(''), Array(11).fill('')],
          cursorPath: [1, 1],
          colSizes: Array(11).fill(10), // cannot shrink below 10
        });

        const editor = createPlateEditor({
          editor: input,
          ...editorOptions,
        });

        insertTableColumn(editor);

        expect(editor.children).toEqual(output.children);
      });
    });
  });
});
