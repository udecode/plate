/** @jsx jsxt */

import type { Range } from 'slate';

import { createPlateEditor } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getBlockAbove } from '../../../internal/queries/getBlockAbove';
import { getNextSiblingNodes } from '../../../queries/getNextSiblingNodes';

jsxt;

describe('getNextSiblingNodes', () => {
  describe('when no siblings', () => {
    it('should return empty array', () => {
      const input = createTEditor(
        (
          <editor>
            <hp>
              <htext>first</htext>
              <ha>
                test
                <cursor />
              </ha>
            </hp>
          </editor>
        ) as any
      );

      const editor = createTEditor();
      editor.selection = input.selection;
      editor.children = input.children;

      const above = getBlockAbove(editor) as any;
      expect(
        getNextSiblingNodes(above, (input.selection as Range).anchor.path)
      ).toEqual([]);
    });
  });

  describe('when has siblings', () => {
    it('should return sibling nodes', () => {
      const input = createTEditor(
        (
          <editor>
            <hp>
              <htext>first</htext>
              <ha>
                test
                <cursor />
              </ha>
              <htext />
              <htext>last</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = [<htext />, <htext>last</htext>];

      const editor = createPlateEditor({
        plugins: [LinkPlugin],
        selection: input.selection,
        value: input.children,
      });

      const above = getBlockAbove(editor as any) as any;

      expect(
        getNextSiblingNodes(above, (input.selection as Range).anchor.path)
      ).toEqual(output);
    });
  });
});
