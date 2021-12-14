/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { createParagraphPlugin } from '../../../paragraph/src/createParagraphPlugin';
import { createIndentListPlugin } from '../createIndentListPlugin';

jsx;

const input = ((
  <editor>
    <hp indent={1} listStyleType="decimal">
      one
    </hp>
    <hp indent={1} listStyleType="decimal">
      two
    </hp>
    <hp indent={2} listStyleType="lower-alpha">
      a
    </hp>
    <hp indent={2} listStyleType="lower-alpha">
      b
    </hp>
    <hp indent={1} listStyleType="disc">
      one
    </hp>
    <hp indent={1} listStyleType="disc">
      two
    </hp>
    <hp indent={2} listStyleType="disc">
      three
    </hp>
    <hp indent={3} listStyleType="disc">
      four
    </hp>
    <hp indent={3}>Sub paragraph</hp>
    <hp indent={1} listStyleType="disc">
      Same list
    </hp>
    <hp indent={1} listStyleType="disc">
      Different list adjacent to the one above.
    </hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hp indent={1} listStyleType="decimal">
      one
    </hp>
    <hp indent={1} listStyleType="decimal" listStart={2}>
      two
    </hp>
    <hp indent={2} listStyleType="lower-alpha">
      a
    </hp>
    <hp indent={2} listStyleType="lower-alpha" listStart={2}>
      b
    </hp>
    <hp indent={1} listStyleType="disc">
      one
    </hp>
    <hp indent={1} listStyleType="disc" listStart={2}>
      two
    </hp>
    <hp indent={2} listStyleType="disc">
      three
    </hp>
    <hp indent={3} listStyleType="disc">
      four
    </hp>
    <hp indent={3}>Sub paragraph</hp>
    <hp indent={1} listStyleType="disc" listStart={3}>
      Same list
    </hp>
    <hp indent={1} listStyleType="disc" listStart={4}>
      Different list adjacent to the one above.
    </hp>
  </editor>
) as any) as Editor;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [
      createParagraphPlugin(),
      createIndentPlugin(),
      createIndentListPlugin(),
    ],
  });

  Editor.normalize(editor, { force: true });

  expect(editor.children).toEqual(output.children);
});
