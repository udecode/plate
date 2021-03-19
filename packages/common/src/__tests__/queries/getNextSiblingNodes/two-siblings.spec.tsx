/** @jsx jsx */

import { withInlineVoid } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Range } from 'slate';
import { ELEMENT_LINK } from '../../../../../slate-plugins/src/elements/link/defaults';
import { getBlockAbove } from '../../../queries/getBlockAbove';
import { getNextSiblingNodes } from '../../../queries/getNextSiblingNodes';

const input = ((
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
) as any) as Editor;

const output = [<htext />, <htext>last</htext>];

it('should be', () => {
  const above = getBlockAbove(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
  ) as any;

  expect(
    getNextSiblingNodes(above, (input.selection as Range).anchor.path)
  ).toEqual(output);
});
