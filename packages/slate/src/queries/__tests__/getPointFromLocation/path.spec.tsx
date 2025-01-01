/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getPointFromLocation } from '../../getPointFromLocation';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any
);

const output = {
  offset: 0,
  path: [0, 0],
};

it('should be', () => {
  expect(getPointFromLocation(input, { at: [0, 0] })).toEqual(output);
});
