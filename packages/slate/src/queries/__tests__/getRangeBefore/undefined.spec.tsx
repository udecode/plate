/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { getRangeBefore } from '../../getRangeBefore';

jsxt;

const input = (
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any as TEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
