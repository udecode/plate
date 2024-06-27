/* eslint-disable react/jsx-key */
/** @jsx jsx */

import { type TEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createTablePlugin } from '../createTablePlugin';
import { insertTableColumn } from './insertTableColumn';

jsx;

type MakeTableWithColsOptions = {
  colSizes?: number[];
  cursorPath?: [number, number];
  rowCols: string[][];
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
  ) as unknown as TEditor;

describe('insertTableColumn', () => {
  describe('without initialTableWidth', () => {
    const editorOptions = {
      plugins: [createTablePlugin()],
    };

    it('should insert at last column', () => {
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
        cursorPath: [1, 1],
        rowCols: [
          ['11', '', '12'],
          ['21', '', '22'],
        ],
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
            editor: input,
            ...editorOptions,
          });

          insertTableColumn(editor);

          expect(editor.children).toEqual(output.children);
        });

        it('should add the first column width to colSizes using at', () => {
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
          editor: input,
          ...editorOptions,
        });

        insertTableColumn(editor);

        expect(editor.children).toEqual(output.children);
      });

      it('should not shrink columns below minColumnsWidth', () => {
        const input = makeTableWithCols({
          colSizes: Array.from<number>({ length: 10 }).fill(10), // total width is 100
          cursorPath: [0, 0],
          rowCols: [
            Array.from<string>({ length: 10 }).fill(''),
            Array.from<string>({ length: 10 }).fill(''),
          ],
        });

        const output = makeTableWithCols({
          colSizes: Array.from<number>({ length: 11 }).fill(10), // cannot shrink below 10
          cursorPath: [1, 1],
          rowCols: [
            Array.from<string>({ length: 11 }).fill(''),
            Array.from<string>({ length: 11 }).fill(''),
          ],
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
