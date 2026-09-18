/** @jsxRuntime classic */
/** @jsx jsxt */

import assert from 'node:assert/strict';

import type { TestEditor } from '#platejs-test-internal';
import { jsxt } from '#platejs-test-internal';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import type { TableCellElement, TableElement } from './BaseTablePlugin';
import { BaseTableCellPlugin, BaseTablePlugin } from './BaseTablePlugin';

describe('table presentation', () => {
  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    const getCell = (
      editor: ReturnType<typeof createTableEditor>,
      path: number[]
    ) => {
      const entry = editor.read.nodes.get(path, {
        type: BaseTableCellPlugin,
      });
      assert.ok(entry);

      return entry[0];
    };

    describe('getTableCellBorders', () => {
      it('returns null for a detached cell', () => {
        const input = (
          <editor>
            <hp>document</hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const element = {
          children: [{ children: [{ text: 'detached' }], type: 'paragraph' }],
          type: 'tableCell',
        } as TableCellElement;

        expect(
          editor.plugin(BaseTablePlugin).read.cell({ at: element })
        ).toBeNull();
      });

      it('returns top and left borders only for the first row and first column', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd
                  borders={{
                    bottom: { color: 'red', width: 4 },
                    top: { style: 'dashed' },
                  }}
                >
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
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const element = getCell(editor, [0, 0, 0]);

        expect(
          editor.plugin(BaseTablePlugin).read.cell({ at: element })?.borders
        ).toEqual({
          bottom: { color: 'red', width: 4, style: 'solid' },
          left: { color: 'currentColor', width: 1, style: 'solid' },
          right: { color: 'currentColor', width: 1, style: 'solid' },
          top: { color: 'currentColor', width: 1, style: 'dashed' },
        });
      });

      it('omits top and left borders for non-edge cells', () => {
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
                <htd borders={{ right: { width: 3 } }}>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const element = getCell(editor, [0, 1, 1]);

        expect(
          editor.plugin(BaseTablePlugin).read.cell({ at: element })?.borders
        ).toEqual({
          bottom: { color: 'currentColor', width: 1, style: 'solid' },
          right: { color: 'currentColor', width: 3, style: 'solid' },
        });
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

    const getCell = (
      editor: ReturnType<typeof createTableEditor>,
      path: number[]
    ) => {
      const entry = editor.read.nodes.get(path, {
        type: BaseTableCellPlugin,
      });
      assert.ok(entry);

      return entry[0];
    };

    describe('getTableCellSize', () => {
      it('returns null for a detached cell', () => {
        const input = (
          <editor>
            <hp>document</hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const element = {
          children: [{ children: [{ text: 'detached' }], type: 'paragraph' }],
          type: 'tableCell',
        } as TableCellElement;

        expect(
          editor.plugin(BaseTablePlugin).read.cell({ at: element })
        ).toBeNull();
      });

      it('sums the table column widths across the current cell colSpan', () => {
        const input = (
          <editor>
            <htable columnWidths={[40, 50, 60]}>
              <htr height={72}>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd colSpan={2}>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const element = getCell(editor, [0, 0, 1]);

        expect(
          editor.plugin(BaseTablePlugin).read.cell({ at: element })?.size
        ).toEqual({
          minHeight: 72,
          width: 110,
        });
      });
    });
  }

  {
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins(),
    });
    const makeTableElement = (
      columnCount: number,
      columnWidths?: Array<number | null>
    ): TableElement =>
      ({
        children: [
          {
            children: Array.from({ length: columnCount }, () => ({})),
            type: 'tableRow',
          },
        ],
        columnWidths,
      }) as unknown as TableElement;

    describe('getTableOverriddenColSizes', () => {
      describe('when columnWidths is not defined', () => {
        it('returns the minimum width fallback', () => {
          const tableElement = makeTableElement(3);

          expect(
            editor.plugin(BaseTablePlugin).api.columnWidths(tableElement)
          ).toMatchObject([48, 48, 48]);
        });
      });

      describe('when columnWidths is defined', () => {
        it('returns columnWidths', () => {
          const tableElement = makeTableElement(3, [100, 200, 300]);

          expect(
            editor.plugin(BaseTablePlugin).api.columnWidths(tableElement)
          ).toMatchObject([100, 200, 300]);
        });

        it('uses the minimum width fallback for unknown columns', () => {
          const tableElement = makeTableElement(3, [100, null, 300]);

          expect(
            editor.plugin(BaseTablePlugin).api.columnWidths(tableElement)
          ).toEqual([100, 48, 300]);
        });

        it('normalizes stored widths to the logical column count', () => {
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.columnWidths(makeTableElement(2, [80]))
          ).toEqual([80, 48]);
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.columnWidths(makeTableElement(2, [80, 120, 160]))
          ).toEqual([80, 120]);
        });

        it('clamps derived widths to the configured minimum', () => {
          const configuredEditor = createTestTableEditor({
            plugins: getTestTablePlugins({
              defaultTableWidth: 200,
              minColumnWidth: 100,
            }),
          });

          expect(
            configuredEditor
              .plugin(BaseTablePlugin)
              .api.columnWidths(makeTableElement(3))
          ).toEqual([100, 100, 100]);
        });
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

    describe('setTableColSize', () => {
      it('creates a columnWidths array when the table does not have one yet', () => {
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
                <htd>
                  <hp>12</hp>
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

        const editor = createTableEditor(input);

        editor
          .plugin(BaseTablePlugin)
          .update.setColumnWidth({ colIndex: 1, width: 120 });

        expect(editor.read.children()).toMatchObject([
          {
            columnWidths: [null, 120],
            type: 'table',
          },
        ]);
      });

      it('updates only the requested column width when columnWidths already exist', () => {
        const input = (
          <editor>
            <htable columnWidths={[20, 30]}>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor
          .plugin(BaseTablePlugin)
          .update.setColumnWidth({ colIndex: 0, width: 64 });

        expect(editor.read.children()).toMatchObject([
          {
            columnWidths: [64, 30],
            type: 'table',
          },
        ]);
      });

      it('pads a short columnWidths array with null before updating', () => {
        const input = (
          <editor>
            <htable columnWidths={[100]}>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
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

        editor
          .plugin(BaseTablePlugin)
          .update.setColumnWidth({ colIndex: 2, width: 120 });

        expect(editor.read.children()).toMatchObject([
          {
            columnWidths: [100, null, 120],
            type: 'table',
          },
        ]);
      });

      it('rejects invalid column indexes and widths before mutation', () => {
        const input = (
          <editor>
            <htable columnWidths={[100]}>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);
        const before = editor.read.children();

        expect(() =>
          editor
            .plugin(BaseTablePlugin)
            .update.setColumnWidth({ colIndex: -1, width: 100 })
        ).toThrow(/column index.*non-negative safe integer/i);
        expect(() =>
          editor
            .plugin(BaseTablePlugin)
            .update.setColumnWidth({ colIndex: 0, width: 0 })
        ).toThrow(/column width.*positive finite number/i);
        expect(() =>
          editor
            .plugin(BaseTablePlugin)
            .update.setColumnWidth({ colIndex: 1, width: 100 })
        ).toThrow(/column index.*exceeds/i);
        expect(editor.read.children()).toBe(before);
      });
    });

    describe('setRowHeight', () => {
      it('sets the height on the requested table row', () => {
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
                <htd>
                  <hp>12</hp>
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

        const editor = createTableEditor(input);

        editor
          .plugin(BaseTablePlugin)
          .update.setRowHeight({ height: 48, rowIndex: 0 });

        expect(editor.read.children()).toMatchObject([
          {
            children: [{ height: 48 }, {}],
            type: 'table',
          },
        ]);
      });

      it('rejects invalid row indexes and heights before mutation', () => {
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
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);
        const before = editor.read.children();

        expect(() =>
          editor
            .plugin(BaseTablePlugin)
            .update.setRowHeight({ height: 100, rowIndex: -1 })
        ).toThrow(/row index.*non-negative safe integer/i);
        expect(() =>
          editor
            .plugin(BaseTablePlugin)
            .update.setRowHeight({ height: Number.NaN, rowIndex: 0 })
        ).toThrow(/row height.*positive finite number/i);
        expect(() =>
          editor
            .plugin(BaseTablePlugin)
            .update.setRowHeight({ height: 100, rowIndex: 1 })
        ).toThrow(/row index.*exceeds/i);
        expect(editor.read.children()).toBe(before);
      });
    });
  }
});
