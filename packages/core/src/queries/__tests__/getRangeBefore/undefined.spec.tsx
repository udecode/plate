/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getRangeBefore } from '../../../../../slate-utils/src/queries/getRangeBefore';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any) as PlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
