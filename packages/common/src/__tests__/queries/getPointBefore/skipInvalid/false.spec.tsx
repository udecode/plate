/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { getPointBefore } from '../../../../queries/getPointBefore';

jsx;

const input = ((
  <editor>
    <hp>
      test http://google.com
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = undefined;

it('should be', () => {
  expect(
    getPointBefore(input, input.selection as any, {
      matchString: '3',
      skipInvalid: false,
    })
  ).toEqual(output);
});
