/** @jsx jsxt */

import { type SlateEditor, getEditorPlugin } from '@udecode/plate';
import { type PlateEditor, createPlateEditor } from '@udecode/plate/react';
import { jsxt } from '@udecode/plate-test-utils';

import { withDeleteTable } from './withDeleteTable';
import { getTestTablePlugins } from './withNormalizeTable.spec';

jsxt;

describe('withDeleteTable', () => {
  // https://github.com/udecode/editor-protocol/issues/22
  describe('Delete backward after a table', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should select the last cell (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
            <hp>
              <cursor />a
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
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
            </htable>
            <hp>a</hp>
          </editor>
        ) as any as PlateEditor;

        let editor = createPlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        editor = withDeleteTable(
          getEditorPlugin(editor, editor.plugins.table) as any
        ) as any;

        editor.deleteBackward('character');

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/23
  describe('Delete forward before a table', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should select its first cell (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
        const input = (
          <editor>
            <hp>
              a
              <cursor />
            </hp>
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
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>a</hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                    11
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        let editor = createPlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        editor = withDeleteTable(
          getEditorPlugin(editor, editor.plugins.table)
        ) as any;

        editor.deleteForward('character');

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/21
  // https://github.com/udecode/editor-protocol/issues/25
  describe('Delete when selecting cells', () => {
    describe.each([{ disableMerge: true }, { disableMerge: false }])(
      'with disableMerge: $disableMerge',
      ({ disableMerge }) => {
        let editor: any;
        let output: any;

        beforeEach(() => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <anchor />
                    11
                  </htd>
                  <htd>
                    <hp>12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    21
                    <focus />
                  </htd>
                  <htd>
                    <hp>22</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          output = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>
                      <htext />
                      <anchor />
                    </hp>
                  </htd>
                  <htd>
                    <hp>12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>
                      <htext />
                      <focus />
                    </hp>
                  </htd>
                  <htd>
                    <hp>22</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          editor = createPlateEditor({
            plugins: getTestTablePlugins({ disableMerge }),
            selection: input.selection,
            value: input.children,
          });

          editor = withDeleteTable(
            getEditorPlugin(editor, editor.plugins.table)
          );

          editor.deleteFragment();
        });

        it('should remove the cells content', () => {
          expect(editor.children).toMatchObject(output.children);
        });

        it('should set the selection to the last cell', () => {
          expect(editor.selection).toEqual(output.selection);
        });
      }
    );
  });
});
