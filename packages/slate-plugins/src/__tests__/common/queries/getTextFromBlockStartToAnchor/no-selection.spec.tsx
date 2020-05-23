/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { getTextFromBlockStartToAnchor } from 'common/queries';
import { Editor } from 'slate';

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const output = {
  text: '',
};

it('should be', () => {
  expect(getTextFromBlockStartToAnchor(input)).toEqual(output);
});
