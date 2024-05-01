/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { selectEndOfBlockAboveSelection } from '@udecode/slate-utils';

jsx;

const input = (
  <editor>
    <hp>
      te
      <cursor />
      st
    </hp>
  </editor>
) as any as PlateEditor;

it('should be', () => {
  selectEndOfBlockAboveSelection(input);
  expect(input.selection?.anchor).toEqual({
    offset: 4,
    path: [0, 0],
  });
});
