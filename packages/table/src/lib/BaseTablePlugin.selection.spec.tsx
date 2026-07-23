/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { createPlateEditor } from '@platejs/core/react';
import { jsx, jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';
import type { TTableCellElement, TTableElement } from '@platejs/utils';
import assert from 'node:assert/strict';

describe('table selection', () => {
  {
    jsx;

    const value = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c12">
              <hp>12</hp>
            </htd>
            <htd id="c13">
              <hp>13</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
              <hp>22</hp>
            </htd>
            <htd id="c23">
              <hp>23</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c31">
              <hp>31</hp>
            </htd>
            <htd id="c32">
              <hp>32</hp>
            </htd>
            <htd id="c33">
              <hp>33</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const createEditor = () =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: value.children,
      });

    const getCell = (
      editor: ReturnType<typeof createEditor>,
      path: number[]
    ) => {
      const entry = editor.read.nodes.get<TTableCellElement>(path);
      assert(entry);

      return entry[0];
    };

    describe('getSelectedCellsBoundingBox', () => {
      it('returns the bounds of one cell', () => {
        const editor = createEditor();

        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectedCellsBoundingBox([getCell(editor, [0, 1, 1])])
        ).toEqual({ maxCol: 1, maxRow: 1, minCol: 1, minRow: 1 });
      });

      it('returns the bounds of horizontal, vertical, and L-shaped selections', () => {
        const editor = createEditor();

        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectedCellsBoundingBox([
              getCell(editor, [0, 1, 0]),
              getCell(editor, [0, 1, 1]),
              getCell(editor, [0, 1, 2]),
            ])
        ).toEqual({ maxCol: 2, maxRow: 1, minCol: 0, minRow: 1 });
        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectedCellsBoundingBox([
              getCell(editor, [0, 0, 1]),
              getCell(editor, [0, 1, 1]),
              getCell(editor, [0, 2, 1]),
            ])
        ).toEqual({ maxCol: 1, maxRow: 2, minCol: 1, minRow: 0 });
        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectedCellsBoundingBox([
              getCell(editor, [0, 0, 0]),
              getCell(editor, [0, 1, 0]),
              getCell(editor, [0, 1, 1]),
            ])
        ).toEqual({ maxCol: 1, maxRow: 1, minCol: 0, minRow: 0 });
      });

      it('includes diagonal corners and cell spans', () => {
        const editor = createEditor();

        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectedCellsBoundingBox([
              getCell(editor, [0, 0, 0]),
              getCell(editor, [0, 2, 2]),
            ])
        ).toEqual({ maxCol: 2, maxRow: 2, minCol: 0, minRow: 0 });

        const spanningCell = {
          ...getCell(editor, [0, 1, 1]),
          colSpan: 2,
          rowSpan: 2,
        };

        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectedCellsBoundingBox([spanningCell])
        ).toEqual({
          maxCol: 2,
          maxRow: 2,
          minCol: 1,
          minRow: 1,
        });
      });
    });
  }
  {
    const editor = createPlateEditor({
      plugins: getTestTablePlugins(),
    });
    const cell = (
      props: Partial<TTableCellElement>,
      path: number[]
    ): [TTableCellElement, number[]] => [
      {
        children: [{ text: '' }],
        type: 'td',
        ...props,
      },
      path,
    ];

    describe('getSelectionWidth', () => {
      it('sums colSpan values across cells on the same row', () => {
        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectionWidth([
              cell({ attributes: { colspan: '2' } }, [0, 0, 0]),
              cell({ colSpan: 3 }, [0, 0, 1]),
            ])
        ).toBe(5);
      });

      it('keeps counting when a wider row starts after a row change', () => {
        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectionWidth([
              cell({ colSpan: 1 }, [0, 0, 0]),
              cell({ colSpan: 2 }, [0, 1, 0]),
              cell({ colSpan: 1 }, [0, 1, 1]),
            ])
        ).toBe(3);
      });
    });
    describe('isTableRectangular', () => {
      it('treats matching effective widths as rectangular', () => {
        expect(
          editor.plugin(BaseTablePlugin).api.isRectangular({
            children: [
              {
                children: [
                  { children: [{ text: '11' }], colSpan: 2, type: 'td' },
                  { children: [{ text: '13' }], type: 'td' },
                ],
                type: 'tr',
              },
              {
                children: [
                  { children: [{ text: '21' }], type: 'td' },
                  { children: [{ text: '22' }], type: 'td' },
                  { children: [{ text: '23' }], type: 'td' },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          } satisfies TTableElement)
        ).toBe(true);
      });

      it('returns false when effective row widths differ after spans are applied', () => {
        expect(
          editor.plugin(BaseTablePlugin).api.isRectangular({
            children: [
              {
                children: [
                  { children: [{ text: '11' }], rowSpan: 2, type: 'td' },
                  { children: [{ text: '12' }], type: 'td' },
                  { children: [{ text: '13' }], type: 'td' },
                ],
                type: 'tr',
              },
              {
                children: [{ children: [{ text: '22' }], type: 'td' }],
                type: 'tr',
              },
            ],
            type: 'table',
          } satisfies TTableElement)
        ).toBe(false);
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

    describe('moveSelectionFromCell', () => {
      it('returns undefined when edge expansion needs more than one selected cell', () => {
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
        const initialSelection = editor.read.selection();

        expect(
          editor.plugin(BaseTablePlugin).update.moveSelection({ edge: 'right' })
        ).toBeUndefined();
        expect(editor.read.selection()).toEqual(initialSelection);
      });

      it('can expand from a single active cell when fromOneCell is true', () => {
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
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(
          editor
            .plugin(BaseTablePlugin)
            .update.moveSelection({ edge: 'right', fromOneCell: true })
        ).toBe(true);
        expect(editor.read.selection()).toMatchObject({
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 1, 0, 0] },
          kind: 'table-cell',
        });
        expect(editor.read.selection.ranges()).toHaveLength(2);
      });

      it('can expand a single active cell upward when fromOneCell is true', () => {
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
                  <hp>
                    21
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(
          editor
            .plugin(BaseTablePlugin)
            .update.moveSelection({ edge: 'top', fromOneCell: true })
        ).toBe(true);
        expect(editor.read.selection()).toMatchObject({
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 1, 0, 0, 0] },
          kind: 'table-cell',
        });
        expect(editor.read.selection.ranges()).toHaveLength(2);
      });

      it('can expand a single active cell downward when fromOneCell is true', () => {
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
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(
          editor
            .plugin(BaseTablePlugin)
            .update.moveSelection({ edge: 'bottom', fromOneCell: true })
        ).toBe(true);
        expect(editor.read.selection()).toMatchObject({
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 1, 0, 0, 0] },
          kind: 'table-cell',
        });
        expect(editor.read.selection.ranges()).toHaveLength(2);
      });

      it('does nothing when edge expansion would leave the table grid', () => {
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
        const initialSelection = editor.read.selection();

        expect(
          editor
            .plugin(BaseTablePlugin)
            .update.moveSelection({ edge: 'left', fromOneCell: true })
        ).toBe(true);
        expect(editor.read.selection()).toEqual(initialSelection);
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

    describe('moveSelectionFromCell', () => {
      it('moves a collapsed selection to the next cell', () => {
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

        const output = (
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

        editor.plugin(BaseTablePlugin).update.moveSelection();

        expect(editor.read.selection()).toEqual(output.selection!);
      });

      it('expands the current cell range to the right edge', () => {
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

        const output = (
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
                    <focus />
                    22
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.plugin(BaseTablePlugin).update.moveSelection({ edge: 'right' });

        expect(editor.read.selection()).toMatchObject({
          ...output.selection!,
          kind: 'table-cell',
        });
        expect(editor.read.selection.ranges()).toHaveLength(4);
      });

      it('moves forward out of the table when there is no next cell', () => {
        const input = (
          <editor>
            <hp>before</hp>
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
            <hp>after</hp>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hp>before</hp>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
            </htable>
            <hp>
              <cursor />
              after
            </hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.plugin(BaseTablePlugin).update.moveSelection();

        expect(editor.read.selection()).toEqual(output.selection!);
      });

      it('moves backward out of the table when there is no previous cell', () => {
        const input = (
          <editor>
            <hp>before</hp>
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
            <hp>after</hp>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hp>
              before
              <cursor />
            </hp>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
            </htable>
            <hp>after</hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.plugin(BaseTablePlugin).update.moveSelection({ reverse: true });

        expect(editor.read.selection()).toEqual(output.selection!);
      });
    });
  }
});
