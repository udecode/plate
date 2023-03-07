/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { selectEndOfBlockAboveSelection } from '../../../../../slate-utils/src/transforms';
import { PlateEditor } from '../../../types/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      te
      <cursor />
      st
    </hp>
  </editor>
) as any) as PlateEditor;

it('should be', () => {
  selectEndOfBlockAboveSelection(input);
  expect(input.selection?.anchor).toEqual({
    offset: 4,
    path: [0, 0],
  });
});
