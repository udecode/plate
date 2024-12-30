/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { type TEditor, isCollapsed } from '../../../interfaces';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as TEditor;

const output = true;

it('should be', () => {
  expect(isCollapsed(input.selection)).toBe(output);
});
