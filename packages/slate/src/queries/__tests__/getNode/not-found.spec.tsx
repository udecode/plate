/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { type TEditor, getNode } from '../../../interfaces';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as TEditor;

it('should be', () => {
  expect(getNode(input, [0, 0, 0])).toBeNull();
});
