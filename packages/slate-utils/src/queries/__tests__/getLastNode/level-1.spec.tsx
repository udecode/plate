/** @jsx jsx */

import { getLastNodeByLevel } from '@/packages/slate-utils/src/queries/index';
import { jsx } from '@udecode/plate-test-utils';

jsx;

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
  expect(getLastNodeByLevel(input, 1)).toEqual([output, [1, 0]]);
});
