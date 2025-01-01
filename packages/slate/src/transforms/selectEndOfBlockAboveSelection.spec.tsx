/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor, selectEndOfBlockAboveSelection } from '..';

jsxt;

const input = createTEditor(
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
