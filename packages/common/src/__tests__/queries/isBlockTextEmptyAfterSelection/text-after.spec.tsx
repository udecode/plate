/** @jsx jsx */

import { withInlineVoid } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { ELEMENT_LINK } from '../../../../../slate-plugins/src/elements/link/defaults';
import { isBlockTextEmptyAfterSelection } from '../../../queries/isBlockTextEmptyAfterSelection';

const input = ((
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
      last
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
