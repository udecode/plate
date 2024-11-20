/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { jsxt } from '@udecode/plate-test-utils';

import { getBlockAbove } from '../../getBlockAbove';

jsxt;

const input = (
  <editor>
    <hh1>
      <hp>
        test
        <cursor />
      </hp>
    </hh1>
  </editor>
) as any as SlateEditor;

const output = <hp>test</hp>;

it('should be', () => {
  expect(getBlockAbove(input)).toEqual([output, [0, 0]]);
});
