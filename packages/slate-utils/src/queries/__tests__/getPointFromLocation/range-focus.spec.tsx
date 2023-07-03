/** @jsx jsx */

import { getPointFromLocation } from '@/packages/slate-utils/src/queries/getPointFromLocation';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      tes
      <anchor />
      tt
      <focus />
    </hp>
  </editor>
) as any as PlateEditor;

const output = {
  offset: 5,
  path: [0, 0],
};

it('should be', () => {
  expect(getPointFromLocation(input, { focus: true })).toEqual(output);
});
