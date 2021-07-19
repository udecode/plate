/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { getRangeBefore } from '../../../queries/getRangeBefore';

jsx;

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
