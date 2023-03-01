/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getPointFromLocation } from '../../../../../slate-utils/src/queries/getPointFromLocation';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = {
  path: [0, 0],
  offset: 0,
};

it('should be', () => {
  expect(getPointFromLocation(input, { at: [0, 0] })).toEqual(output);
});
