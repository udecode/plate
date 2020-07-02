/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../../__test-utils__/jsx';
import { getPointBefore } from '../../../../queries/getPointBefore';

const input = ((
  <editor>
    <hp>
      test http://localhost:3000
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = undefined;

it('should be', () => {
  expect(
    getPointBefore(input, input.selection, {
      matchString: '3',
      skipInvalid: false,
    })
  ).toEqual(output);
});
