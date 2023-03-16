/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createTablePlugin } from '../createTablePlugin';
import { setBorderSize } from './setBorderSize';

jsx;

describe('setBorder', () => {
  describe('when in cell 12', () => {
    it('should delete column', () => {
      const input = ((
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
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd borders={{ bottom: { size: 0 } }}>
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
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      setBorderSize(editor, 0, {
        border: 'bottom',
      });

      expect(editor.children).toEqual(output.children);
    });
  });
});
