/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getPointBeforeLocation } from '../../../../../slate-utils/src/queries/getPointBeforeLocation';
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
  offset: 3,
  path: [0, 0],
};

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, { skipInvalid: true })
  ).toEqual(output);
});
