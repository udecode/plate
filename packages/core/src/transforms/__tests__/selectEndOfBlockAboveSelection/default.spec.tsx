/** @jsx jsx */

import { PlateEditor } from '@/packages/core/src/types/PlateEditor';
import { selectEndOfBlockAboveSelection } from '@/packages/slate-utils/src/index';
import { jsx } from '@udecode/plate-test-utils';

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
