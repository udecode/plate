/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { createPlateEditor } from '@platejs/core/react';
import { NodeApi } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';
import type { TTableElement, TTableRowElement } from '@platejs/utils';
import assert from 'node:assert/strict';

describe('table merge', () => {
  describe('deleteRowWhenExpanded', () => {
    it('removes every row covered by a selected rowspan cell', () => {
      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge: true }),
        selection: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 2, path: [0, 0, 1, 0, 0] },
          kind: 'text',
        },
        initialValue: [
          {
            children: [
              {
                children: [
                  {
                    children: [{ children: [{ text: '11' }], type: 'p' }],
                    rowSpan: 2,
                    type: 'td',
                  },
                  {
                    children: [{ children: [{ text: '12' }], type: 'p' }],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: '22' }], type: 'p' }],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: '31' }], type: 'p' }],
                    type: 'td',
                  },
                  {
                    children: [{ children: [{ text: '32' }], type: 'p' }],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ],
      });

      editor.update.table.removeRow();

      const table = editor.read.nodes.get<TTableElement>([0]);
      assert(table);

      expect(table[0].children).toHaveLength(1);
      expect(editor.read.text.string([0])).toBe('3132');
    });
  });

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('getTableMergeGridByRange', () => {
      it('returns both cell entries and a table entry for format=all', () => {
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
        const result = editor.plugin(BaseTablePlugin).api.getMergeGridByRange({
          at: editor.read.selection()!,
          format: 'all',
        });

        expect(result.cellEntries).toHaveLength(4);
        expect(result.tableEntries).toHaveLength(1);
        expect(result.tableEntries[0]?.[1]).toEqual([0]);
        const table = result.tableEntries[0]?.[0];
        const firstRow = table?.children[0] as TTableRowElement | undefined;

        expect(table?.children).toHaveLength(2);
        expect(firstRow?.children).toHaveLength(2);
      });

      it('returns only the cell entries for format=cell', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd colSpan={2}>
                  <hp>
                    <anchor />
                    11
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
                  <hp>
                    22
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp>23</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const result = editor.plugin(BaseTablePlugin).api.getMergeGridByRange({
          at: editor.read.selection()!,
          format: 'cell',
        });

        expect(result.map(([cell]) => NodeApi.string(cell))).toEqual([
          '11',
          '21',
          '22',
        ]);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('insertTableMergeColumn', () => {
      it('treats a table path as insert-at-end using the last cell of the first row', () => {
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
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.insertColumn({ at: [0], select: true });

        const entry = editor.read.nodes.get<TTableElement>([0]);
        assert(entry);
        const [table] = entry;
        const rows = table.children as TTableRowElement[];

        expect(rows[0].children).toHaveLength(3);
        expect(rows[1].children).toHaveLength(3);
      });

      it('extends spanning cells and updates colspan attributes when inserting inside a merged span', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd attributes={{ colspan: '2' }} colSpan={2}>
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

        editor.update.table.insertColumn({ at: [0, 0, 1] });

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    attributes: { colspan: '3' },
                    colSpan: 3,
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
              {
                children: [
                  { type: 'td' },
                  { colSpan: 1, rowSpan: 1, type: 'td' },
                  { type: 'td' },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ]);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('insertTableMergeRow', () => {
      it('treats a table path as insert-at-end using the last row', () => {
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
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.insertRow({ at: [0], select: true });

        const entry = editor.read.nodes.get<TTableElement>([0]);
        assert(entry);
        expect(entry[0].children).toHaveLength(3);
      });

      it('extends row-spanning cells and updates rowspan attributes when inserting inside a merged span', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd attributes={{ rowspan: '2' }} rowSpan={2}>
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
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.insertRow({ at: [0, 1] });

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    attributes: { rowspan: '3' },
                    rowSpan: 3,
                    type: 'td',
                  },
                  { type: 'td' },
                ],
                type: 'tr',
              },
              {
                children: [{ colSpan: 1, rowSpan: 1, type: 'td' }],
                type: 'tr',
              },
              {
                children: [{ type: 'td' }],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ]);
      });
    });
  }
});
