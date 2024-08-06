/** @jsx jsx */

import { type PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { TablePlugin } from './TablePlugin';
import { withDeleteTable } from './withDeleteTable';

jsx;

describe('withDeleteTable', () => {
  // https://github.com/udecode/editor-protocol/issues/22
  describe('Delete backward after a table', () => {
    it('should select the last cell', () => {
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
      ) as any as PlateEditor;

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

      const plugin = TablePlugin;
      let editor = createPlateEditor({
        editor: input,
        plugins: [plugin],
      });

      editor = withDeleteTable({ editor, plugin });

      editor.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/23
  describe('Delete forward before a table', () => {
    it('should select its first cell', () => {
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
      ) as any as PlateEditor;

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
      ) as any as PlateEditor;

      let editor = createPlateEditor({
        editor: input,
        plugins: [TablePlugin],
      });

      editor = withDeleteTable({ editor });

      editor.deleteForward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/21
  // https://github.com/udecode/editor-protocol/issues/25
  describe('Delete when selecting cells', () => {
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
      ) as any as PlateEditor;

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
      ) as any as PlateEditor;

      editor = createPlateEditor({
        editor: input,
        plugins: [TablePlugin],
      });

      editor = withDeleteTable(editor);

      editor.deleteFragment();
    });

    it('should remove the cells content', () => {
      expect(editor.children).toEqual(output.children);
    });

    it('should set the selection to the last cell', () => {
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
