/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';
import { selectEndOfBlockAboveSelection } from '@udecode/slate-utils';

import type { SlateEditor } from '../../../editor';

jsxt;

const input = (
  <editor>
    <hp>
      te
      <cursor />
      st
    </hp>
  </editor>
) as any as SlateEditor;

it('should be', () => {
  selectEndOfBlockAboveSelection(input);
  expect(input.selection?.anchor).toEqual({
    offset: 4,
    path: [0, 0],
  });
});
