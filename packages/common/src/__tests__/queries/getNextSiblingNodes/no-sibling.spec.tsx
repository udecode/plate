/** @jsx jsx */

import { PlateEditor, TDescendant, withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { ELEMENT_LINK } from '../../../../../elements/link/src/createLinkPlugin';
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
  const above = getBlockAbove(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
  ) as any;
  expect(
    getNextSiblingNodes(above, (input.selection as Range).anchor.path)
  ).toEqual(output);
});
