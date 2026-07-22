/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTableGridAbove } from './queries/getTableGridAbove';
import { getTestTablePlugins } from './__tests__/getTestTablePlugins';

jsxt;

describe('withGetFragmentTable', () => {
  // https://github.com/udecode/editor-protocol/issues/19
  describe('when copying cells 11-21', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('copies a table 2x1 with 11-21 cells (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  11
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
                  21
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      const fragment = editor.read.fragment();

      expect(fragment).toMatchObject([getTableGridAbove(editor)[0][0]]);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/63
  describe('when copying a single cell with 2 blocks', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('copies only the 2 blocks (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const blocks = (
        <fragment>
          <hp>
            <anchor />
            11
          </hp>
          <hp>
            12
            <focus />
          </hp>
        </fragment>
      );

      const input = (
        <editor>
          <htable>
            <htr>
              <htd>{blocks}</htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      const fragment = editor.read.fragment();

      expect(fragment).toMatchObject(blocks);
    });
  });
});
