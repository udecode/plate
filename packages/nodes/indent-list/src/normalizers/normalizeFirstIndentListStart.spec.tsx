/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';

import { createIndentListPlugin } from '@/nodes/indent-list/src/createIndentListPlugin';
import { createParagraphPlugin } from '@/nodes/paragraph/src/createParagraphPlugin';

jsx;

const input = (
  <editor>
    <hp>1</hp>
    <hp indent={1} listStyleType="disc" listStart={1}>
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
    plugins: [
      createParagraphPlugin(),
      createIndentPlugin(),
      createIndentListPlugin(),
    ],
    normalizeInitialValue: true,
  });

  expect(editor.children).toEqual(output.children);
});
