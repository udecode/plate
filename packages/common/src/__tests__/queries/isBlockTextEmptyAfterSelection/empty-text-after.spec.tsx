/** @jsx jsx */

import { SPEditor, withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_LINK } from '../../../../../elements/link/src/defaults';
import { isBlockTextEmptyAfterSelection } from '../../../queries/isBlockTextEmptyAfterSelection';

jsx;

const input = ((
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
      <htext />
    </hp>
  </editor>
) as any) as SPEditor;

const output = true;

it('should be', () => {
  expect(
    isBlockTextEmptyAfterSelection(
      withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
    )
  ).toEqual(output);
});
