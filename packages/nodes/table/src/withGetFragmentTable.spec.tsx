/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { getTableGridAbove } from './queries/getTableGridAbove';
import { withGetFragmentTable } from './withGetFragmentTable';

jsx;

describe('withGetFragmentTable', () => {
  // https://github.com/udecode/editor-protocol/issues/19
  describe('when copying cells 11-21', () => {
    it('should copy a table 2x1 with 11-21 cells', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <anchor />
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

      let editor = createPlateEditor({
        editor: input,
      });

      editor = withGetFragmentTable(editor);

      const fragment = editor.getFragment();

      expect(fragment).toEqual([getTableGridAbove(editor)[0][0]]);
    });
  });
});
