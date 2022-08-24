/** @jsx jsx */

import {
  createPlateEditor,
  normalizeEditor,
  PlateEditor,
} from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createTablePlugin } from './createTablePlugin';

jsx;

describe('withNormalizeTable', () => {
  // https://github.com/udecode/editor-protocol/issues/65
  describe('cell child is a text', () => {
    it('should wrap the children into a p', async () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <htext>a</htext>
                <htext bold>b</htext>
                <htext italic>c</htext>
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
                <hp>
                  <htext>a</htext>
                  <htext bold>b</htext>
                  <htext italic>c</htext>
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      normalizeEditor(editor, {
        force: true,
      });
      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/76
  describe('table in a table', () => {
    it('should unwrap the nested table, tr, td', async () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
                <htable>
                  <htr>
                    <htd>
                      <hp>b</hp>
                    </htd>
                    <htd>
                      <hp>c</hp>
                    </htd>
                  </htr>
                </htable>
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
                <hp>a</hp>
                <hp>b</hp>
                <hp>c</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      normalizeEditor(editor, {
        force: true,
      });
      expect(editor.children).toEqual(output.children);
    });
  });
});
