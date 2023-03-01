/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getPointFromLocation } from '../../../../../slate-utils/src/queries/getPointFromLocation';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      tes
      <anchor />
      tt
      <focus />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = {
  offset: 5,
  path: [0, 0],
};

it('should be', () => {
  expect(getPointFromLocation(input, { focus: true })).toEqual(output);
});
