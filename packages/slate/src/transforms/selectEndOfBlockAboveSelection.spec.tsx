/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createEditor, selectEndOfBlockAboveSelection } from '..';

jsxt;

const input = createEditor(
  (
    <editor>
      <hp>
        te
        <cursor />
        st
      </hp>
    </editor>
  ) as any
);

it('should be', () => {
  selectEndOfBlockAboveSelection(input);
  expect(input.selection?.anchor).toEqual({
    offset: 4,
    path: [0, 0],
  });
});
