/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { getBlockAbove } from '../../../queries/index';

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
  expect(getBlockAbove(input)).toEqual([output, [0, 0]]);
});
