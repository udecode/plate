/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { isCollapsed } from '../../../interfaces';

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

const output = true;

it('should be', () => {
  expect(isCollapsed(input.selection)).toBe(output);
});
