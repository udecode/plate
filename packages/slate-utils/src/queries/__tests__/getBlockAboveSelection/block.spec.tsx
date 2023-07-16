/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { getBlockAbove } from '../../getBlockAbove';

jsx;

const input = (
  <editor>
    <hh1>
      <hp>
        test
        <cursor />
      </hp>
    </hh1>
  </editor>
) as any as PlateEditor;

const output = <hp>test</hp>;

it('should be', () => {
  expect(getBlockAbove(input)).toEqual([output, [0, 0]]);
});
