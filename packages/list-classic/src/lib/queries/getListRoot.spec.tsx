/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { getListRoot } from './getListRoot';

jsxt;

const listRoot = (
  <hul>
    <hli id="2">
      <hp>2</hp>
      <hul>
        <hli>
          <hp>21</hp>
        </hli>
        <hli>
          <hp>
            22
            <cursor />
          </hp>
        </hli>
      </hul>
    </hli>
  </hul>
) as any;

const input = (<editor>{listRoot}</editor>) as any;

it('returns the top-most list containing the current selection', () => {
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });

  const sublist = getListRoot(editor);

  expect(sublist).toEqual([listRoot, [0]]);
});
