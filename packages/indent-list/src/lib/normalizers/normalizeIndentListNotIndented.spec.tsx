/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';

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
        editor: input,
        plugins: [BaseIndentListPlugin, IndentPlugin],
        shouldNormalizeEditor: true,
      });

      expect(editor.children).toEqual(output.children);
    });
  });
});
