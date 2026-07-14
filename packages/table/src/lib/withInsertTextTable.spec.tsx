/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';

jsxt;

describe('withInsertTextTable', () => {
  // https://github.com/udecode/editor-protocol/issues/65
  describe('cell child is a text', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('wraps the children into a p (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />a
                </hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  c<focus />
                </hp>
              </htd>
              <htd>
                <hp>d</hp>
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
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>e</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.delete();
      editor.update.text.insert('e');
      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });
});
