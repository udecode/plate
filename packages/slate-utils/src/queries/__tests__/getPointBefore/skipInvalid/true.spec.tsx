/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../../../core/src/types/PlateEditor';
import { getPointBeforeLocation } from '../../../getPointBeforeLocation';

jsx;

const input = ((
  <editor>
    <hp>
      test http://google.com
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = { offset: 4, path: [0, 0] };

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      matchString: ' ',
      skipInvalid: true,
    })
  ).toEqual(output);
});
