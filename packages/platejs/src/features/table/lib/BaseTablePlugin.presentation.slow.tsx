/** @jsx jsxt */

import assert from 'node:assert/strict';

import type { TestEditor } from '#platejs-test-internal';
import { jsx, jsxt } from '#platejs-test-internal';

import type { Value } from '../../../core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import type { TableCellElement } from './BaseTablePlugin';
import { BaseTableCellPlugin, BaseTablePlugin } from './BaseTablePlugin';

describe('table presentation slow contracts', () => {
  jsxt;

  describe('setBorderWidth', () => {
    const createEditorInstance = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('when in cell 11', () => {
      it('set border top', () => {
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

        const output = (
          <editor>
            <htable>
              <htr>
                <htd borders={{ top: { width: 2 } }}>
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

        const editor = createEditorInstance(input);
        editor
          .plugin(BaseTablePlugin)
          .update.setBorderWidth(2, { border: 'top' });

        expect(editor.read.children()).toMatchObject(output.children);
      });

      it('sets all borders by delegating to each side', () => {
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

        const editor = createEditorInstance(input);
        let commits = 0;

        editor.subscribeCommit(() => (commits += 1) - 1);
        editor
          .plugin(BaseTablePlugin)
          .update.setBorderWidth(2, { border: 'all' });

        expect(editor.read.children()).toMatchObject(
          (
            <editor>
              <htable>
                <htr>
                  <htd
                    borders={{
                      bottom: { width: 2 },
                      left: { width: 2 },
                      right: { width: 2 },
                      top: { width: 2 },
                    }}
                  >
                    <hp>
                      11
                      <cursor />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ).children
        );
        expect(commits).toBe(1);
      });

      it('set border left', () => {
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

        const output = (
          <editor>
            <htable>
              <htr>
                <htd borders={{ left: { width: 2 } }}>
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

        const editor = createEditorInstance(input);
        editor
          .plugin(BaseTablePlugin)
          .update.setBorderWidth(2, { border: 'left' });

        expect(editor.read.children()).toMatchObject(output.children);
      });

      describe('when in cell 21', () => {
        it('set border left', () => {
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
                  <htd borders={{ left: { width: 3 } }}>
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

          const editor = createEditorInstance(input);
          editor
            .plugin(BaseTablePlugin)
            .update.setBorderWidth(3, { border: 'left' });

          expect(editor.read.children()).toMatchObject(output.children);
        });

        describe('set border top', () => {
          // ... other tests in this describe block

          it('set border bottom on cell 11', () => {
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
                    <htd borders={{ bottom: { width: 2 } }}>
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

            const editor = createEditorInstance(input);
            editor
              .plugin(BaseTablePlugin)
              .update.setBorderWidth(2, { border: 'top' });

            expect(editor.read.children()).toMatchObject(output.children);
          });
        });

        describe('when in cell 12', () => {
          it('set border right', () => {
            const input = (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>11</hp>
                    </htd>
                    <htd>
                      <hp>
                        12
                        <cursor />
                      </hp>
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

            const output = (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>11</hp>
                    </htd>
                    <htd borders={{ right: { width: 1 } }}>
                      <hp>
                        12
                        <cursor />
                      </hp>
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

            const editor = createEditorInstance(input);
            editor
              .plugin(BaseTablePlugin)
              .update.setBorderWidth(1, { border: 'right' });

            expect(editor.read.children()).toMatchObject(output.children);
          });

          describe('set border left', () => {
            it('set border right on cell 11', () => {
              const input = (
                <editor>
                  <htable>
                    <htr>
                      <htd>
                        <hp>11</hp>
                      </htd>
                      <htd>
                        <hp>
                          12
                          <cursor />
                        </hp>
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

              const output = (
                <editor>
                  <htable>
                    <htr>
                      <htd borders={{ right: { width: 2 } }}>
                        <hp>11</hp>
                      </htd>
                      <htd>
                        <hp>
                          12
                          <cursor />
                        </hp>
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

              const editor = createEditorInstance(input);
              editor
                .plugin(BaseTablePlugin)
                .update.setBorderWidth(2, { border: 'left' });

              expect(editor.read.children()).toMatchObject(output.children);
            });
          });
        });

        describe('when in cell 22', () => {
          it('set border bottom', () => {
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
                      <hp>21</hp>
                    </htd>
                    <htd borders={{ bottom: { width: 4 } }}>
                      <hp>
                        22
                        <cursor />
                      </hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ) as TestEditor;

            const editor = createEditorInstance(input);
            editor
              .plugin(BaseTablePlugin)
              .update.setBorderWidth(4, { border: 'bottom' });

            expect(editor.read.children()).toMatchObject(output.children);
          });
        });
      });
    });
  });
  jsxt;

  describe('setCellBackground', () => {
    const createEditorInstance = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('when background color is not set', () => {
      it('set background color for current cell', () => {
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

        const output = (
          <editor>
            <htable>
              <htr>
                <htd backgroundColor="red">
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editorInstance = createEditorInstance(input);
        editorInstance
          .plugin(BaseTablePlugin)
          .update.setCellBackground({ color: 'red' });

        expect(editorInstance.read.children()).toMatchObject(output.children);
      });

      it('set background color for selected cells', () => {
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

        const output = (
          <editor>
            <htable>
              <htr>
                <htd backgroundColor="red">
                  <hp>11</hp>
                </htd>
                <htd backgroundColor="red">
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editorInstance = createEditorInstance(input);
        let commits = 0;

        editorInstance.subscribeCommit(() => (commits += 1) - 1);
        editorInstance.update((tx) => {
          tx.selection.setNodes(
            [
              [0, 0, 0],
              [0, 0, 1],
            ],
            { anchor: [0, 0, 0], focus: [0, 0, 1] }
          );
          tx.plugin(BaseTablePlugin).setCellBackground({ color: 'red' });
        });

        expect(editorInstance.read.children()).toMatchObject(output.children);
        expect(
          editorInstance.read.selection.nodes().map(([, path]) => path)
        ).toEqual([
          [0, 0, 0],
          [0, 0, 1],
        ]);
        expect(commits).toBe(1);
      });
    });

    describe('when background color is set', () => {
      it('remove the background color for current cell', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd backgroundColor="red">
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
                <htd backgroundColor="red">
                  <hp>12</hp>
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
                <htd backgroundColor="red">
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editorInstance = createEditorInstance(input);
        editorInstance
          .plugin(BaseTablePlugin)
          .update.setCellBackground({ color: null });

        expect(editorInstance.read.children()).toMatchObject(output.children);
      });

      it('reset the background color to transparent for selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd backgroundColor="red">
                  <hp>11</hp>
                </htd>
                <htd backgroundColor="blue">
                  <hp>12</hp>
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
            </htable>
          </editor>
        ) as TestEditor;

        const editorInstance = createEditorInstance(input);
        editorInstance.update.selection.setNodes(
          [
            [0, 0, 0],
            [0, 0, 1],
          ],
          { anchor: [0, 0, 0], focus: [0, 0, 1] }
        );
        editorInstance.plugin(BaseTablePlugin).update.setCellBackground({
          color: null,
        });

        expect(editorInstance.read.children()).toMatchObject(output.children);
      });
    });
  });

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('setTableMarginLeft', () => {
      it('sets the margin on the matched table node', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
            </htable>
            <htable>
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

        editor
          .plugin(BaseTablePlugin)
          .update.set({ marginLeft: 48 }, { at: [1] });

        expect(editor.read.children()).toMatchObject([
          { type: 'table' },
          { marginLeft: 48, type: 'table' },
        ]);
      });

      it('does nothing when no table matches the requested location', () => {
        const input = (
          <editor>
            <hp>
              text
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor
          .plugin(BaseTablePlugin)
          .update.set({ marginLeft: 24 }, { at: [0] });

        expect(editor.read.children()).toMatchObject(input.children);
      });
    });
  }

  {
    jsx;

    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>
                11
                <cursor />
              </hp>
            </htd>
            <htd id="c12">
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const createEditor = () =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
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

    const setBorders = (
      editor: ReturnType<typeof createEditor>,
      path: number[],
      borders: TableCellElement['borders']
    ) =>
      editor.plugin(BaseTableCellPlugin).update.set({ borders }, { at: path });

    const visible = { width: 1 };
    const hidden = { width: 0 };

    describe('getSelectedCellsBorders', () => {
      it('returns defaults outside a table and reads the current cell', () => {
        const outsideValue: Value = [
          { children: [{ text: 'outside' }], type: 'paragraph' },
        ];
        const outside = createTestTableEditor({
          plugins: getTestTablePlugins(),
          initialValue: outsideValue,
        });

        expect(
          outside.plugin(BaseTablePlugin).read.getSelectedCellsBorders()
        ).toEqual({
          bottom: true,
          left: true,
          none: false,
          outer: true,
          right: true,
          top: true,
        });

        const editor = createEditor();
        setBorders(editor, [0, 0, 0], {
          bottom: visible,
          left: visible,
          right: visible,
          top: visible,
        });

        expect(
          editor.plugin(BaseTablePlugin).read.getSelectedCellsBorders()
        ).toEqual({
          bottom: true,
          left: true,
          none: false,
          outer: true,
          right: true,
          top: true,
        });
      });

      it('detects a borderless cell without fake path or adjacency mocks', () => {
        const editor = createEditor();
        setBorders(editor, [0, 0, 0], {
          bottom: hidden,
          left: hidden,
          right: hidden,
          top: hidden,
        });
        const cell = getCell(editor, [0, 0, 0]);

        expect(
          editor.plugin(BaseTablePlugin).read.getSelectedCellsBorders([cell])
            .none
        ).toBe(true);
        expect(
          editor.plugin(BaseTablePlugin).read.isSelectedCellBordersNone([cell])
        ).toBe(true);
      });

      it('computes outer and side borders across adjacent cells', () => {
        const editor = createEditor();
        setBorders(editor, [0, 0, 0], {
          bottom: visible,
          left: visible,
          top: visible,
        });
        setBorders(editor, [0, 0, 1], {
          bottom: visible,
          right: visible,
          top: visible,
        });
        const cells = [getCell(editor, [0, 0, 0]), getCell(editor, [0, 0, 1])];

        expect(
          editor.plugin(BaseTablePlugin).read.getSelectedCellsBorders(cells)
            .outer
        ).toBe(true);
        expect(
          editor.plugin(BaseTablePlugin).read.isSelectedCellBordersOuter(cells)
        ).toBe(true);
        expect(
          editor.plugin(BaseTablePlugin).read.isSelectedCellBorder(cells, 'top')
        ).toBe(true);

        editor.update.selection.setNodes(
          [
            [0, 0, 0],
            [0, 0, 1],
          ],
          { anchor: [0, 0, 0], focus: [0, 0, 1] }
        );

        expect(
          editor.plugin(BaseTablePlugin).read.getSelectedCellsBorders().outer
        ).toBe(true);

        setBorders(editor, [0, 0, 1], {
          bottom: visible,
          right: hidden,
          top: visible,
        });

        expect(
          editor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBorders([
              getCell(editor, [0, 0, 0]),
              getCell(editor, [0, 0, 1]),
            ]).outer
        ).toBe(false);
      });

      it('reads top and left edges from adjacent cells', () => {
        const editor = createEditor();
        setBorders(editor, [0, 0, 1], { bottom: visible });
        setBorders(editor, [0, 1, 0], { right: visible });
        setBorders(editor, [0, 1, 1], {
          bottom: visible,
          right: visible,
        });

        expect(
          editor
            .plugin(BaseTablePlugin)
            .read.getSelectedCellsBorders([getCell(editor, [0, 1, 1])])
        ).toEqual({
          bottom: true,
          left: true,
          none: false,
          outer: true,
          right: true,
          top: true,
        });
      });

      it('skips side computation when it is not requested', () => {
        const editor = createEditor();
        const cell = getCell(editor, [0, 0, 0]);

        expect(
          editor.plugin(BaseTablePlugin).read.getSelectedCellsBorders([cell], {
            select: { none: false, outer: false, side: false },
          })
        ).toEqual({
          bottom: true,
          left: true,
          none: false,
          outer: true,
          right: true,
          top: true,
        });
      });
    });
  }
});
