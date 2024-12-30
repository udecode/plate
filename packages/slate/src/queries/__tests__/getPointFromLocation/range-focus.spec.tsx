/** @jsx jsxt */

import type { TEditor } from '../../../interfaces';;

import { jsxt } from '@udecode/plate-test-utils';

import { getPointFromLocation } from '../../getPointFromLocation';

jsxt;

const input = (
  <editor>
    <hp>
      tes
      <anchor />
      tt
      <focus />
    </hp>
  </editor>
) as any as TEditor;

const output = {
  offset: 5,
  path: [0, 0],
};

it('should be', () => {
  expect(getPointFromLocation(input, { focus: true })).toEqual(output);
});
