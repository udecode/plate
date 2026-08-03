/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { definePlatePlugin } from '@platejs/core/react';
import { schema, type Value } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';
import type {
  TableCellElement,
  TableElement,
  TableRowElement,
} from './BaseTablePlugin';
import assert from 'node:assert/strict';

describe('table grid queries', () => {
  const value: Value = [
    {
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: '11' }], type: 'paragraph' }],
              id: 'c11',
              type: 'tableCell',
            },
            {
              children: [{ children: [{ text: '12' }], type: 'paragraph' }],
              id: 'c12',
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    },
  ];

  describe('getCellIndices', () => {
    it('derives cells from the immutable initial value', () => {
      const initialValue = structuredClone(value);
      const inputSnapshot = structuredClone(initialValue);
      const editor = createTestTableEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue,
      });

      expect(
        editor.plugin(BaseTablePlugin).read.getCellIndicesById('c11')
      ).toEqual({ col: 0, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).read.getCellIndicesById('c12')
      ).toEqual({ col: 1, row: 0 });
      expect(initialValue).toEqual(inputSnapshot);
    });

    it('indexes tables in element-owned content roots', () => {
      const RootHolderPlugin = definePlatePlugin('tableRootHolder', {
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
            blockContent: true,
            void: 'block',
          },
        },
      });
      const editor = createTestTableEditor({
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
        editor.plugin(BaseTablePlugin).read.getCellIndicesById('c11')
      ).toEqual({ col: 0, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).read.getCellIndicesById('c12')
      ).toEqual({ col: 1, row: 0 });
    });

    it('derives stable indices through the canonical compiler', () => {
      const editor = createTestTableEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: value,
      });
      const entry = editor.read.nodes.get<TableCellElement>([0, 0, 1]);
      assert(entry);
      const [cell] = entry;

      expect(editor.plugin(BaseTablePlugin).read.getCellIndices(cell)).toEqual({
        col: 1,
        row: 0,
      });
      expect(
        editor.plugin(BaseTablePlugin).read.getCellIndicesById('c12')
      ).toEqual({ col: 1, row: 0 });
      expect(editor.plugin(BaseTablePlugin).read.getCellIndices(cell)).toEqual({
        col: 1,
        row: 0,
      });
    });

    it('falls back when the cell does not belong to a table', () => {
      const orphanValue: Value = [
        { children: [{ text: '' }], type: 'paragraph' },
      ];
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: orphanValue,
      });
      const cell: TableCellElement = {
        children: [{ text: '' }],
        id: 'orphan',
        type: 'tableCell',
      };

      expect(editor.plugin(BaseTablePlugin).read.getCellIndices(cell)).toEqual({
        col: 0,
        row: 0,
      });
    });
  });

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    const getCell = (editor: ReturnType<typeof createTableEditor>) => {
      const entry = editor.read.nodes.get<TableCellElement>([0, 0, 1]);
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
          editor.plugin(BaseTablePlugin).read.getColumnIndex(cellNode)
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
          editor.plugin(BaseTablePlugin).read.getColumnIndex(clonedCell)
        ).toBe(-1);
        expect(
          editor.plugin(BaseTablePlugin).read.getColumnIndex({
            children: [{ text: 'ghost' }],
            type: 'tableCell',
          })
        ).toBe(-1);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
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
        const entries = editor.plugin(BaseTablePlugin).read.getEntries()!;

        expect(entries.cell[0].type).toBe('tableCell');
        expect(entries.cell[1]).toEqual([0, 1, 0]);
        expect(entries.row[0].type).toBe('tableRow');
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
        const entries = editor.plugin(BaseTablePlugin).read.getEntries({
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

        expect(
          editor.plugin(BaseTablePlugin).read.getEntries()
        ).toBeUndefined();
        expect(
          editor.plugin(BaseTablePlugin).read.getEntries({ at: null })
        ).toBeUndefined();
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
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
        const entry = editor.read.nodes.get<TableCellElement>([0, 1, 0]);
        assert(entry);
        const [cellNode] = entry;

        expect(editor.plugin(BaseTablePlugin).read.getRowIndex(cellNode)).toBe(
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
          editor.plugin(BaseTablePlugin).read.getRowIndex({
            children: [{ text: 'ghost' }],
            type: 'tableCell',
          })
        ).toBe(0);
      });
    });
  }
  {
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins(),
    });

    describe('getTableColumnCount', () => {
      it('returns 0 if tableNode has no children', () => {
        const tableNode: TableElement = {
          children: [],
          type: 'table',
        };

        const result = editor
          .plugin(BaseTablePlugin)
          .api.getColumnCount(tableNode);
        expect(result).toBe(0);
      });

      it('returns the sum of colSpan values of the first row elements', () => {
        const tableNode: TableElement = {
          children: [
            {
              children: [2, 3, 1].map(
                (colSpan): TableCellElement => ({
                  children: [{ text: '' }],
                  colSpan,
                  type: 'tableCell',
                })
              ),
              type: 'tableRow',
            } satisfies TableRowElement,
          ],
          type: 'table',
        };

        const result = editor
          .plugin(BaseTablePlugin)
          .api.getColumnCount(tableNode);
        expect(result).toBe(6);
      });

      it('returns the sum of canonical colSpan values in the first row', () => {
        const tableNode: TableElement = {
          children: [
            {
              children: [
                {
                  children: [{ text: '' }],
                  colSpan: 2,
                  type: 'tableCell',
                },
                {
                  children: [{ text: '' }],
                  colSpan: 3,
                  type: 'tableCell',
                },
                { children: [{ text: '' }], type: 'tableCell' },
              ],
              type: 'tableRow',
            } satisfies TableRowElement,
          ],
          type: 'table',
        };

        const result = editor
          .plugin(BaseTablePlugin)
          .api.getColumnCount(tableNode);
        expect(result).toBe(6);
      });

      it('handle elements without colSpan or colspan attribute', () => {
        const tableNode: TableElement = {
          children: [
            {
              children: Array.from(
                { length: 3 },
                (): TableCellElement => ({
                  children: [{ text: '' }],
                  type: 'tableCell',
                })
              ),
              type: 'tableRow',
            } satisfies TableRowElement,
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
