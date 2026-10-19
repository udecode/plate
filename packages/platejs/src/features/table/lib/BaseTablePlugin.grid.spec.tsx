/** @jsxRuntime classic */
/** @jsx jsxt */

import assert from 'node:assert/strict';

import type { TestEditor } from '#platejs-test-internal';
import { jsxt } from '#platejs-test-internal';

import { createEditorView, schema, type Value } from '../../../core';
import { definePlugin } from '../../../react/core';
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
import { readTableGridCompilerMetrics } from './internal/grid';

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

  describe('cell coordinates', () => {
    it('reads every cell coordinate without recompiling the table for each cell', () => {
      const dimension = 10;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: [
          {
            type: 'table',
            children: Array.from({ length: dimension }, () => ({
              type: 'tableRow',
              children: Array.from({ length: dimension }, () => ({
                type: 'tableCell',
                children: [{ type: 'paragraph', children: [{ text: '' }] }],
              })),
            })),
          },
        ],
      });
      const plugin = editor.plugin(BaseTablePlugin);
      plugin.update.setColumnWidth({ colIndex: 0, width: 104, at: [0] });
      const before = readTableGridCompilerMetrics();
      for (let row = 0; row < dimension; row++) {
        for (let col = 0; col < dimension; col++) {
          const entry = editor.read.nodes.get([0, row, col], {
            type: BaseTableCellPlugin,
          });
          assert.ok(entry);
          const key = editor.key(entry[0]);
          expect(plugin.read.cell({ at: entry[0] })).toMatchObject({
            row,
            col,
          });
          expect(plugin.read.cell({ at: key })).toMatchObject({ row, col });
        }
      }
      expect(
        readTableGridCompilerMetrics().compileCount - before.compileCount
      ).toBeLessThanOrEqual(1);
    });

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
        editor.plugin(BaseTablePlugin).read.cell({ at: c11 })
      ).toMatchObject({ col: 0, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).read.cell({ at: c12 })
      ).toMatchObject({ col: 1, row: 0 });
      expect(initialValue).toEqual(inputSnapshot);
    });

    it('indexes tables in element-owned content roots', () => {
      const RootHolderPlugin = definePlugin('tableRootHolder', {
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

      expect(
        rootEditor.plugin(BaseTablePlugin).read.cell({ at: c11 })
      ).toMatchObject({ col: 0, row: 0 });
      expect(
        rootEditor.plugin(BaseTablePlugin).read.cell({ at: c12 })
      ).toMatchObject({ col: 1, row: 0 });
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

      expect(
        editor.plugin(BaseTablePlugin).read.cell({ at: cell })
      ).toMatchObject({
        col: 1,
        row: 0,
      });
      expect(
        editor.plugin(BaseTablePlugin).read.cell({ at: id })
      ).toMatchObject({ col: 1, row: 0 });
      expect(
        editor.plugin(BaseTablePlugin).read.cell({ at: cell })
      ).toMatchObject({
        col: 1,
        row: 0,
      });
    });

    it('returns null for a detached cell', () => {
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

      expect(editor.plugin(BaseTablePlugin).read.cell({ at: cell })).toBeNull();
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
          editor.plugin(BaseTablePlugin).read.cell({ at: cellNode })?.col
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
          editor.plugin(BaseTablePlugin).read.cell({ at: clonedCell })
        ).toBeNull();
        expect(
          editor.plugin(BaseTablePlugin).read.cell({
            at: {
              children: [{ text: 'ghost' }],
              type: 'tableCell',
            },
          })
        ).toBeNull();
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
          editor.plugin(BaseTablePlugin).read.cell({ at: cellNode })?.row
        ).toBe(1);
      });

      it('returns null for detached cells', () => {
        const editor = createTableEditor(
          (
            <editor>
              <hp>outside table</hp>
            </editor>
          ) as TestEditor
        );

        expect(
          editor.plugin(BaseTablePlugin).read.cell({
            at: {
              children: [{ text: 'ghost' }],
              type: 'tableCell',
            },
          })
        ).toBeNull();
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
          .api.columnWidths(tableNode).length;
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
          .api.columnWidths(tableNode).length;
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
          .api.columnWidths(tableNode).length;
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
          .api.columnWidths(tableNode).length;
        expect(result).toBe(3);
      });
    });
  }
});
