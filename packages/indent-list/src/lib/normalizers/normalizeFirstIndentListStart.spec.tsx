/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { BaseParagraphPlugin } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsx } from '@udecode/plate-test-utils';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

jsx;

const input = (
  <editor>
    <hp>1</hp>
    <hp indent={1} listStart={1} listStyleType="disc">
      2
    </hp>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hp>1</hp>
    <hp indent={1} listStyleType="disc">
      2
    </hp>
  </editor>
) as any as SlateEditor;

it('should be', async () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [BaseParagraphPlugin, IndentPlugin, BaseIndentListPlugin],
    shouldNormalizeEditor: true,
  });

  expect(editor.children).toEqual(output.children);
});
