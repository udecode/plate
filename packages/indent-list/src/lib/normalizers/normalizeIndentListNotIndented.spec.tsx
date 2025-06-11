/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { IndentPlugin } from '@platejs/indent/react';
import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

jsxt;

describe('normalizeIndentList', () => {
  describe('when listStyleType without indent', () => {
    it('should remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp listStart={1} listStyleType="disc">
            1
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp>1</hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseIndentListPlugin, IndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      expect(editor.children).toEqual(output.children);
    });
  });
});
