/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { getRangeBefore } from '../../getRangeBefore';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as TEditor;

const output = {
  anchor: {
    offset: 3,
    path: [0, 0],
  },
  focus: {
    offset: 4,
    path: [0, 0],
  },
};

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
