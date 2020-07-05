/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { getRangeBefore } from '../../../queries/getRangeBefore';

const input = ((
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any) as Editor;

const output = undefined;

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
