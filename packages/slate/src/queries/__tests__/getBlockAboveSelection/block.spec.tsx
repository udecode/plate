/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getBlockAbove } from '../../getBlockAbove';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hh1>
        <hp>
          test
          <cursor />
        </hp>
      </hh1>
    </editor>
  ) as any
);

const output = <hp>test</hp>;

it('should be', () => {
  expect(getBlockAbove(input)).toEqual([output, [0, 0]]);
});
