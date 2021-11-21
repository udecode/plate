/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../types/PlateEditor';
import { getPointFromLocation } from '../../../queries/getPointFromLocation';

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
  offset: 4,
  path: [0, 0],
};

it('should be', () => {
  expect(getPointFromLocation(input, { at: output })).toEqual(output);
});
