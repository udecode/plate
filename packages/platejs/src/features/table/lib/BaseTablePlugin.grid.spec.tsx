/** @jsx jsxt */

import assert from 'node:assert/strict';

import type { TestEditor } from '#platejs-test-internal';
import { jsxt } from '#platejs-test-internal';

import { createEditorView, schema, type Value } from '../../../core';
import { definePlatePlugin } from '../../../react/core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import type { TableCellElementWithId } from './__tests__/tableTestTypes';
import type {
  TableCellElement,
  TableElement,
  TableRowElement,
} from './BaseTablePlugin';
import { BaseTableCellPlugin, BaseTablePlugin } from './BaseTablePlugin';
import { createTableContext } from './internal/context';

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
        plugins: getTestTablePlugins(),
        initialValue,
      });
      const c11 = editor.key([0, 0, 0])!;
      const c12 = editor.key([0, 0, 1])!;

      expect(
        editor.plugin(BaseTablePlugin).read.getCellIndicesByKey(c11)
      ).toEqual({ col: 0, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).read.getCellIndicesByKey(c12)
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
      const rootEditor = createEditorView(editor, {
        root: 'table-root:1',
      }) as unknown as typeof editor;
      const c11 = rootEditor.key([0, 0, 0])!;
      const c12 = rootEditor.key([0, 0, 1])!;
      const context = rootEditor.read((state) =>
        createTableContext(state, [0])
      );

      assert.ok(context);

      expect(context.grid.byKey.get(c11)).toMatchObject({ col: 0, row: 0 });
      expect(context.grid.byKey.get(c12)).toMatchObject({ col: 1, row: 0 });
    });

    it('derives stable indices through the canonical compiler', () => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: value,
      });
      const entry = editor.read.nodes.get([0, 0, 1], {
        type: BaseTableCellPlugin,
      });
      assert.ok(entry);
      const [cell] = entry;
      const id = editor.key(cell);

      expect(editor.plugin(BaseTablePlugin).read.getCellIndices(cell)).toEqual({
        col: 1,
        row: 0,
      });
      expect(
        editor.plugin(BaseTablePlugin).read.getCellIndicesByKey(id)
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
      const cell: TableCellElementWithId = {
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
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    const getCell = (editor: ReturnType<typeof createTableEditor>) => {
      const entry = editor.read.nodes.get([0, 0, 1], {
        type: BaseTableCellPlugin,
      });
      assert.ok(entry);

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
          editor.plugin(BaseTablePlugin).read.getCellIndices(cellNode).col
        ).toBe(1);
      });

      it('does not confuse cloned persisted IDs with live cell identity', () => {
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
          editor.plugin(BaseTablePlugin).read.getCellIndices(clonedCell).col
        ).toBe(0);
        expect(
          editor.plugin(BaseTablePlugin).read.getCellIndices({
            children: [{ text: 'ghost' }],
            type: 'tableCell',
          }).col
        ).toBe(0);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
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
        const entry = editor.read.nodes.get([0, 1, 0], {
          type: BaseTableCellPlugin,
        });
        assert.ok(entry);
        const [cellNode] = entry;

        expect(
          editor.plugin(BaseTablePlugin).read.getCellIndices(cellNode).row
        ).toBe(1);
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
          editor.plugin(BaseTablePlugin).read.getCellIndices({
            children: [{ text: 'ghost' }],
            type: 'tableCell',
          }).row
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
              children: [2, 3, 1].map((colSpan): TableCellElement => ({
                children: [{ text: '' }],
                colSpan,
                type: 'tableCell',
              })),
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
              children: Array.from({ length: 3 }, (): TableCellElement => ({
                children: [{ text: '' }],
                type: 'tableCell',
              })),
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
