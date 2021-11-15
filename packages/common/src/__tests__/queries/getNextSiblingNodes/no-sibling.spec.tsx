/** @jsx jsx */

import {
  createPlateEditor,
  PlateEditor,
  TDescendant,
} from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { createLinkPlugin } from '../../../../../elements/link/src/createLinkPlugin';
import { getBlockAbove } from '../../../queries/getBlockAbove';
import { getNextSiblingNodes } from '../../../queries/getNextSiblingNodes';

jsx;

const input = ((
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
    </hp>
  </editor>
) as any) as PlateEditor;

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
