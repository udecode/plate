/** @jsx jsx */

import { createPlateEditor, PlateEditor, TElement } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withInsertFragmentTable } from './withInsertFragmentTable';

jsx;

describe('withInsertFragmentTable', () => {
  // https://github.com/udecode/editor-protocol/issues/13
  describe('when inserting table 2x1 into cell 11', () => {
    it('first table column should be replaced by the inserted table column', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <cursor />
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>a</htd>
            </htr>
            <htr>
              <htd>b</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>a</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>b</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      let editor = createPlateEditor({
        editor: input,
      });

      editor = withInsertFragmentTable(editor);

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/20
  describe('when inserting table 2x1 into cell 12', () => {
    it('second table column should be replaced by the inserted table column', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <cursor />
              </htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>a</htd>
            </htr>
            <htr>
              <htd>b</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                <anchor />a
              </htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                <focus />b
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      let editor = createPlateEditor({
        editor: input,
      });

      editor = withInsertFragmentTable(editor);

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);

      const selection = output.selection!;
      selection.anchor.path.pop();
      selection.focus.path.pop();
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
