/** @jsx jsxt */

import { BaseParagraphPlugin, createTEditor } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>1</hp>
      <hp indent={1} listStart={1} listStyleType="disc">
        2
      </hp>
    </editor>
  ) as any
);

const output = (
  <editor>
    <hp>1</hp>
    <hp indent={1} listStyleType="disc">
      2
    </hp>
  </editor>
) as any;

it('should be', async () => {
  const editor = createPlateEditor({
    plugins: [BaseParagraphPlugin, IndentPlugin, BaseIndentListPlugin],
    selection: input.selection,
    shouldNormalizeEditor: true,
    value: input.children,
  });

  expect(editor.children).toEqual(output.children);
});
