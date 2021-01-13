/** @jsx jsx */

import { Descendant, Editor, Range } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_LINK } from '../../../../elements/link/defaults';
import { withInlineVoid } from '../../../plugins/inline-void/withInlineVoid';
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
    </hp>
  </editor>
) as any) as Editor;

const output: Descendant[] = [];

it('should be', () => {
  const above = getBlockAbove(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
  ) as any;
  expect(
    getNextSiblingNodes(above, (input.selection as Range).anchor.path)
  ).toEqual(output);
});
