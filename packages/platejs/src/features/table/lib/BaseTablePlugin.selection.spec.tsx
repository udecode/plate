/** @jsxRuntime classic */
/** @jsx jsxt */

import assert from 'node:assert/strict';

import {
  getEditorLiveSelection,
  jsx,
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '#platejs-test-internal';

import { getSelectionDOMRange } from '../../../core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

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
        plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
        initialValue: value.children,
      });

    describe('core node selection', () => {
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
          plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
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
          plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
          initialValue: splitValue.children,
        });

        splitEditor.update.selection.setNodes([[0, 0, 0]]);

        expect(splitEditor.plugin(BaseTablePlugin).read.canMerge()).toBe(false);
        expect(splitEditor.plugin(BaseTablePlugin).read.canSplit()).toBe(true);

        const readOnlyMergeEditor = createTestTableEditor({
          readOnly: true,
          plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
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
          plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
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
          .read.selection({ at: { anchor, focus } });
        assert.ok(view);
        editor.update.selection.setNodes(
          view.cells.map(([, path]) => path),
          {
            anchor: editor.read.nodes.path(view.anchor)!,
            focus: editor.read.nodes.path(view.focus)!,
          }
        );
        const selection = getEditorLiveSelection(editor);
        assert.ok(selection && 'paths' in selection);

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
          .read.selection({ at: { anchor, focus } });
        assert.ok(view);
        editor.update.selection.setNodes(
          view.cells.map(([, path]) => path),
          {
            anchor: editor.read.nodes.path(view.anchor)!,
            focus: editor.read.nodes.path(view.focus)!,
          }
        );
        const selection = getEditorLiveSelection(editor);
        assert.ok(selection && 'paths' in selection);

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
          .read.selection({ at: { anchor, focus } });
        assert.ok(view);
        editor.update.selection.setNodes(
          view.cells.map(([, path]) => path),
          {
            anchor: editor.read.nodes.path(view.anchor)!,
            focus: editor.read.nodes.path(view.focus)!,
          }
        );
        const selection = getEditorLiveSelection(editor);
        assert.ok(selection && 'paths' in selection);

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
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
        selection: input.selection,
        initialValue: input.children,
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

        assert.ok(requested.selection);
        editor.update.selection.set(requested.selection);

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

        assert.ok(requested.selection);
        editor.update.selection.set(requested.selection);

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

        assert.ok(requested.selection);
        editor.update.selection.set(requested.selection);

        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(requested.selection)
        );
      });
    });
  }
});
