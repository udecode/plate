/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getPointBeforeLocation } from '../../../../../../slate-utils/src/queries/getPointBeforeLocation';
import { PlateEditor } from '../../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      test http://google.com
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = undefined;

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      matchString: '3',
      skipInvalid: false,
    })
  ).toEqual(output);
});
