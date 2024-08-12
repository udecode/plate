/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { IndentPlugin } from '@udecode/plate-indent';
import { ParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { IndentListPlugin } from '../IndentListPlugin';

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
    plugins: [ParagraphPlugin, IndentPlugin, IndentListPlugin],
    shouldNormalizeEditor: true,
  });

  expect(editor.children).toEqual(output.children);
});
