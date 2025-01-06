/** @jsx jsxt */

import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createPlateEditor } from '../../../plate/dist/react';
import { createEditor } from '../createEditor';
import { getNextSiblingNodes } from './getNextSiblingNodes';

jsxt;

describe('getNextSiblingNodes', () => {
  describe('when no siblings', () => {
    it('should return empty array', () => {
      const input = createEditor(
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

      const editor = createEditor();
      editor.selection = input.selection;
      editor.children = input.children;

      const above = editor.api.block() as any;
      expect(getNextSiblingNodes(above, input.selection!.anchor.path)).toEqual(
        []
      );
    });
  });

  describe('when has siblings', () => {
    it('should return sibling nodes', () => {
      const input = createEditor(
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

      const above = editor.api.block()!;

      expect(getNextSiblingNodes(above, input.selection!.anchor.path)).toEqual(
        output
      );
    });
  });
});
