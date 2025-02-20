/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { getTableGridAbove } from './queries/getTableGridAbove';
import { getTestTablePlugins } from './withNormalizeTable.spec';

jsxt;

describe('withGetFragmentTable', () => {
  // https://github.com/udecode/editor-protocol/issues/19
  describe('when copying cells 11-21', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should copy a table 2x1 with 11-21 cells (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
        const input = (
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
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        const fragment = editor.api.getFragment();

        expect(fragment).toMatchObject([getTableGridAbove(editor)[0][0]]);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/63
  describe('when copying a single cell with 2 blocks', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should copy only the 2 blocks (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        const fragment = editor.api.getFragment();

        expect(fragment).toMatchObject(blocks);
      }
    );
  });
});
