/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../../types/PlateEditor';
import { getPointBefore } from '../../../../queries/getPointBefore';

jsx;

const input = ((
  <editor>
    <hp>
      test http://google.com
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = { offset: 5, path: [0, 0] };

it('should be', () => {
  expect(
    getPointBefore(input, input.selection as any, {
      matchString: ' ',
      afterMatch: true,
      skipInvalid: true,
    })
  ).toEqual(output);
});
