/** @jsx jsx */

import {
  createPlateEditor,
  getBlockAbove,
  PlateEditor,
} from '@udecode/plate-common';
import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';

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
      <htext />
      <htext>last</htext>
    </hp>
  </editor>
) as any as PlateEditor;

const output = [<htext />, <htext>last</htext>];

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
