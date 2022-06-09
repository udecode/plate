/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withDeleteTable } from './withDeleteTable';

jsx;

describe('withDeleteTable', () => {
  // https://github.com/udecode/editor-protocol/issues/22
  describe('Delete backward after a table', () => {
    it('should select the last cell', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
            </htr>
          </htable>
          <hp>
            <cursor />a
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <cursor />
              </htd>
            </htr>
          </htable>
          <hp>a</hp>
        </editor>
      ) as any) as PlateEditor;

      let editor = createPlateEditor({
        editor: input,
      });

      editor = withDeleteTable(editor);

      editor.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/23
  describe('Delete forward before a table', () => {
    it('should select its first cell', () => {
      const input = ((
        <editor>
          <hp>
            a
            <cursor />
          </hp>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <hp>a</hp>
          <htable>
            <htr>
              <htd>
                <cursor />
                11
              </htd>
              <htd>12</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      let editor = createPlateEditor({
        editor: input,
      });

      editor = withDeleteTable(editor);

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
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <anchor />
                11
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>
                21
                <focus />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      output = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <htext />
                <cursor />
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>
                <htext />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      editor = createPlateEditor({
        editor: input,
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
