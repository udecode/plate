/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getBlockAbove } from '../../../../../slate-utils/src/queries';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hh1>
      <hp>
        test
        <cursor />
      </hp>
    </hh1>
  </editor>
) as any) as PlateEditor;

const output = <hp>test</hp>;

it('should be', () => {
  expect(getBlockAbove(input)).toEqual([output, [0, 0]]);
});
