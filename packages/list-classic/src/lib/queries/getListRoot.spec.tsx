/** @jsx jsxt */

import { createEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

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

it('should be', () => {
  const sublist = getListRoot(
    createPlateEditor({ editor: createEditor(input) })
  );

  expect(sublist).toEqual([listRoot, [0]]);
});
