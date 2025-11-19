/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { getTestTablePlugins } from './withNormalizeTable.spec';

jsxt;

describe('withDeleteTable', () => {
  // https://github.com/udecode/editor-protocol/issues/21
  // https://github.com/udecode/editor-protocol/issues/25
  describe('Delete when selecting cells', () => {
    describe.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('with disableMerge: $disableMerge', ({ disableMerge }) => {
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
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteFragment();
      });

      it('should remove the cells content', () => {
        expect(editor.children).toMatchObject(output.children);
      });

      it('should set the selection to the last cell', () => {
        expect(editor.selection).toEqual(output.selection);
      });
    });
  });
});
