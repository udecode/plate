/** @jsx jsx */

import { getPointBeforeLocation } from '@/packages/slate-utils/src/queries/getPointBeforeLocation';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>find z</hp>
    <hp>
      test http://google.com
      <cursor />
    </hp>
  </editor>
) as any as PlateEditor;

const output = undefined;

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      matchString: 'z',
      skipInvalid: true,
    })
  ).toEqual(output);
});
