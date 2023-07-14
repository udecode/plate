/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { TDescendant } from '@udecode/slate';
import { Range } from 'slate';

import { getBlockAbove } from '../../getBlockAbove';
import { getNextSiblingNodes } from '../../getNextSiblingNodes';

jsx;

const input = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
    </hp>
  </editor>
) as any as PlateEditor;

const output: TDescendant[] = [];

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  const above = getBlockAbove(editor) as any;
  expect(
    getNextSiblingNodes(above, (input.selection as Range).anchor.path)
  ).toEqual(output);
});
