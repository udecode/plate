/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_LINK } from '../../../../elements/link/defaults';
import { withInlineVoid } from '../../../plugins/inline-void/withInlineVoid';
import { isBlockTextEmptyAfterSelection } from '../../../queries/isBlockTextEmptyAfterSelection';

const input = ((
  <editor>
    <hp>
      <htext>first</htext>
      <ha>test</ha>
    </hp>
  </editor>
) as any) as Editor;

const output = false;

it('should be', () => {
  expect(
    isBlockTextEmptyAfterSelection(
      withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
    )
  ).toEqual(output);
});
