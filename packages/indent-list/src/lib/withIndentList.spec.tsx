/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseIndentListPlugin } from './BaseIndentListPlugin';

jsxt;

describe('normalizeIndentList', () => {
  describe('when listStyleType without indent', () => {
    it('should remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            <cursor />
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp>
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [BaseIndentListPlugin, IndentPlugin],
        shouldNormalizeEditor: true,
      });

      editor.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
    });
  });
});
