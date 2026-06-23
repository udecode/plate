/** @jsx jsxt */

import { type BasePlateEditor, createBasePlateEditor } from 'platejs';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { normalizeListNotIndented } from './normalizeListNotIndented';

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
      ) as any as BasePlateEditor;

      const output = (
        <editor>
          <hp>1</hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createBasePlateEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      normalizeListNotIndented(editor, [editor.children[0], [0]]);

      expect(editor.children).toEqual(output.children);
    });
  });
});
