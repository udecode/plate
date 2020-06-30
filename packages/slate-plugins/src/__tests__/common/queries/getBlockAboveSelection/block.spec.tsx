/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { getBlockAboveSelection } from '../../../../common/queries';

const input = ((
  <editor>
    <hh1>
      <hp>
        test
        <cursor />
      </hp>
    </hh1>
  </editor>
) as any) as Editor;

const output = <hp>test</hp>;

it('should be', () => {
  expect(getBlockAboveSelection(input)).toEqual([output, [0, 0]]);
});
