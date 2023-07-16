/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

import { getRangeBefore } from '../../getRangeBefore';

jsx;

const input = (
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any as PlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
