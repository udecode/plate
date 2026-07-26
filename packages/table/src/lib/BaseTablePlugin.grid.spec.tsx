/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';
import { schema, type Value } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';
import assert from 'node:assert/strict';

describe('table grid queries', () => {
  const value: Value = [
    {
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: '11' }], type: 'p' }],
              id: 'c11',
              type: 'td',
            },
            {
              children: [{ children: [{ text: '12' }], type: 'p' }],
              id: 'c12',
              type: 'td',
            },
          ],
          type: 'tr',
        },
      ],
      type: 'table',
    },
  ];

  describe('getCellIndices', () => {
    it('derives cells from the immutable initial value', () => {
      const initialValue = structuredClone(value);
      const inputSnapshot = structuredClone(initialValue);
      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue,
      });

      expect(
        editor.plugin(BaseTablePlugin).getOption('cellIndices', 'c11')
      ).toEqual({ col: 0, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).getOption('cellIndices', 'c12')
      ).toEqual({ col: 1, row: 0 });
      expect(initialValue).toEqual(inputSnapshot);
    });

    it('skips the synthetic root when the configured table type is root', () => {
      const initialValue = [{ ...structuredClone(value[0]), type: 'root' }];
      const editor = createPlateEditor({
        nodeId: true,
        plugins: [
          BaseTablePlugin.configure({
            options: { disableMerge: true },
            type: 'root',
          }),
        ],
        initialValue,
      });

      expect(
        editor.plugin(BaseTablePlugin).getOption('cellIndices', 'c11')
      ).toEqual({ col: 0, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).getOption('cellIndices', 'c12')
      ).toEqual({ col: 1, row: 0 });
    });

    it('indexes tables in element-owned content roots', () => {
      const RootHolderPlugin = createPlatePlugin({
        key: 'tableRootHolder',
        schema: {
          element: {
            contentRoots: {
              body: {
                content: schema.content.type('table', {
                  default: { type: 'table' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
            topLevel: true,
            void: 'block',
          },
        },
      });
      const editor = createPlateEditor({
        nodeId: true,
        plugins: [...getTestTablePlugins(), RootHolderPlugin],
        initialValue: {
          children: [
            {
              childRoots: { body: 'table-root:1' },
              children: [{ text: '' }],
              type: 'tableRootHolder',
            },
          ],
          roots: { 'table-root:1': structuredClone(value) },
        },
      });

      expect(
        editor.plugin(BaseTablePlugin).getOption('cellIndices', 'c11')
      ).toEqual({ col: 0, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).getOption('cellIndices', 'c12')
      ).toEqual({ col: 1, row: 0 });
    });

    it('derives stable indices through the canonical compiler', () => {
      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: value,
      });
      const entry = editor.read.nodes.get<TTableCellElement>([0, 0, 1]);
      assert(entry);
      const [cell] = entry;

      expect(editor.plugin(BaseTablePlugin).api.getCellIndices(cell)).toEqual({
        col: 1,
        row: 0,
      });
      expect(
        editor.plugin(BaseTablePlugin).getOption('cellIndices', 'c12')
      ).toEqual({ col: 1, row: 0 });
      expect(editor.plugin(BaseTablePlugin).api.getCellIndices(cell)).toEqual({
        col: 1,
        row: 0,
      });
    });

    it('warns and falls back when the cell does not belong to a table', () => {
      const warn = mock();
      const DebugPlugin = createPlatePlugin({
        key: 'table-test-debug',
        extension: { api: { debug: { warn } } },
      });
      const orphanValue: Value = [{ children: [{ text: '' }], type: 'p' }];
      const editor = createPlateEditor({
        plugins: [...getTestTablePlugins(), DebugPlugin],
        initialValue: orphanValue,
      });
      const cell: TTableCellElement = {
        children: [{ text: '' }],
        id: 'orphan',
        type: 'td',
      };

      expect(editor.plugin(BaseTablePlugin).api.getCellIndices(cell)).toEqual({
        col: 0,
        row: 0,
      });
      expect(warn).toHaveBeenCalledWith(
        'No table grid entry found for element.',
        'TABLE_CELL_INDICES'
      );
    });
  });

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    const getCell = (editor: ReturnType<typeof createTableEditor>) => {
      const entry = editor.read.nodes.get<TTableCellElement>([0, 0, 1]);
      assert(entry);

      return entry[0];
    };

    describe('getTableColumnIndex', () => {
      it('returns the exact sibling index for the same cell object', () => {
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
                <htd>
                  <hp>13</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const cellNode = getCell(editor);

        expect(
          editor.plugin(BaseTablePlugin).api.getColumnIndex(cellNode)
        ).toBe(1);
      });

      it('returns -1 for a detached or cloned cell object', () => {
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
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const clonedCell = structuredClone(getCell(editor));

        expect(
          editor.plugin(BaseTablePlugin).api.getColumnIndex(clonedCell)
        ).toBe(-1);
        expect(
          editor.plugin(BaseTablePlugin).api.getColumnIndex({
            children: [{ text: 'ghost' }],
            type: 'td',
          })
        ).toBe(-1);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('getTableEntries', () => {
      it('returns the cell, row, and table entries for the current table selection', () => {
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
        const entries = editor.plugin(BaseTablePlugin).api.getEntries()!;

        expect(entries.cell[0].type).toBe('td');
        expect(entries.cell[1]).toEqual([0, 1, 0]);
        expect(entries.row[0].type).toBe('tr');
        expect(entries.row[1]).toEqual([0, 1]);
        expect(entries.table[0].type).toBe('table');
        expect(entries.table[1]).toEqual([0]);
      });

      it('supports an explicit location even when the current selection is outside the table', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
            </htable>
            <hp>
              after
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const entries = editor.plugin(BaseTablePlugin).api.getEntries({
          at: { offset: 0, path: [0, 0, 0, 0, 0] },
        })!;

        expect(entries.cell[1]).toEqual([0, 0, 0]);
        expect(entries.row[1]).toEqual([0, 0]);
        expect(entries.table[1]).toEqual([0]);
      });

      it('returns undefined when the location is not inside a table cell', () => {
        const input = (
          <editor>
            <hp>
              text
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(editor.plugin(BaseTablePlugin).api.getEntries()).toBeUndefined();
        expect(
          editor.plugin(BaseTablePlugin).api.getEntries({ at: null })
        ).toBeUndefined();
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    describe('getTableRowIndex', () => {
      it('returns the row index for a table cell in the editor tree', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const entry = editor.read.nodes.get<TTableCellElement>([0, 1, 0]);
        assert(entry);
        const [cellNode] = entry;

        expect(editor.plugin(BaseTablePlugin).api.getRowIndex(cellNode)).toBe(
          1
        );
      });

      it('falls back to zero for detached cells', () => {
        const editor = createTableEditor(
          (
            <editor>
              <hp>outside table</hp>
            </editor>
          ) as TestEditor
        );

        expect(
          editor.plugin(BaseTablePlugin).api.getRowIndex({
            children: [{ text: 'ghost' }],
            type: 'td',
          })
        ).toBe(0);
      });
    });
  }
  {
    const editor = createPlateEditor({
      plugins: getTestTablePlugins(),
    });

    describe('getTableColumnCount', () => {
      it('returns 0 if tableNode has no children', () => {
        const tableNode: TTableElement = {
          children: [],
          type: 'table',
        };

        const result = editor
          .plugin(BaseTablePlugin)
          .api.getColumnCount(tableNode);
        expect(result).toBe(0);
      });

      it('returns the sum of colSpan values of the first row elements', () => {
        const tableNode: TTableElement = {
          children: [
            {
              children: [2, 3, 1].map(
                (colSpan): TTableCellElement => ({
                  children: [{ text: '' }],
                  colSpan,
                  type: 'td',
                })
              ),
              type: 'tr',
            } satisfies TTableRowElement,
          ],
          type: 'table',
        };

        const result = editor
          .plugin(BaseTablePlugin)
          .api.getColumnCount(tableNode);
        expect(result).toBe(6);
      });

      it('returns the sum of canonical colSpan values in the first row', () => {
        const tableNode: TTableElement = {
          children: [
            {
              children: [
                {
                  children: [{ text: '' }],
                  colSpan: 2,
                  type: 'td',
                },
                {
                  children: [{ text: '' }],
                  colSpan: 3,
                  type: 'td',
                },
                { children: [{ text: '' }], type: 'td' },
              ],
              type: 'tr',
            } satisfies TTableRowElement,
          ],
          type: 'table',
        };

        const result = editor
          .plugin(BaseTablePlugin)
          .api.getColumnCount(tableNode);
        expect(result).toBe(6);
      });

      it('handle elements without colSpan or colspan attribute', () => {
        const tableNode: TTableElement = {
          children: [
            {
              children: Array.from(
                { length: 3 },
                (): TTableCellElement => ({
                  children: [{ text: '' }],
                  type: 'td',
                })
              ),
              type: 'tr',
            } satisfies TTableRowElement,
          ],
          type: 'table',
        };

        const result = editor
          .plugin(BaseTablePlugin)
          .api.getColumnCount(tableNode);
        expect(result).toBe(3);
      });
    });
  }
});
