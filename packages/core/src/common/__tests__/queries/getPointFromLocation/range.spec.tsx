/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Value } from '../../../../slate/editor/TEditor';
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
  expect(getPointFromLocation(input)).toEqual(output);
});
