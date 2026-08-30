/** @jsx jsxt */

import assert from 'node:assert/strict';

import {
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '#platejs-test-internal';

import { NodeApi } from '../../../core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import type { TableCellElement, TableRowElement } from './BaseTablePlugin';
import { BaseTablePlugin } from './BaseTablePlugin';

describe('table merge slow contracts', () => {
  {
    jsxt;

    const createTableEditor = (
      input: TestEditor,
      { disableMerge = false }: { disableMerge?: boolean } = {}
    ) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

    const getTable = (editor: ReturnType<typeof createTableEditor>) => {
      const entry = editor.read.nodes.get([0], { type: BaseTablePlugin });
      assert.ok(entry);

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

          editor.plugin(BaseTablePlugin).update.merge();

          const table = getTable(editor);
          const firstRow = table.children[0] as TableRowElement;
          const mergedCell = firstRow.children[0] as TableCellElement;

          expect(firstRow.children).toHaveLength(1);
          expect(mergedCell).toMatchObject({
            colSpan: 2,
            rowSpan: 2,
            type: 'tableCell',
          });
          expect(
            mergedCell.children.map((child) => NodeApi.string(child))
          ).toEqual(['11', '12', '21', '22']);
          expect(editor.read.selection()).toEqual({
            anchor: { offset: 2, path: [0, 0, 0, 3, 0] },
            focus: { offset: 2, path: [0, 0, 0, 3, 0] },
          });
        });

        it('preserves nested tables while merging outer cells', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>
                      <anchor />
                      outer
                    </hp>
                    <htable>
                      <htr>
                        <htd>
                          <hp>nested</hp>
                        </htd>
                      </htr>
                    </htable>
                  </htd>
                  <htd>
                    <hp>
                      second
                      <focus />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;
          const editor = createTableEditor(input);

          editor.plugin(BaseTablePlugin).update.merge();

          const table = getTable(editor);
          const firstRow = table.children[0] as TableRowElement;
          const mergedCell = firstRow.children[0] as TableCellElement;

          expect(firstRow.children).toHaveLength(1);
          expect(mergedCell.children.map((child) => child.type)).toEqual([
            'paragraph',
            'table',
            'paragraph',
          ]);
          expect(NodeApi.string(mergedCell.children[1])).toBe('nested');
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
                  <htd>
                    <hp>
                      merged
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

          const editor = createTableEditor(input);

          editor.plugin(BaseTablePlugin).update.split();

          expect(editor.read.children()).toMatchObject(output.children);
          expect(editor.read.selection()).toEqual(
            projectTestSelectionRange(output.selection)
          );
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

          editor.plugin(BaseTablePlugin).update.split();

          const table = getTable(editor);
          const rows = table.children as TableRowElement[];

          expect(rows[0].children).toHaveLength(3);
          expect(NodeApi.string(rows[0].children[2])).toBe('13');
          expect(rows[1].children).toHaveLength(3);
          expect(NodeApi.string(rows[1].children[2])).toBe('23');
        });
      });

      describe('removeRow with expanded selections', () => {
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

          editor.update.table.removeRow();

          expect(editor.read.children()).toMatchObject(output.children);
          expect(editor.read.selection()).toEqual(
            projectTestSelectionRange(output.selection)
          );
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

          editor.update.table.removeRow();

          expect(editor.read.children()).toMatchObject(input.children);
          expect(editor.read.selection()).toEqual(
            projectTestSelectionRange(input.selection)
          );
        });
      });

      describe('removeColumn with expanded selections', () => {
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

          editor.update.table.removeColumn();

          expect(editor.read.children()).toMatchObject(output.children);
          expect(editor.read.selection()).toEqual(
            projectTestSelectionRange(output.selection)
          );
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

          editor.update.table.removeColumn();

          expect(editor.read.children()).toMatchObject(input.children);
          expect(editor.read.selection()).toEqual(
            projectTestSelectionRange(input.selection)
          );
        });
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('removeColumn with spans', () => {
      it('deletes a selected column spanning every row', () => {
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

        const editor = createTableEditor(input);

        editor.update.table.removeColumn();

        expect(editor.read.text.string([0])).toBe('1222');
        expect(
          editor.read.nodes.toArray({ at: [], type: 'tableCell' })
        ).toHaveLength(2);
      });

      it('shrinks spanning cells and table columnWidths when deleting a merged column', () => {
        const input = (
          <editor>
            <htable columnWidths={[40, 60]}>
              <htr>
                <htd colSpan={2}>
                  <hp>11</hp>
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

        const editor = createTableEditor(input);

        editor.update.table.removeColumn();

        expect(editor.read.children()).toMatchObject([
          {
            columnWidths: [40],
            type: 'table',
            children: [
              {
                children: [
                  {
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: '21' }] }],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
          },
        ]);
      });

      it('removes every colSize covered by the selected spanning cell', () => {
        const input = (
          <editor>
            <htable columnWidths={[40, 50, 60]}>
              <htr>
                <htd colSpan={2}>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>13</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
                <htd>
                  <hp>23</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeColumn();

        expect(editor.read.children()).toMatchObject([{ columnWidths: [60] }]);
        expect(editor.read.text.string([0])).toBe('1323');
        expect(
          editor.read.nodes.toArray({ at: [], type: 'tableCell' })
        ).toHaveLength(2);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('removeRow with spans', () => {
      it('moves row-spanning cells into the next remaining row', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
                <htd rowSpan={2}>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>31</hp>
                </htd>
                <htd>
                  <hp>32</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeRow();

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    children: [{ children: [{ text: '21' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '12' }] }],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: '31' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '32' }] }],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ]);
      });

      it('shrinks rowSpan on cells that started before the deleted row', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd rowSpan={2}>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    22
                    <cursor />
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>31</hp>
                </htd>
                <htd>
                  <hp>32</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeRow();

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    children: [{ children: [{ text: '11' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '12' }] }],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: '31' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '32' }] }],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ]);
      });

      it('inserts moved row-span cells before the next matching column and updates rowspan attributes', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>00</hp>
                </htd>
                <htd>
                  <hp>01</hp>
                </htd>
                <htd>
                  <hp>02</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    10
                    <cursor />
                  </hp>
                </htd>
                <htd rowSpan={2}>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>20</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeRow();

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    children: [{ children: [{ text: '00' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '01' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '02' }] }],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: '20' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '11' }] }],
                    type: 'tableCell',
                  },
                  {
                    children: [{ children: [{ text: '22' }] }],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ]);
      });

      it('keeps the last remaining row intact', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    only
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeRow();

        expect(editor.read.children()).toMatchObject(input.children);
      });
    });
  }
});
