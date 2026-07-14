/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';

jsxt;

describe('normalizeList', () => {
  describe('when listStyleType without indent', () => {
    it('remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp listStart={1} listStyleType="disc">
            1
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>1</hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });
});
