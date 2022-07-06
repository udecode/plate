/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { getRangeBefore } from '../../getRangeBefore';

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
