/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { getLastNode } from '../../../queries/index';

const input = (
  <editor>
    <hh1>
      <hp>test</hp>
    </hh1>
    <hh1>
      <hp>test2</hp>
    </hh1>
  </editor>
) as any;

const output = <hp>test2</hp>;

it('should be', () => {
  expect(getLastNode(input, 1)).toEqual([output, [1, 0]]);
});
