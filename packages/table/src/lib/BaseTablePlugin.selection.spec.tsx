/** @jsx jsxt */

import assert from 'node:assert/strict';

import { createPlateEditor } from '@platejs/core/react';
import type { Range } from '@platejs/plite';
import { jsx, jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTableCellPlugin, BaseTablePlugin } from './BaseTablePlugin';
import type { TableElement } from './BaseTablePlugin';

const assertTableSelectionInference = () => {
  const range = {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  } satisfies Range;
  const tableSelection = {
    ...range,
    cells: [range],
    kind: 'table-cell' as const,
  };
  const tableEditor = createPlateEditor({ plugins: [BaseTablePlugin] });
  const selection = tableEditor.read.selection();

  if (selection && selection.kind === 'table-cell') {
    const cells: readonly Range[] = selection.cells;

    void cells;
  }

  tableEditor.update((tx) => tx.selection.set(tableSelection));

  // @ts-expect-error Direct update selection exposes mutations, not queries.
  tableEditor.update.selection();

  const plainEditor = createPlateEditor();

  plainEditor.update((tx) => {
    // @ts-expect-error Table selection is unavailable without BaseTablePlugin.
    tx.selection.set(tableSelection);
  });
};

void assertTableSelectionInference;

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
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: value.children,
      });

    const getCell = (
      editor: ReturnType<typeof createEditor>,
      path: number[]
    ) => {
      const entry = editor.read.nodes.get(path, {
        type: BaseTableCellPlugin,
      });
      assert.ok(entry);

      return entry[0];
    };

    describe('getSelectedCellsBoundingBox', () => {
      it('returns the bounds of one cell', () => {
        const editor = createEditor();

        expect(
          editor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBoundingBox([getCell(editor, [0, 1, 1])])
        ).toEqual({ maxCol: 1, maxRow: 1, minCol: 1, minRow: 1 });
      });

      it('returns the bounds of horizontal, vertical, and L-shaped selections', () => {
        const editor = createEditor();

        expect(
          editor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBoundingBox([
              getCell(editor, [0, 1, 0]),
              getCell(editor, [0, 1, 1]),
              getCell(editor, [0, 1, 2]),
            ])
        ).toEqual({ maxCol: 2, maxRow: 1, minCol: 0, minRow: 1 });
        expect(
          editor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBoundingBox([
              getCell(editor, [0, 0, 1]),
              getCell(editor, [0, 1, 1]),
              getCell(editor, [0, 2, 1]),
            ])
        ).toEqual({ maxCol: 1, maxRow: 2, minCol: 1, minRow: 0 });
        expect(
          editor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBoundingBox([
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
            .read.getSelectedCellsBoundingBox([
              getCell(editor, [0, 0, 0]),
              getCell(editor, [0, 2, 2]),
            ])
        ).toEqual({ maxCol: 2, maxRow: 2, minCol: 0, minRow: 0 });

        const spanningInput = (
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
                  <hp>10</hp>
                </htd>
                <htd colSpan={2} rowSpan={2}>
                  <hp>span</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>20</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const spanningEditor = createTestTableEditor({
          plugins: getTestTablePlugins(),
          initialValue: spanningInput.children,
        });
        const spanningCell = getCell(spanningEditor, [0, 1, 1]);

        expect(
          spanningEditor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBoundingBox([spanningCell])
        ).toEqual({
          maxCol: 2,
          maxRow: 2,
          minCol: 1,
          minRow: 1,
        });
      });

      it('uses the explicit cells table instead of the active selection table', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    a1
                  </hp>
                </htd>
                <htd>
                  <hp>
                    a2
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
            <htable>
              <htr>
                <htd>
                  <hp>b1</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>b2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTestTableEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          initialValue: input.children,
        });

        expect(
          editor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBoundingBox([getCell(editor, [1, 1, 0])])
        ).toEqual({ maxCol: 0, maxRow: 1, minCol: 0, minRow: 1 });
      });
    });

    describe('createCellSelection', () => {
      it('keeps one-cell ranges, paths, and points as ordinary selections', () => {
        const editor = createEditor();
        const start = editor.read.points.start([0, 1, 1]);
        const end = editor.read.points.end([0, 1, 1]);

        assert.ok(start);
        assert.ok(end);

        const table = editor.plugin(BaseTablePlugin).read;

        expect(
          table.createCellSelection({ anchor: start, focus: end })
        ).toBeNull();
        expect(
          table.createCellSelection({ anchor: end, focus: start })
        ).toBeNull();
        expect(table.createCellSelection([0, 1, 1])).toBeNull();
        expect(table.createCellSelection(end)).toBeNull();
      });

      it('creates a directed structural selection only when explicitly requested across cells', () => {
        const editor = createEditor();
        const anchor = editor.read.points.start([0, 1, 2]);
        const focus = editor.read.points.end([0, 1, 0]);

        assert.ok(anchor);
        assert.ok(focus);

        const selection = editor
          .plugin(BaseTablePlugin)
          .read.createCellSelection({ anchor, focus });

        expect(selection).toMatchObject({
          anchor,
          focus,
          kind: 'table-cell',
        });
        expect(selection?.cells).toHaveLength(3);
      });

      it('keeps the structural model selection while collapsing its DOM range', () => {
        const editor = createEditor();
        const anchor = editor.read.points.start([0, 1, 0]);
        const focus = editor.read.points.end([0, 1, 2]);

        assert.ok(anchor);
        assert.ok(focus);

        const selection = editor
          .plugin(BaseTablePlugin)
          .read.createCellSelection({ anchor, focus });

        assert.ok(selection);
        editor.update.selection.set(selection);

        expect(editor.read.selection()).toEqual(selection);
        expect(editor.read.selection.primaryRange()).toEqual({
          anchor,
          focus: anchor,
        });
      });

      it('exports projected table content as a closed slice', () => {
        const editor = createEditor();
        const anchor = editor.read.points.start([0, 1, 0]);
        const focus = editor.read.points.end([0, 1, 2]);

        assert.ok(anchor);
        assert.ok(focus);

        const selection = editor
          .plugin(BaseTablePlugin)
          .read.createCellSelection({ anchor, focus });

        assert.ok(selection);
        editor.update.selection.set(selection);

        const slice = editor.read.slice.get();

        expect(slice.openStart).toBe(0);
        expect(slice.openEnd).toBe(0);
        expect(slice.content).toHaveLength(1);
        expect(slice.content[0]).toMatchObject({ type: 'table' });
      });
    });
  }
  {
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins(),
    });

    describe('isTableRectangular', () => {
      it('treats matching effective widths as rectangular', () => {
        expect(
          editor.plugin(BaseTablePlugin).api.isRectangular({
            children: [
              {
                children: [
                  { children: [{ text: '11' }], colSpan: 2, type: 'tableCell' },
                  { children: [{ text: '13' }], type: 'tableCell' },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  { children: [{ text: '21' }], type: 'tableCell' },
                  { children: [{ text: '22' }], type: 'tableCell' },
                  { children: [{ text: '23' }], type: 'tableCell' },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          } satisfies TableElement)
        ).toBe(true);
      });

      it('returns false when effective row widths differ after spans are applied', () => {
        expect(
          editor.plugin(BaseTablePlugin).api.isRectangular({
            children: [
              {
                children: [
                  { children: [{ text: '11' }], rowSpan: 2, type: 'tableCell' },
                  { children: [{ text: '12' }], type: 'tableCell' },
                  { children: [{ text: '13' }], type: 'tableCell' },
                ],
                type: 'tableRow',
              },
              {
                children: [{ children: [{ text: '22' }], type: 'tableCell' }],
                type: 'tableRow',
              },
            ],
            type: 'table',
          } satisfies TableElement)
        ).toBe(false);
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

      it('keeps the original anchor while repeatedly extending left', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd id="a">
                  <hp>a</hp>
                </htd>
                <htd id="b">
                  <hp>b</hp>
                </htd>
                <htd id="c">
                  <hp>
                    c<cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);
        const table = editor.plugin(BaseTablePlugin);

        table.update.moveSelection({ edge: 'left', fromOneCell: true });
        table.update.moveSelection({ edge: 'left' });

        expect(table.read.getSelectedCellKeys()).toEqual(
          [
            [0, 0, 0],
            [0, 0, 1],
            [0, 0, 2],
          ].map((path) => editor.key(path)!)
        );
        expect(editor.read.selection()).toMatchObject({
          anchor: { path: [0, 0, 2, 0, 0] },
          focus: { path: [0, 0, 0, 0, 0] },
          kind: 'table-cell',
        });
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
          anchor: { offset: 0, path: [0, 1, 0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0, 0, 0] },
          kind: 'table-cell',
        });
        expect(editor.read.selection.ranges()).toHaveLength(2);
      });

      it('keeps the original anchor while repeatedly extending upward', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd id="a">
                  <hp>a</hp>
                </htd>
              </htr>
              <htr>
                <htd id="b">
                  <hp>b</hp>
                </htd>
              </htr>
              <htr>
                <htd id="c">
                  <hp>
                    c<cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);
        const table = editor.plugin(BaseTablePlugin);

        table.update.moveSelection({ edge: 'top', fromOneCell: true });
        table.update.moveSelection({ edge: 'top' });

        expect(table.read.getSelectedCellKeys()).toEqual(
          [
            [0, 0, 0],
            [0, 1, 0],
            [0, 2, 0],
          ].map((path) => editor.key(path)!)
        );
        expect(editor.read.selection()).toMatchObject({
          anchor: { path: [0, 2, 0, 0, 0] },
          focus: { path: [0, 0, 0, 0, 0] },
          kind: 'table-cell',
        });
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
      createTestTableEditor({
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

      it('moves the focus inward to contract a forward cell selection', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd id="a">
                  <hp>
                    <anchor />a
                  </hp>
                </htd>
                <htd id="b">
                  <hp>b</hp>
                </htd>
                <htd id="c">
                  <hp>
                    c<focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);

        editor.plugin(BaseTablePlugin).update.moveSelection({ edge: 'left' });

        expect(
          editor.plugin(BaseTablePlugin).read.getSelectedCellKeys()
        ).toEqual(
          [
            [0, 0, 0],
            [0, 0, 1],
          ].map((path) => editor.key(path)!)
        );
        expect(editor.read.selection()).toMatchObject({
          anchor: { path: [0, 0, 0, 0, 0] },
          focus: { path: [0, 0, 1, 0, 0] },
          kind: 'table-cell',
        });
      });

      it('moves the focus inward to contract an inverted cell selection', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd id="a">
                  <hp>
                    <focus />a
                  </hp>
                </htd>
                <htd id="b">
                  <hp>b</hp>
                </htd>
                <htd id="c">
                  <hp>
                    c<anchor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);

        editor.plugin(BaseTablePlugin).update.moveSelection({ edge: 'right' });

        expect(
          editor.plugin(BaseTablePlugin).read.getSelectedCellKeys()
        ).toEqual(
          [
            [0, 0, 1],
            [0, 0, 2],
          ].map((path) => editor.key(path)!)
        );
        expect(editor.read.selection()).toMatchObject({
          anchor: { path: [0, 0, 2, 0, 0] },
          focus: { path: [0, 0, 1, 0, 0] },
          kind: 'table-cell',
        });
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

    describe('table boundary normalization policy', () => {
      it('keeps a range from a document-leading table into trailing text', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                    cell
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>after</hp>
          </editor>
        ) as TestEditor;
        const requested = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    cell
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>
              <focus />
              after
            </hp>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);

        editor.update.selection.set(requested.selection!);

        expect(editor.read.selection()).toEqual(requested.selection!);
      });

      it('clamps a forward range from text into a trailing table to the table end', () => {
        const input = (
          <editor>
            <hp>
              <cursor />
              before
            </hp>
            <htable>
              <htr>
                <htd>
                  <hp>cell</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const requested = (
          <editor>
            <hp>
              <anchor />
              before
            </hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <focus />
                    cell
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const expected = (
          <editor>
            <hp>
              <anchor />
              before
            </hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    cell
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const editor = createTableEditor(input);

        editor.update.selection.set(requested.selection!);

        expect(editor.read.selection()).toEqual(expected.selection!);
      });

      it('keeps a range that crosses two document-edge tables', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                    first
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>between</hp>
            <htable>
              <htr>
                <htd>
                  <hp>second</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const requested = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    first
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>between</hp>
            <htable>
              <htr>
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

        editor.update.selection.set(requested.selection!);

        expect(editor.read.selection()).toEqual(requested.selection!);
      });
    });
  }
});
