/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Descendant, Editor, Range } from 'slate';
import { ELEMENT_LINK } from '../../../../../slate-plugins/src/elements/link/defaults';
import { withInlineVoid } from '../../../../../slate-plugins/src/plugins/withInlineVoid/withInlineVoid';
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
