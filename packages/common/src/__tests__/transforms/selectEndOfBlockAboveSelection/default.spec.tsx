/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { selectEndOfBlockAboveSelection } from '../../../transforms/index';

jsx;

const input = ((
  <editor>
    <hp>
      te
      <cursor />
      st
    </hp>
  </editor>
) as any) as Editor;

it('should be', () => {
  selectEndOfBlockAboveSelection(input);
  expect(input.selection?.anchor).toEqual({
    offset: 4,
    path: [0, 0],
  });
});
