/** @jsxRuntime classic */
/** @jsx jsxt */

import {
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '#platejs-test-internal';

import type { Element } from '../../../core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

describe('table insertion slow contracts', () => {
  jsxt;

  describe('when inserting a table', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'inserts a table at the current selection (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hp>test</hp>
            <htable>
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
              <htr>
                <htd>
                  <hp>
                    <htext />
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
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.table.insert({ columns: 2, rows: 2 }, { select: true });

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      }
    );

    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'inserts a table at the specified path (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <hp>test</hp>
            <hp>
              another
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <htable>
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
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>test</hp>
            <hp>another</hp>
          </editor>
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.table.insert(
          { columns: 2, rows: 2 },
          { at: [0], select: true }
        );

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      }
    );

    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'inserts a table after the current table when no path is specified (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    existing
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
                <htd>
                  <hp>existing</hp>
                </htd>
              </htr>
            </htable>
            <htable>
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
              <htr>
                <htd>
                  <hp>
                    <htext />
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
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.table.insert({ columns: 2, rows: 2 }, { select: true });

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      }
    );

    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'respects the specified path even when inside a table (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <hp>before</hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    existing
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>after</hp>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hp>before</hp>
            <htable>
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
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
            </htable>
            <htable>
              <htr>
                <htd>
                  <hp>existing</hp>
                </htd>
              </htr>
            </htable>
            <hp>after</hp>
          </editor>
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.table.insert(
          { columns: 2, rows: 2 },
          { at: [1], select: true }
        );

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      }
    );

    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'inserts a table after the current table when inside a table (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    existing
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
                <htd>
                  <hp>existing</hp>
                </htd>
              </htr>
            </htable>
            <htable>
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
              <htr>
                <htd>
                  <hp>
                    <htext />
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
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.table.insert({ columns: 2, rows: 2 }, { select: true });

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      }
    );
  });

  {
    jsxt;

    type MakeTableWithColsOptions = {
      rowCols: string[][];
      columnWidths?: Array<number | null>;
      cursorPath?: [number, number];
    };

    const makeTableWithCols = ({
      columnWidths,
      cursorPath,
      rowCols,
    }: MakeTableWithColsOptions): TestEditor => {
      const children = [
        {
          ...(columnWidths ? { columnWidths } : {}),
          children: rowCols.map((row) => ({
            children: row.map((text) => ({
              children: [{ children: [{ text }], type: 'paragraph' }],
              type: 'tableCell',
            })),
            type: 'tableRow',
          })),
          type: 'table',
        },
      ];

      if (!cursorPath) return { children };

      const path = [0, cursorPath[0], cursorPath[1], 0, 0];
      const offset = rowCols[cursorPath[0]][cursorPath[1]].length;

      return {
        children,
        selection: {
          kind: 'text',
          anchor: { offset, path },
          focus: { offset, path },
        },
      };
    };

    describe('update.insertColumn', () => {
      describe('without defaultTableWidth', () => {
        it.each([
          { allowCellSpanEditing: false },
          { allowCellSpanEditing: true },
        ])(
          'inserts at the last column (allowCellSpanEditing: $allowCellSpanEditing)',
          ({ allowCellSpanEditing }) => {
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

            const editor = createTestTableEditor({
              plugins: getTestTablePlugins({ allowCellSpanEditing }),
              selection: input.selection,
              initialValue: input.children,
            });

            editor.update.table.insertColumn({ select: true });

            expect(editor.read.children()).toMatchObject(output.children);
            expect(editor.read.selection()).toEqual(
              projectTestSelectionRange(output.selection)
            );
          }
        );

        it.each([
          { allowCellSpanEditing: false },
          { allowCellSpanEditing: true },
        ])(
          'inserts after an explicit cell (allowCellSpanEditing: $allowCellSpanEditing)',
          ({ allowCellSpanEditing }) => {
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

            const editor = createTestTableEditor({
              plugins: getTestTablePlugins({ allowCellSpanEditing }),
              selection: input.selection,
              initialValue: input.children,
            });

            editor.update.table.insertColumn({
              at: [0, 1, 0],
              select: true,
            });

            expect(editor.read.children()).toMatchObject(output.children);
            expect(editor.read.selection()).toEqual(
              projectTestSelectionRange(output.selection)
            );
          }
        );

        it.each([
          { allowCellSpanEditing: false },
          { allowCellSpanEditing: true },
        ])(
          'inserts using at (allowCellSpanEditing: $allowCellSpanEditing)',
          ({ allowCellSpanEditing }) => {
            const input = makeTableWithCols({
              cursorPath: [1, 0],
              rowCols: [
                ['11', '12'],
                ['21', '22'],
              ],
            });

            const output = makeTableWithCols({
              cursorPath: [0, 0],
              rowCols: [
                ['', '11', '12'],
                ['', '21', '22'],
              ],
            });

            const editor = createTestTableEditor({
              plugins: getTestTablePlugins({ allowCellSpanEditing }),
              selection: input.selection,
              initialValue: input.children,
            });

            editor.update.table.insertColumn({
              at: [0, 0, 0],
              before: true,
              select: true,
            });

            expect(editor.read.children()).toMatchObject(output.children);
            expect(editor.read.selection()).toEqual(
              projectTestSelectionRange(output.selection)
            );
          }
        );

        it.each([
          { allowCellSpanEditing: false },
          { allowCellSpanEditing: true },
        ])(
          'inserts a column before the current column (allowCellSpanEditing: $allowCellSpanEditing)',
          ({ allowCellSpanEditing }) => {
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

            const editor = createTestTableEditor({
              plugins: getTestTablePlugins({ allowCellSpanEditing }),
              selection: input.selection,
              initialValue: input.children,
            });

            editor.update.table.insertColumn({ before: true, select: true });

            expect(editor.read.children()).toMatchObject(output.children);
            expect(editor.read.selection()).toEqual(
              projectTestSelectionRange(output.selection)
            );
          }
        );
      });

      describe('without defaultTableWidth', () => {
        it.each([
          { allowCellSpanEditing: false },
          { allowCellSpanEditing: true },
        ])(
          'uses null for the unknown inserted width (allowCellSpanEditing: $allowCellSpanEditing)',
          ({ allowCellSpanEditing }) => {
            const input = makeTableWithCols({
              columnWidths: [20, 30],
              cursorPath: [1, 1],
              rowCols: [
                ['11', '12'],
                ['21', '22'],
              ],
            });
            const editor = createTestTableEditor({
              plugins: getTestTablePlugins({ allowCellSpanEditing }),
              selection: input.selection,
              initialValue: input.children,
            });

            editor.update.table.insertColumn();

            expect(editor.read.children()).toMatchObject([
              { columnWidths: [20, 30, null] },
            ]);
          }
        );
      });

      describe('with defaultTableWidth', () => {
        describe('when inserting at last column with width less than defaultTableWidth', () => {
          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'adds the last column width to columnWidths (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: [20, 30],
                cursorPath: [1, 1],
                rowCols: [
                  ['11', '12'],
                  ['21', '22'],
                ],
              });

              const output = makeTableWithCols({
                columnWidths: [20, 30, 30],
                cursorPath: [1, 2],
                rowCols: [
                  ['11', '12', ''],
                  ['21', '22', ''],
                ],
              });

              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 100,
                  minColumnWidth: 10,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn();

              expect(editor.read.children()).toMatchObject(output.children);
            }
          );
        });

        describe('when inserting at first column', () => {
          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'adds the second column width to columnWidths (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: [20, 30],
                cursorPath: [0, 0],
                rowCols: [
                  ['11', '12'],
                  ['21', '22'],
                ],
              });

              const output = makeTableWithCols({
                columnWidths: [20, 30, 30],
                cursorPath: [1, 1],
                rowCols: [
                  ['11', '', '12'],
                  ['21', '', '22'],
                ],
              });

              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 100,
                  minColumnWidth: 10,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn();

              expect(editor.read.children()).toMatchObject(output.children);
            }
          );

          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'adds the first column width to columnWidths using at (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: [20, 30],
                cursorPath: [0, 0],
                rowCols: [
                  ['11', '12'],
                  ['21', '22'],
                ],
              });

              const output = makeTableWithCols({
                columnWidths: [20, 20, 30],
                cursorPath: [1, 0],
                rowCols: [
                  ['', '11', '12'],
                  ['', '21', '22'],
                ],
              });

              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 100,
                  minColumnWidth: 10,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn({ at: [0, 0, 0], before: true });

              expect(editor.read.children()).toMatchObject(output.children);
            }
          );
        });

        describe('when new total width is greater than defaultTableWidth', () => {
          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'keeps scaled widths positive (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: [1],
                cursorPath: [0, 0],
                rowCols: [['11']],
              });
              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 1,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn();

              expect(editor.read.children()).toMatchObject([
                { columnWidths: [48, 48] },
              ]);
            }
          );

          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'handles an empty width array (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: [],
                cursorPath: [0, 0],
                rowCols: [['11']],
              });
              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 100,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn();

              const table = editor.read.nodes.get([0], {
                type: BaseTablePlugin,
              })![0];
              expect(
                editor.plugin(BaseTablePlugin).api.columnWidths(table)
              ).toEqual([50, 50]);
              expect(table.columnWidths).toEqual([null, null]);
            }
          );

          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'keeps partial widths within the table width (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: [100, null],
                cursorPath: [0, 0],
                rowCols: [['11', '12']],
              });
              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 200,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn({ at: [0, 0, 0], before: true });

              const table = editor.read.nodes.get([0], {
                type: BaseTablePlugin,
              })![0];
              const widths = editor
                .plugin(BaseTablePlugin)
                .api.columnWidths(table);

              expect(widths).toHaveLength(3);
              expect(widths.every((width) => width > 0)).toBe(true);
              expect(
                widths.reduce((total, width) => total + width, 0)
              ).toBeLessThanOrEqual(200);
            }
          );

          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'shrinks all columns by the same factor (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: [20, 30, 40],
                cursorPath: [0, 0],
                rowCols: [
                  ['11', '12', '13'],
                  ['21', '22', '23'],
                ],
              });

              const output = makeTableWithCols({
                columnWidths: [20, 30, 30, 40].map((w) =>
                  Math.floor((w * 100) / 120)
                ),
                cursorPath: [1, 1],
                rowCols: [
                  ['11', '', '12', '13'],
                  ['21', '', '22', '23'],
                ],
              });

              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 100,
                  minColumnWidth: 10,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn();

              expect(editor.read.children()).toMatchObject(output.children);
            }
          );

          it.each([
            { allowCellSpanEditing: false },
            { allowCellSpanEditing: true },
          ])(
            'does not shrink columns below minColumnsWidth (allowCellSpanEditing: $allowCellSpanEditing)',
            ({ allowCellSpanEditing }) => {
              const input = makeTableWithCols({
                columnWidths: Array.from<number>({ length: 10 }).fill(10),
                cursorPath: [0, 0],
                rowCols: [
                  Array.from<string>({ length: 10 }).fill(''),
                  Array.from<string>({ length: 10 }).fill(''),
                ],
              });

              const output = makeTableWithCols({
                columnWidths: Array.from<number>({ length: 11 }).fill(10),
                cursorPath: [1, 1],
                rowCols: [
                  Array.from<string>({ length: 11 }).fill(''),
                  Array.from<string>({ length: 11 }).fill(''),
                ],
              });

              const editor = createTestTableEditor({
                plugins: getTestTablePlugins({
                  allowCellSpanEditing,
                  defaultTableWidth: 100,
                  minColumnWidth: 10,
                }),
                selection: input.selection,
                initialValue: input.children,
              });

              editor.update.table.insertColumn();

              expect(editor.read.children()).toMatchObject(output.children);
            }
          );
        });

        it.each([
          { allowCellSpanEditing: false },
          { allowCellSpanEditing: true },
        ])(
          'inserts a column before and adjusts column sizes (allowCellSpanEditing: $allowCellSpanEditing)',
          ({ allowCellSpanEditing }) => {
            const input = makeTableWithCols({
              columnWidths: [20, 30],
              cursorPath: [1, 1],
              rowCols: [
                ['11', '12'],
                ['21', '22'],
              ],
            });

            const output = makeTableWithCols({
              columnWidths: [20, 30, 30],
              cursorPath: [1, 1],
              rowCols: [
                ['11', '', '12'],
                ['21', '', '22'],
              ],
            });

            const editor = createTestTableEditor({
              plugins: getTestTablePlugins({
                allowCellSpanEditing,
                defaultTableWidth: 100,
                minColumnWidth: 10,
              }),
              selection: input.selection,
              initialValue: input.children,
            });

            editor.update.table.insertColumn({ before: true });

            expect(editor.read.children()).toMatchObject(output.children);
          }
        );
      });

      describe('when inserting after adding a row', () => {
        it.each([
          { allowCellSpanEditing: false },
          { allowCellSpanEditing: true },
        ])(
          'keeps the correct number of cells (allowCellSpanEditing: $allowCellSpanEditing)',
          ({ allowCellSpanEditing }) => {
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

            const editor = createTestTableEditor({
              plugins: getTestTablePlugins({ allowCellSpanEditing }),
              selection: input.selection,
              initialValue: input.children,
            });

            // Insert row first
            editor.update.table.insertRow();

            // Then insert column
            editor.update.table.insertColumn();

            // Count cells in each row
            const table = editor.read.children()[0] as Element;
            const rows = table.children as Element[];

            // Should have 3 rows with 3 cells each
            expect(rows).toHaveLength(3);
            expect(rows[0].children).toHaveLength(3);
            expect(rows[1].children).toHaveLength(3);
            expect(rows[2].children).toHaveLength(3);
          }
        );
      });
    });
  }
});
