/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getRangeBefore } from '../../getRangeBefore';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        <cursor />
        test
      </hp>
    </editor>
  ) as any
);

const output = undefined;

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
