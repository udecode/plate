/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Value } from '../../../../slate/editor/TEditor';
import { PlateEditor } from '../../../../types/plate/PlateEditor';
import { getPointBeforeLocation } from '../../../getPointBeforeLocation';

jsx;

const input = ((
  <editor>
    <hp>find z</hp>
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
      matchString: 'z',
      skipInvalid: true,
    })
  ).toEqual(output);
});
