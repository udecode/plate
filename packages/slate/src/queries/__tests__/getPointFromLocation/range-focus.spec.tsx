/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getPointFromLocation } from '../../getPointFromLocation';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        tes
        <anchor />
        tt
        <focus />
      </hp>
    </editor>
  ) as any
);

const output = {
  offset: 5,
  path: [0, 0],
};

it('should be', () => {
  expect(getPointFromLocation(input, { focus: true })).toEqual(output);
});
