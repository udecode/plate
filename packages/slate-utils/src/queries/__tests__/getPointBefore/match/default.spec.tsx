/** @jsx jsx */

import { getPointBeforeLocation } from '@/packages/slate-utils/src/queries/getPointBeforeLocation';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as PlateEditor;

const output = {
  offset: 3,
  path: [0, 0],
};

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      match: () => true,
      unit: 'offset',
      afterMatch: true,
    })
  ).toEqual(output);
});
