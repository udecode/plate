/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Value } from '../../../../../slate/editor/TEditor';
import { PlateEditor } from '../../../../../types/PlateEditor';
import { getPointBeforeLocation } from '../../../../queries/getPointBeforeLocation';

jsx;

const input = ((
  <editor>
    <hp>
      find **test
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = {
  offset: 7,
  path: [0, 0],
};

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      skipInvalid: true,
      afterMatch: true,
      matchString: '**',
    })
  ).toEqual(output);
});
