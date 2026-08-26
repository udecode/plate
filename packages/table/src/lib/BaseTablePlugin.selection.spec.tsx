/** @jsx jsxt */

import assert from 'node:assert/strict';

import type { Range } from '@platejs/plite';
import {
  getEditorLiveSelection,
  getSelectionDOMRange,
} from '@platejs/plite/internal';
import {
  jsx,
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '@platejs/test-utils';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTableCellPlugin, BaseTablePlugin } from './BaseTablePlugin';
import type { TableElement } from './BaseTablePlugin';
import { createTableNodeSelection } from './internal/selection';

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

    describe('core node selection', () => {
      it('keeps one-cell ranges, paths, and points as ordinary selections', () => {
        const editor = createEditor();
        const start = editor.read.points.start([0, 1, 1]);
        const end = editor.read.points.end([0, 1, 1]);

        assert.ok(start);
        assert.ok(end);

        const table = editor.plugin(BaseTablePlugin).read;

        expect(
          createTableNodeSelection(
            table.selection({ anchor: start, focus: end })!
          )
        ).toBeNull();
        expect(
          createTableNodeSelection(
            table.selection({ anchor: end, focus: start })!
          )
        ).toBeNull();
        expect(
          createTableNodeSelection(table.selection([0, 1, 1])!)
        ).toBeNull();
        expect(createTableNodeSelection(table.selection(end)!)).toBeNull();
      });

      it('derives merge and split eligibility from exact node selection', () => {
        const mergeValue = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const mergeEditor = createTestTableEditor({
          plugins: getTestTablePlugins(),
          initialValue: mergeValue.children,
        });

        mergeEditor.update.selection.setNodes(
          [
            [0, 0, 0],
            [0, 0, 1],
          ],
          { anchor: [0, 0, 0], focus: [0, 0, 1] }
        );

        expect(mergeEditor.plugin(BaseTablePlugin).read.canMerge()).toBe(true);
        expect(mergeEditor.plugin(BaseTablePlugin).read.canSplit()).toBe(false);

        const splitValue = (
          <editor>
            <htable>
              <htr>
                <htd colSpan={2}>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const splitEditor = createTestTableEditor({
          plugins: getTestTablePlugins(),
          initialValue: splitValue.children,
        });

        splitEditor.update.selection.setNodes([[0, 0, 0]]);

        expect(splitEditor.plugin(BaseTablePlugin).read.canMerge()).toBe(false);
        expect(splitEditor.plugin(BaseTablePlugin).read.canSplit()).toBe(true);

        const readOnlyMergeEditor = createTestTableEditor({
          readOnly: true,
          plugins: getTestTablePlugins(),
          initialValue: mergeValue.children,
        });

        readOnlyMergeEditor.update.selection.setNodes([
          [0, 0, 0],
          [0, 0, 1],
        ]);

        expect(
          readOnlyMergeEditor.plugin(BaseTablePlugin).read.canMerge()
        ).toBe(false);

        const readOnlySplitEditor = createTestTableEditor({
          readOnly: true,
          plugins: getTestTablePlugins(),
          initialValue: splitValue.children,
        });

        readOnlySplitEditor.update.selection.setNodes([[0, 0, 0]]);

        expect(
          readOnlySplitEditor.plugin(BaseTablePlugin).read.canSplit()
        ).toBe(false);
      });

      it('creates a directed structural selection only when explicitly requested across cells', () => {
        const editor = createEditor();
        const anchor = editor.read.points.start([0, 1, 2]);
        const focus = editor.read.points.end([0, 1, 0]);

        assert.ok(anchor);
        assert.ok(focus);

        const view = editor
          .plugin(BaseTablePlugin)
          .read.selection({ anchor, focus });
        const selection = view && createTableNodeSelection(view);

        expect(selection).toMatchObject({
          anchorPath: [0, 1, 2],
          focusPath: [0, 1, 0],
          kind: 'node',
        });
        expect(selection?.paths).toEqual([
          [0, 1, 0],
          [0, 1, 1],
          [0, 1, 2],
        ]);
      });

      it('keeps the structural model selection while collapsing its DOM range', () => {
        const editor = createEditor();
        const anchor = editor.read.points.start([0, 1, 0]);
        const focus = editor.read.points.end([0, 1, 2]);

        assert.ok(anchor);
        assert.ok(focus);

        const view = editor
          .plugin(BaseTablePlugin)
          .read.selection({ anchor, focus });
        const selection = view && createTableNodeSelection(view);

        assert.ok(selection);
        editor.update.selection.set(selection);

        expect(editor.read.selection()).toEqual({ anchor, focus });
        expect(getEditorLiveSelection(editor)).toEqual(selection);
        expect(
          getSelectionDOMRange(editor, getEditorLiveSelection(editor))
        ).toBeNull();
      });

      it('exports projected table content as a closed slice', () => {
        const editor = createEditor();
        const anchor = editor.read.points.start([0, 1, 0]);
        const focus = editor.read.points.end([0, 1, 2]);

        assert.ok(anchor);
        assert.ok(focus);

        const view = editor
          .plugin(BaseTablePlugin)
          .read.selection({ anchor, focus });
        const selection = view && createTableNodeSelection(view);

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
        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 0, 0],
          focusPath: [0, 0, 1],
          kind: 'node',
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

        expect(table.read.selection()?.cellKeys).toEqual(
          [
            [0, 0, 0],
            [0, 0, 1],
            [0, 0, 2],
          ].map((path) => editor.key(path)!)
        );
        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 0, 2],
          focusPath: [0, 0, 0],
          kind: 'node',
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
        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 1, 0],
          focusPath: [0, 0, 0],
          kind: 'node',
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

        expect(table.read.selection()?.cellKeys).toEqual(
          [
            [0, 0, 0],
            [0, 1, 0],
            [0, 2, 0],
          ].map((path) => editor.key(path)!)
        );
        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 2, 0],
          focusPath: [0, 0, 0],
          kind: 'node',
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
        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 0, 0],
          focusPath: [0, 1, 0],
          kind: 'node',
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

        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
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

        const editor = createTableEditor(input);

        editor.plugin(BaseTablePlugin).update.moveSelection({ edge: 'right' });

        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 0, 0],
          focusPath: [0, 1, 1],
          kind: 'node',
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
          editor.plugin(BaseTablePlugin).read.selection()?.cellKeys
        ).toEqual(
          [
            [0, 0, 0],
            [0, 0, 1],
          ].map((path) => editor.key(path)!)
        );
        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 0, 0],
          focusPath: [0, 0, 1],
          kind: 'node',
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
          editor.plugin(BaseTablePlugin).read.selection()?.cellKeys
        ).toEqual(
          [
            [0, 0, 1],
            [0, 0, 2],
          ].map((path) => editor.key(path)!)
        );
        expect(getEditorLiveSelection(editor)).toMatchObject({
          anchorPath: [0, 0, 2],
          focusPath: [0, 0, 1],
          kind: 'node',
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

        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
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

        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
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

        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(requested.selection)
        );
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

        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(expected.selection)
        );
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

        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(requested.selection)
        );
      });
    });
  }
});
