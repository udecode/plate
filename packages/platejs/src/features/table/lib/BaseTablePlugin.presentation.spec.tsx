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
      it('falls back to bottom and right defaults for a detached cell', () => {
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
          editor.plugin(BaseTablePlugin).read.getCellBorders({
            defaultBorder: { color: 'gray', width: 2, style: 'solid' },
            element,
          })
        ).toEqual({
          bottom: { color: 'gray', width: 2, style: 'solid' },
          right: { color: 'gray', width: 2, style: 'solid' },
        });
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
          editor.plugin(BaseTablePlugin).read.getCellBorders({
            defaultBorder: { color: 'gray', width: 1, style: 'solid' },
            element,
          })
        ).toEqual({
          bottom: { color: 'red', width: 4, style: 'solid' },
          left: { color: 'gray', width: 1, style: 'solid' },
          right: { color: 'gray', width: 1, style: 'solid' },
          top: { color: 'gray', width: 1, style: 'dashed' },
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
          editor.plugin(BaseTablePlugin).read.getCellBorders({
            defaultBorder: { width: 1 },
            element,
          })
        ).toEqual({
          bottom: { color: undefined, width: 1, style: undefined },
          left: undefined,
          right: { color: undefined, width: 3, style: undefined },
          top: undefined,
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
      it('falls back to zero width and height for a detached cell', () => {
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
          editor.plugin(BaseTablePlugin).read.getCellSize({ element })
        ).toEqual({
          minHeight: 0,
          width: 0,
        });
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
          editor.plugin(BaseTablePlugin).read.getCellSize({ element })
        ).toEqual({
          minHeight: 72,
          width: 110,
        });
      });

      it('uses explicit row and column sizes when provided', () => {
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
          editor.plugin(BaseTablePlugin).read.getCellSize({
            columnWidths: [10, 20, 30],
            element,
            rowSize: 99,
          })
        ).toEqual({
          minHeight: 99,
          width: 50,
        });
      });

      it('resolves explicit unknown widths through the minimum fallback', () => {
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
          editor.plugin(BaseTablePlugin).read.getCellSize({
            columnWidths: [10, null, 30],
            element,
          })
        ).toEqual({ minHeight: 72, width: 78 });
      });
    });
  }

  {
    jsxt;

    const createEditorInstance = ({
      children,
      selection,
    }: {
      children?: any;
      selection?: any;
    }) =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection,
        initialValue: children,
      });

    describe('isTableBorderHidden', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd borders={{ left: { width: 1 }, right: { width: 0 } }}>
                <hp>11</hp>
              </htd>
              <htd
                borders={{
                  bottom: { width: 0 },
                  left: { width: 0 },
                  right: { width: 1 },
                }}
              >
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ top: { width: 0 } }}>
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

      it('returns true if left border is hidden', () => {
        const editor = createEditorInstance(input);
        const hidden = editor
          .plugin(BaseTablePlugin)
          .read.isBorderHidden('left');
        expect(hidden).toBe(false);
      });

      it('returns true if top border is hidden', () => {
        const editor = createEditorInstance(input);
        const hidden = editor
          .plugin(BaseTablePlugin)
          .read.isBorderHidden('top');
        expect(hidden).toBe(true);
      });

      it('returns false if left border is not hidden', () => {
        const editor = createEditorInstance(input);
        editor.update.selection.set({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0, 0, 0] },
        });
        const hidden = editor
          .plugin(BaseTablePlugin)
          .read.isBorderHidden('left');
        expect(hidden).toBe(false);
      });

      it('returns false if top border is not hidden', () => {
        const editor = createEditorInstance(input);
        editor.update.selection.set({
          kind: 'text',
          anchor: { offset: 0, path: [0, 1, 0, 0, 0] },
          focus: { offset: 0, path: [0, 1, 0, 0, 0] },
        });
        const hidden = editor
          .plugin(BaseTablePlugin)
          .read.isBorderHidden('top');
        expect(hidden).toBe(false);
      });

      it('returns false if no matching cell is found', () => {
        const editor = createEditorInstance(
          (
            <editor>
              <hp>outside table</hp>
            </editor>
          ) as TestEditor
        );
        const hidden = editor
          .plugin(BaseTablePlugin)
          .read.isBorderHidden('left');
        expect(hidden).toBe(false);
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
          const overrides = new Map<number, number>();
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(tableElement, overrides)
          ).toMatchObject([48, 48, 48]);
        });

        it('apply overrides', () => {
          const tableElement = makeTableElement(3);
          const overrides = new Map<number, number>([
            [0, 100],
            [2, 200],
          ]);
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(tableElement, overrides)
          ).toMatchObject([100, 48, 200]);
        });
      });

      describe('when columnWidths is defined', () => {
        it('returns columnWidths', () => {
          const tableElement = makeTableElement(3, [100, 200, 300]);
          const overrides = new Map<number, number>();
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(tableElement, overrides)
          ).toMatchObject([100, 200, 300]);
        });

        it('apply overrides', () => {
          const tableElement = makeTableElement(3, [100, 200, 300]);
          const overrides = new Map<number, number>([
            [0, 1000],
            [2, 2000],
          ]);
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(tableElement, overrides)
          ).toMatchObject([1000, 200, 2000]);
        });

        it('uses the minimum width fallback for unknown columns', () => {
          const tableElement = makeTableElement(3, [100, null, 300]);

          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(tableElement)
          ).toEqual([100, 48, 300]);
        });

        it('normalizes stored widths to the logical column count', () => {
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(makeTableElement(2, [80]))
          ).toEqual([80, 48]);
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(makeTableElement(2, [80, 120, 160]))
          ).toEqual([80, 120]);
        });

        it('clamps derived widths to the configured minimum', () => {
          const configuredEditor = createTestTableEditor({
            plugins: getTestTablePlugins({
              initialTableWidth: 200,
              minColumnWidth: 100,
            }),
          });

          expect(
            configuredEditor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(makeTableElement(3))
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
        ).toThrow(/column index 1 exceeds the last column index 0/i);
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
        ).toThrow(/row index 1 exceeds the last row index 0/i);
        expect(editor.read.children()).toBe(before);
      });
    });
  }
});
