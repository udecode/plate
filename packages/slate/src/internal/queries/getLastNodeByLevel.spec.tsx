/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../createTEditor';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hh1>
        <hp>test</hp>
      </hh1>
      <hh1>
        <hp>test2</hp>
      </hh1>
    </editor>
  ) as any
);

const output = <hp>test2</hp>;

it('should be', () => {
  expect(input.api.lastByLevel(1)).toEqual([output, [1, 0]]);
});
