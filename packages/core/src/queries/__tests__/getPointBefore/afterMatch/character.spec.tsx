/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Value } from '../../../../slate/editor/TEditor';
import { PlateEditor } from '../../../../types/plate/PlateEditor';
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

const output = { offset: 5, path: [0, 0] };

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      matchString: ' ',
      afterMatch: true,
      skipInvalid: true,
    })
  ).toEqual(output);
});
