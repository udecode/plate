/** @jsx jsxt */

import { BaseParagraphPlugin, createEditor } from '@udecode/plate';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

jsxt;

it('should be', async () => {
  const input = createEditor(
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

  const editor = createPlateEditor({
    plugins: [BaseParagraphPlugin, IndentPlugin, BaseIndentListPlugin],
    selection: input.selection,
    shouldNormalizeEditor: true,
    value: input.children,
  });

  expect(editor.children).toEqual(output.children);
});

it('should start from 2', async () => {
  const input = createEditor(
    (
      <editor>
        <hp>1</hp>
        <hp indent={1} listStart={2} listStyleType="decimal">
          2
        </hp>
      </editor>
    ) as any
  );

  const output = (
    <editor>
      <hp>1</hp>
      <hp indent={1} listStart={2} listStyleType="decimal">
        2
      </hp>
    </editor>
  ) as any;

  const editor = createPlateEditor({
    plugins: [BaseParagraphPlugin, IndentPlugin, BaseIndentListPlugin],
    selection: input.selection,
    shouldNormalizeEditor: true,
    value: input.children,
  });

  expect(editor.children).toEqual(output.children);
});
