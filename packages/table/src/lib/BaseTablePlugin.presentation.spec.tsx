/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';
import type { TableCellElement, TableElement } from './BaseTablePlugin';
import assert from 'node:assert/strict';

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
      const entry = editor.read.nodes.get<TableCellElement>(path);
      assert(entry);

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
            defaultBorder: { color: 'gray', size: 2, style: 'solid' },
            element,
          })
        ).toEqual({
          bottom: { color: 'gray', size: 2, style: 'solid' },
          right: { color: 'gray', size: 2, style: 'solid' },
        });
      });

      it('returns top and left borders only for the first row and first column', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd
                  borders={{
                    bottom: { color: 'red', size: 4 },
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
            defaultBorder: { color: 'gray', size: 1, style: 'solid' },
            element,
          })
        ).toEqual({
          bottom: { color: 'red', size: 4, style: 'solid' },
          left: { color: 'gray', size: 1, style: 'solid' },
          right: { color: 'gray', size: 1, style: 'solid' },
          top: { color: 'gray', size: 1, style: 'dashed' },
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
                <htd borders={{ right: { size: 3 } }}>
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
            defaultBorder: { size: 1 },
            element,
          })
        ).toEqual({
          bottom: { color: undefined, size: 1, style: undefined },
          left: undefined,
          right: { color: undefined, size: 3, style: undefined },
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
      const entry = editor.read.nodes.get<TableCellElement>(path);
      assert(entry);

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
            <htable colSizes={[40, 50, 60]}>
              <htr size={72}>
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
            <htable colSizes={[40, 50, 60]}>
              <htr size={72}>
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
            colSizes: [10, 20, 30],
            element,
            rowSize: 99,
          })
        ).toEqual({
          minHeight: 99,
          width: 50,
        });
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
              <htd borders={{ left: { size: 1 }, right: { size: 0 } }}>
                <hp>11</hp>
              </htd>
              <htd
                borders={{
                  bottom: { size: 0 },
                  left: { size: 0 },
                  right: { size: 1 },
                }}
              >
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ top: { size: 0 } }}>
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
      colSizes?: number[]
    ): TableElement =>
      ({
        children: [
          {
            children: Array.from({ length: columnCount }).fill({}),
            type: 'tableRow',
          },
        ],
        colSizes,
      }) as unknown as TableElement;

    describe('getTableOverriddenColSizes', () => {
      describe('when colSizes is not defined', () => {
        it('returns all zeros', () => {
          const tableElement = makeTableElement(3);
          const overrides = new Map<number, number>();
          expect(
            editor
              .plugin(BaseTablePlugin)
              .api.getOverriddenColumnSizes(tableElement, overrides)
          ).toMatchObject([0, 0, 0]);
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
          ).toMatchObject([100, 0, 200]);
        });
      });

      describe('when colSizes is defined', () => {
        it('returns colSizes', () => {
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
      it('creates a colSizes array when the table does not have one yet', () => {
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
          .update.setColumnSize({ colIndex: 1, width: 120 });

        expect(editor.read.children()).toMatchObject([
          {
            colSizes: [0, 120],
            type: 'table',
          },
        ]);
      });

      it('updates only the requested column width when colSizes already exist', () => {
        const input = (
          <editor>
            <htable colSizes={[20, 30]}>
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
          .update.setColumnSize({ colIndex: 0, width: 64 });

        expect(editor.read.children()).toMatchObject([
          {
            colSizes: [64, 30],
            type: 'table',
          },
        ]);
      });
    });

    describe('setTableRowSize', () => {
      it('sets the size on the requested table row', () => {
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
          .update.setRowSize({ height: 48, rowIndex: 0 });

        expect(editor.read.children()).toMatchObject([
          {
            children: [{ size: 48 }, {}],
            type: 'table',
          },
        ]);
      });
    });
  }
});
