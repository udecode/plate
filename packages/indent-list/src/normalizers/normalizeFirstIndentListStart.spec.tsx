/** @jsx jsx */

import { type PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { createIndentListPlugin } from '../createIndentListPlugin';

jsx;

const input = (
  <editor>
    <hp>1</hp>
    <hp indent={1} listStart={1} listStyleType="disc">
      2
    </hp>
  </editor>
) as any as PlateEditor;

const output = (
  <editor>
    <hp>1</hp>
    <hp indent={1} listStyleType="disc">
      2
    </hp>
  </editor>
) as any as PlateEditor;

it('should be', async () => {
  const editor = createPlateEditor({
    editor: input,
    normalizeInitialValue: true,
    plugins: [
      createParagraphPlugin(),
      createIndentPlugin(),
      createIndentListPlugin(),
    ],
  });

  expect(editor.children).toEqual(output.children);
});
